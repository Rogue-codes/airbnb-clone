import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';

export class Wallet extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
      })
      user: MongooseSchema.Types.ObjectId;
    
      @Prop({
        type: Number,
        default:0
      })
      balance: number;
}


export const WalletSchema = SchemaFactory.createForClass(Wallet);
