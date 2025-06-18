import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Booking, PaymentStatus } from '../booking.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { CompletionStatus } from '../dtos/complete-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
  ) {}

  public async createBooking(createBookingDto: CreateBookingDto) {
    const newBooking = await this.bookingModel.create(createBookingDto);
    return newBooking;
  }

  public async getAllBookings() {
    return this.bookingModel.find();
  }

  public async getBookingsByTechnician(technicianId: string) {
    const bookings = await this.bookingModel.find({
      assignedTechnician: technicianId,
    });
    if (!bookings || bookings.length === 0) {
      throw new NotFoundException('No bookings found for this technician.');
    }
    return bookings;
  }

  private generateTimeSlots(date: Date) {
    const startHour = 9;
    const endHour = 16;
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const slots: string[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);

      //skip past hours
      if (!isToday || slotTime > now) {
        const timeStr = slotTime.toLocaleTimeString('en-Us', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        slots.push(timeStr);
      }
    }
    return slots;
  }

  async getAvailableSlots(date: string) {
    const inputDate = new Date(date);
    const allSlots = this.generateTimeSlots(inputDate);

    const bookings = await this.bookingModel.find({
      bookingDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:59.999Z'),
      },
    });
    const bookedSlots = bookings.map((b) => b.timeSlot);
    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  }

  public async assignTechnician(bookingId: string, technicianId: string) {
    if (
      !Types.ObjectId.isValid(bookingId) ||
      !Types.ObjectId.isValid(technicianId)
    ) {
      throw new Error('Invalid ID Format');
    }
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        assignedTechnician: technicianId,
        status: 'assigned',
      },
      { new: true },
    );
  }

  public async updateBookingStatus(
    bookingId: string,
    technicianId: string,
    serviceFee: number,
    status?: CompletionStatus,
  ) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('booking Not Found');
    }

    const assignedTechnicianId = booking.assignedTechnician?.toString();
    const technicianIdStr = technicianId.toString();

    if (assignedTechnicianId !== technicianIdStr) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    if (status) {
      booking.status = status;
    } else {
      booking.status = 'completed';
    }

    if (typeof serviceFee === 'number') {
      booking.serviceFee = serviceFee;
    }

    booking.paymentStatus = PaymentStatus.PENDING;

    return booking.save();
  }

  public async updateServiceFee(
    bookingId: string,
    newFee: number,
    technicianId: string,
  ) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking Not Found');
    }
    const assignedTechnicianId = booking.assignedTechnician?.toString();
    const technicianIdStr = technicianId.toString();

    if (assignedTechnicianId !== technicianIdStr) {
      throw new ForbiddenException('You are not assigned to this booking');
    }
    booking.serviceFee = newFee;
    // Optionally reset paymentStatus to 'pending' if fee changed after paid
    if (booking.paymentStatus === PaymentStatus.PAID) {
      booking.paymentStatus = PaymentStatus.PENDING;
    }
    return booking.save();
  }
  public async updatePayment(bookingId: string, paymentStatus: PaymentStatus) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking Not Found');
    }
    booking.paymentStatus = paymentStatus;
    return booking.save();
  }
}
