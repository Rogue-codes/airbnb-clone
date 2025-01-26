import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { IUser } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './entities/room.entity';
import mongoose from 'mongoose';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: mongoose.Model<Room>,
  ) {}
  async create(user: IUser, createRoomDto: CreateRoomDto) {
    // validate that there are no room duplicates for the same user.
    const isValidRoomTitle = await this.isValidRoomTitle(
      user.id,
      createRoomDto.title,
    );

    if (!isValidRoomTitle) {
      throw new ConflictException(
        `room title: ${createRoomDto.title} already exist for this user.`,
      );
    }

    const newRoom = await this.roomModel.create({
      ...createRoomDto,
      userId: user.id,
    });

    return newRoom;
  }

  async publish(user: IUser, id: string) {
    const room = await this.getRoom(id);

    if (user.id !== room.userId.toString()) {
      throw new UnauthorizedException(
        "you're not allowed to perform this operation",
      );
    }

    if (room.is_published) {
      throw new BadRequestException(
        "Room has already been published. create a new room instead...",
      );
    }

    room.is_published = true;
    await room.save();

    return room;
  }

  async findAllUserRooms(user:IUser) {
    const rooms = await this.roomModel.find({
      userId: user.id,
      is_published: true
    })

    return rooms;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  async isValidRoomTitle(userId: string, title: string):Promise<boolean> {
    const room = await this.roomModel.findOne({
      userId,
      title,
    });

    if (!room) {
      return true;
    } else {
      false;
    }
  }

  async getRoom(id: string): Promise<Room> {
    const room = await this.roomModel.findById(id);

    if (!room) {
      throw new NotFoundException('room not found');
    }

    return room;
  }
}
