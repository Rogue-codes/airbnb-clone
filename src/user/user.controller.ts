import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { ResendTokenDto, VerifyEmailDto } from './dto/verifyEmail.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserGuard } from 'src/guards/user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const result = await this.userService.create(createUserDto);
      return res.status(200).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.verifyEmail(verifyEmailDto);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('resend-otp')
  async resendOtp(
    @Body() resendTokenDto: ResendTokenDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.resendOTP(resendTokenDto);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() resendTokenDto: ResendTokenDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.forgotPassword(resendTokenDto);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.resetPassword(resetPasswordDto);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Patch('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const result = await this.userService.updatePassword(
        req.user,
        updatePasswordDto,
      );
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userService.findOne(id);
      return res.status(200).json({
        success: true,
        message: 'user retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Get('account/me')
  async getMe( @Res() res: Response, @Req() req) {
    try {
      const result = await this.userService.getMe(req.user);
      return res.status(200).json({
        success: true,
        message: 'user retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }


  @UseGuards(UserGuard)
  @Patch('update')
  async update(@Body() updateUserDto: UpdateUserDto, @Res() res, @Req() req) {
    try {
      const result = await this.userService.update(req.user, updateUserDto);
      return res.status(200).json({
        success: true,
        message: 'user updated successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('deactivate/:id')
  async deactivate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userService.deactivate(id);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('activate/:id')
  async activate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userService.activate(id);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
