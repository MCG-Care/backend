/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../user.schema';
import mongoose, { Model } from 'mongoose';
import { CreateTechnicianDto } from '../dtos/create-techinicians.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateTechnicianDto } from '../dtos/update-technicians.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly jwtService: JwtService,
  ) {}
  public async signUpTechnician(createTechnicianDto: CreateTechnicianDto) {
    const { name, email, password, skills, availableSlots } =
      createTechnicianDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error('User with email already exist');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.TECHNICIAN,
      skills,
      availableSlots,
    });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      availableSlots: user.availableSlots,
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        availableSlots: user.availableSlots,
      },
    };
  }

  public async signUpUser(createUserDto: CreateUserDto) {
    const { name, email, password, address, phone } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
      phone,
      address: address
        ? {
            region: address.region,
            township: address.township,
          }
        : undefined,
    });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    };
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
      skills: user.skills ?? [],
      phone: user.phone,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    };
  }

  public async findAllUser() {
    return this.userModel.find();
  }

  public async findUserById(id: string) {
    const isValid = mongoose.isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Please Enter Correct ID');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }

  public async findTechById(id: string) {
    const isValid = mongoose.isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Please Enter Correct ID');
    }
    const technician = await this.userModel.findById(id);
    if (!technician) {
      throw new NotFoundException('Technician Not Found');
    }
    return technician;
  }

  public async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    const isValid = mongoose.isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Please Enter Correct ID');
    }

    // Prepare the update query with dot notation for nested fields
    const updateQuery: any = {};

    // Handle regular fields (name, email, etc.)
    const { address, ...otherFields } = updateUserDto;

    if (Object.keys(otherFields).length > 0) {
      for (const [key, value] of Object.entries(otherFields)) {
        if (value !== undefined) {
          updateQuery[key] = value;
        }
      }
    }

    // Handle address fields with dot notation
    if (address) {
      for (const [key, value] of Object.entries(address)) {
        if (value !== undefined) {
          updateQuery[`address.${key}`] = value;
        }
      }
    }

    return await this.userModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });
  }

  public async updateTechnicianById(
    id: string,
    updateTechDto: UpdateTechnicianDto,
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid Technician ID');
    }
    const updatedTech = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateTechDto },
      { new: true },
    );

    if (!updatedTech) {
      throw new NotFoundException('Technician Not Found');
    }

    return updatedTech;
  }

  public async deleteUserById(id: string) {
    const isValid = mongoose.isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Please Enter Correct ID');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException('User Not Found');
    }
    return { message: 'User deleted successfully' };
  }

  public async deleteTechById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid Technician ID');
    }

    const deletedTech = await this.userModel.findByIdAndDelete(id);

    if (!deletedTech) {
      throw new NotFoundException('Technician Not Found');
    }

    return { message: 'Technician deleted successfully' };
  }
}
