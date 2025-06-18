import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './providers/booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './booking.schema';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  exports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    BookingService,
  ],
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
})
export class BookingModule {}
