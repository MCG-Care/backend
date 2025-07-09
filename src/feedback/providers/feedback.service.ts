import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feedback } from '../feedback.schema';
import { Model, Types } from 'mongoose';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { Booking } from 'src/booking/booking.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<Feedback>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
  ) {}

  public async createFeedback(
    userId: string,
    bookingId: string,
    createFeedbackDto: CreateFeedbackDto,
  ) {
    //make sure booking exist first
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new BadRequestException('Booking Not Found');
    }
    if (booking.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to submit feedback for this booking',
      );
    }

    //make sure existing feedback in one booking
    const existingFeedback = await this.feedbackModel.findOne({
      bookingId,
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback for this booking already exists');
    }
    const feedback = new this.feedbackModel({
      ...createFeedbackDto,
      bookingId: new Types.ObjectId(bookingId),
      userId: new Types.ObjectId(userId),
    });
    await feedback.save();
    return this.feedbackModel.findById(feedback._id).lean();
  }

  public async getAllFeedback() {
    return this.feedbackModel.find().lean();
  }

  public async getFeedbackById(id: string) {
    const feedback = await this.feedbackModel
      .findById(id)
      .populate('bookingId')
      .lean();
    if (!feedback) {
      throw new BadRequestException('Feedback Not Found');
    }
    return feedback;
  }

  public async getFeedbackByBookingId(bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const feedback = await this.feedbackModel
      .findOne({ bookingId: new Types.ObjectId(bookingId) })
      .populate('bookingId')
      .lean();

    if (!feedback) {
      console.log('Feedback not found for bookingId:', bookingId);
      throw new BadRequestException('Feedback for this booking not found');
    }

    return feedback;
  }
}
