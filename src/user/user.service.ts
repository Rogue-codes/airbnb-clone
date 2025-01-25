import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import mongoose from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { GenerateOTPEvent } from 'src/events/GenerateOTP.event';
import { Cache } from 'cache-manager';
import { EmailService } from 'src/email/email.service';
import { CreateWalletEvent } from 'src/events/CreateWallet.event';
import { WalletService } from 'src/wallet/wallet.service';
import { ResendTokenDto, VerifyEmailDto } from './dto/verifyEmail.dto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<User>,
    private readonly eventEmitter: EventEmitter2,
    @Inject('CACHE_MANAGER')
    private cacheManager: Cache,
    private emailService: EmailService,
    private walletService: WalletService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    await Promise.all([
      this.validateExistingEntries('phone', createUserDto.phone),
      this.validateExistingEntries('email', createUserDto.email),
    ]);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    this.eventEmitter.emit(
      'handle-otp-generation',
      new GenerateOTPEvent(newUser),
    );
  }

  async generateOtp(payload: GenerateOTPEvent) {
    const token = this.genRandomOTP();

    const hashedToken = await bcrypt.hash(token, 10);

    const cacheKey = `user:${payload.user.email}`;

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      await this.cacheManager.del(cacheKey);
      await this.cacheManager.set(cacheKey, hashedToken, 86400000);
    } else {
      await this.cacheManager.set(cacheKey, hashedToken, 86400000);
    }

    await this.emailService.sendAccountVerificationMail(payload.user, token);

    console.log('OTP sent successfully.');
  }

  async createWallet(payload: CreateWalletEvent) {
    await this.walletService.create(payload.userId);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const cacheKey = `user:${verifyEmailDto.email}}`;
    const cachedToken: string = await this.cacheManager.get(
      `user:${verifyEmailDto.email}`,
    );

    console.log('cached token', cacheKey);
    if (!cachedToken) {
      throw new NotFoundException('token not found');
    }

    const isTokenValid = await bcrypt.compare(
      verifyEmailDto.token,
      cachedToken,
    );

    if (!isTokenValid) {
      throw new NotFoundException('invalid token');
    }

    const user = await this.userModel.findOne({
      email: verifyEmailDto.email,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    user.isVerified = true;
    user.isActive = true;

    await user.save();

    return 'email verified successfully';
  }

  async resendOTP(resendEmailDto: ResendTokenDto) {
    const { email } = resendEmailDto;
    // verify user in the db
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException();
    }

    if (user.isVerified) {
      throw new BadRequestException('Account has already been verified');
    }

    this.eventEmitter.emit('handle-otp-generation', new GenerateOTPEvent(user));

    return `Otp generated and sent to email: ${email}`;
  }

  async forgotPassword(payload: ResendTokenDto) {
    const { email } = payload;

    // verify user
    const user = await this.getUser('email', email);

    this.eventEmitter.emit('handle-otp-generation', new GenerateOTPEvent(user));

    return `A password reset Otp has been generated and sent to email: ${email}`;
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { confirmPassword, email, password, otp } = payload;

    console.log('email', email);

    if (confirmPassword !== password) {
      throw new BadRequestException('confirmPassword and password must match');
    }
    // get user
    const user = await this.getUser('email', email);

    const cacheKey = `user:${email}`;

    const cachedOtp: string = await this.cacheManager.get(cacheKey);

    console.log('first', cachedOtp);

    const isValidOtp = await bcrypt.compare(otp, cachedOtp);

    if (!isValidOtp) {
      throw new NotFoundException('Invalid otp');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    return 'password has been reset successfully';
  }

  async updatePassword(user_: any, updatePasswordDto: UpdatePasswordDto) {
    const { confirmPassword, password } = updatePasswordDto;

    if (confirmPassword !== password) {
      throw new BadRequestException('Password and confirm password must match');
    }

    const user = await this.getUser('email', user_.email);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    return 'password has been updated successfully';
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getMe(user_: any) {
    const user = await this.getUser('email', user_.email);
    return user;
  }

  async update(user_: any, updateUserDto: UpdateUserDto) {
    console.log('user', user_)
    const user = await this.getUser('_id', user_.id);

    const updatedUser = await this.userModel.findByIdAndUpdate(user.id, updateUserDto, {
      new: true,
      runValidator: true,
    });

    return updatedUser;
  }

  async deactivate(id: string) {
    const user = await this.getUser('_id', id);
    if (!user.isActive) {
      throw new BadRequestException('User is already inactive');
    }
    user.isActive = false;
    await user.save();
    return 'user deactivated successfully';
  }

  async activate(id: string) {
    const user = await this.getUser('_id', id);
    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }
    user.isActive = true;
    await user.save();
    return 'user activated successfully';
  }
  
  async validateExistingEntries(field: keyof CreateUserDto, value) {
    const existingEntry = await this.userModel.findOne({
      [field]: value,
    });

    if (existingEntry) {
      throw new ConflictException(
        `user with ${field}: ${value} already exists`,
      );
    }
  }

  async isValidUser(key: string, value: string): Promise<boolean> {
    const existingUser = await this.userModel.findOne({
      key: value,
    });

    if (!existingUser) {
      throw new NotFoundException();
    } else {
      return true;
    }
  }

  async getUser(key: string, value: string): Promise<User> {
    const user = await this.userModel.findOne({
      [key]: value,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  genRandomOTP(): string {
    const token = Math.floor(Math.random() * 10000).toString();
    return token;
  }

  @OnEvent('handle-otp-generation')
  async otpGenEvent(payload: GenerateOTPEvent) {
    await this.generateOtp(payload);
  }
}
