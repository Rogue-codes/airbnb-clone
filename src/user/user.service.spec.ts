import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/mongoose';


describe("UserService", () => {
  let userService: UserService;
  let model : Model<User>

  jest.mock('src/events/GenerateOTP.event', () => {
    return {
      GenerateOTPEvent: jest.fn(),
    };
  });

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    firstName: 'Nnamdi',
    lastName: 'Osuji',
    email: 'nnamdidanielosuji@gmail.com',
    phone: '09098898909',
    country: "Ghana",
    DOB: "1999-09-08"
  };

  const mockUserService = {
    getUser: jest.fn()
  }

  beforeEach (async ()=>{
    const module: TestingModule = await Test.createTestingModule({
      providers:[
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserService
        }
      ]
    }).compile();

    userService = module.get<UserService>(UserService); 
    model = module.get<Model<User>>(getModelToken(User.name)) 
  })

  describe("getUser",  () => {
    it('should find and return a user', async() =>{
      jest.spyOn(model, "findById").mockResolvedValue(mockUser);
      const result = await userService.getUser("id",mockUser._id)

      expect(model.findById).toHaveBeenCalledWith(mockUser._id) 
      expect(result).toEqual(mockUser)
    })
  })
})
