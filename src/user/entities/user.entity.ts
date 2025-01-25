import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    required: true,
    type: String,
  })
  firstName: string;

  @Prop({
    required: true,
    type: String,
  })
  lastName: string;

  @Prop({
    unique:true,
    required: true,
    type: String,
  })
  phone: string;

  @Prop({
    required: true,
    type: Date,
  })
  DOB: Date;

  @Prop({
    required: true,
    type: String,
  })
  country: string;

  @Prop({
    unique:true,
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  MFA: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
