import { User } from "src/user/entities/user.entity";

export class GenerateOTPEvent {
    constructor(
        public readonly user: User,
    ){}
}