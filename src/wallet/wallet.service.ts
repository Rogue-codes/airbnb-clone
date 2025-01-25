import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './entities/wallet.entity';
import mongoose from 'mongoose';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: mongoose.Model<Wallet>
  ){}
  async create(userId: string) {
    await this.walletModel.create({
      user: userId
    });
  }

}
