import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import * as lodash from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // validate user
    const user = await this.userService.getUser('email', email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Your account has been deactivated please contact admin',
      );
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Your account has not been verified please verify your account first',
      );
    }

    // verify password match
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const userObject: {
      email: string;
      id: string;
      isVerified: boolean;
      isActive: boolean;
    } = {
      email,
      id: user._id as string,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };

    const token = await this.jwtService.sign(userObject, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return {
      user: lodash.pick(user, [
        '_id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'isActive',
        'isVerified',
        'country',
        'DOB',
      ]),
      token,
    };
  }
}
