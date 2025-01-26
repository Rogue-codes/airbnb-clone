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
        'Room has already been published. create a new room instead...',
      );
    }

    room.is_published = true;
    await room.save();

    return room;
  }

  async findAllUserRooms(
    user: IUser,
    max_price?: number,
    min_price?: number,
    max_num_of_rooms?: number,
    min_num_of_rooms?: number,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Build the query object dynamically based on the provided filters
    const query: Record<string, any> = {
      userId: user.id,
      is_published: true,
    };

    // Add price filters if provided
    if (min_price !== undefined) {
      query.price = { ...query.price, $gte: min_price };
    }
    if (max_price !== undefined) {
      query.price = { ...query.price, $lte: max_price };
    }

    // Add number of rooms filters if provided
    if (min_num_of_rooms !== undefined) {
      query.num_of_rooms = { ...query.num_of_rooms, $gte: min_num_of_rooms };
    }
    if (max_num_of_rooms !== undefined) {
      query.num_of_rooms = { ...query.num_of_rooms, $lte: max_num_of_rooms };
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    const rooms = await this.roomModel
      .find(query)
      .skip(page && limit ? (page - 1) * limit : 0)
      .limit(limit || 10)
      .sort('-createdAt')
      .exec();

      const totalCount = await this.roomModel.countDocuments(query);

    return {
      results: rooms,
      currentPage: page || 1,
      limit: limit || 10,
      totalCount,
      totalPages:Math.ceil(totalCount/(limit || 10)),
    };
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

  async isValidRoomTitle(userId: string, title: string): Promise<boolean> {
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
