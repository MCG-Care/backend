import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { CreateTechnicianDto } from '../dtos/create-techinicians.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly jwtService: JwtService,
  ) {}
  public async signUp(createTechnicianDto: CreateTechnicianDto) {
    const { name, email, password, skills, role } = createTechnicianDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error('User with email already exist');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills,
    });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    };

    const token = this.jwtService.sign(payload);
    return { token };
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
