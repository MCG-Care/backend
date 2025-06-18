/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateTechnicianDto } from '../dtos/update-technicians.dto';
import { Booking } from 'src/booking/booking.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
  ) {}

  public async findAllTechnicians() {
    return this.userModel.find({ role: 'Technician' });
  }

  public async findTechnicianById(id: string) {
    const technician = await this.userModel.findById(id);
    if (!technician || technician.role !== 'Technician') {
      throw new NotFoundException('Technician Not Found');
    }
    return technician;
  }
  public async updateTechnician(
    id: string,
    updateTechnicianDto: UpdateTechnicianDto,
  ) {
    const updatedTechnician = await this.userModel.findByIdAndUpdate(
      id,
      updateTechnicianDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedTechnician) {
      throw new NotFoundException('Technician Not Found');
    }
    return updatedTechnician;
  }
  public async deleteTechnician(id: string) {
    const assignedBooking = await this.bookingModel.findOne({
      assignedTechnician: id,
    });

    if (assignedBooking) {
      throw new BadRequestException(
        'Technician is assigned to a booking and cannot be deleted',
      );
    }

    const deletedTechnician = await this.userModel.findByIdAndDelete(id);
    if (!deletedTechnician) {
      throw new NotFoundException('Technician Not Found');
    }

    return { message: 'Technician deleted successfully' };
  }
}
