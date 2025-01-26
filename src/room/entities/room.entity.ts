import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CATEGORIES {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  CABIN = 'Cabin',
  TENT = 'Tent',
}

@Schema({
  timestamps: true,
})
export class Room extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true, 
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    maxLength: 150,
    trim: true,
  })
  title: string;

  @Prop({
    type: String,
    enum: CATEGORIES,
    required: true, 
  })
  category: string;

  @Prop({
    type: {
      country: {
        type: String,
        required: true,
        trim: true,
      },
      street_address: {
        type: String,
        required: true,
        trim: true,
      },
      floor: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      postal_code: {
        type: String,
        required: true,
        trim: true,
      },
    },
  })
  location: {
    country: string;
    street_address: string;
    floor: string;
    city: string;
    state: string;
    postal_code: string;
  };

  @Prop({
    type: Number,
    min: 1,
  })
  max_number_of_guests: number;

  @Prop({
    type: Number,
    min: 1,
  })
  number_of_rooms: number;

  @Prop({
    type: Number,
    min: 1,
  })
  number_of_beds: number;

  @Prop({
    type: Number,
    min: 1,
  })
  number_of_bathrooms: number;

  @Prop({
    type: [String],
    default: [],
  })
  amenities: string[];

  @Prop({
    type: [String],
    required: true,
  })
  images: string[];

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: Number,
  })
  price: number;

  @Prop({
    type: Number,
    min: 0,
    max: 100,
    default: 0,

  })
  discount: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_published: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
