import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserGuard } from 'src/guards/user.guard';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Room')
@ApiBearerAuth('access-token')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(UserGuard)
  @Post('create')
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const result = await this.roomService.create(req.user, createRoomDto);
      return res.status(201).json({
        success: true,
        message:
          'Room created successfully. You can now proceed to publish your room',
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
  @Patch('publish/:id')
  async publish(@Param('id') id: string, @Res() res: Response, @Req() req) {
    try {
      const result = await this.roomService.publish(req.user, id);
      return res.status(200).json({
        success: true,
        message: 'Room published successfully.',
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
  @Get('my-rooms')
  async findMyRooms(@Res() res: Response, @Req() req) {
    try {
      const result = await this.roomService.findAllUserRooms(req.user);
      return res.status(200).json({
        success: true,
        message: 'Rooms retrieved successfully.',
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

  // @Get()
  // findAll() {
  //   return this.roomService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
