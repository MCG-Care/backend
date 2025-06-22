import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './providers/booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './booking.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  exports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    BookingService,
  ],
  imports: [
    CloudinaryModule,
    NotificationModule,
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
})
export class BookingModule {}
