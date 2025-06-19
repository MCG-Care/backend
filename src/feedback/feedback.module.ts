import { Module } from '@nestjs/common';
import { FeedbackService } from './providers/feedback.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from './feedback.schema';
import { FeedbackController } from './feedback.controller';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  providers: [FeedbackService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
  imports: [
    BookingModule,
    MongooseModule.forFeature([
      {
        name: Feedback.name,
        schema: FeedbackSchema,
      },
    ]),
  ],
})
export class FeedbackModule {}
