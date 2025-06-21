/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './providers/booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/user.schema';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CompleteBookingDto } from './dtos/complete-booking.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@Controller('booking')
@ApiTags('Bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({
    summary: 'Creates a new booking',
  })
  @ApiResponse({
    status: 201,
    description:
      'You get a 201 response if your booking is created successfully',
  })
  @Post('create')
  public async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @ApiOperation({
    summary: 'Get all bookings',
  })
  @ApiResponse({
    status: 200,
    description: 'You get a 200 response if you fetch all bookings',
  })
  @Get()
  public async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  @Get('my-bookings')
  @ApiOperation({
    summary: 'Get Bookings assigned to the technician',
    description:
      'Requires Bearer token in the Authorization header. Login first with TECHINICIAN ACCOUNT to get the token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of bookings assigned to the technician',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have technician role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  public async getMyBookings(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req.user._id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.bookingService.getBookingsByTechnician(user._id);
  }

  @ApiOperation({
    summary: 'Get available booking slots for a given date',
  })
  @ApiQuery({
    name: 'date',
    type: String,
    required: true,
    description: 'Date in YYYY-MM-DD format',
    example: '2025-06-08',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns available time slots for the given date',
  })
  @Get('available-slots')
  public async getAvailableSlots(@Query('date') date: string) {
    return this.bookingService.getAvailableSlots(date);
  }

  @Patch(':id/assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({
    summary: 'Assign a technician to a booking',
    description:
      'Requires Bearer token in the Authorization header. Login first with ADMIN ACCOUNT to get the token.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the booking to assign a technician to',
    type: String,
  })
  @ApiQuery({
    name: 'technicianId',
    description: 'ID of the technician to assign to the booking',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Technician successfully assigned to the booking',
    // Optionally, specify a response type or schema
  })
  public async assignBooking(
    @Param('id') bookingId: string,
    @Query('technicianId') technicianId: string,
  ) {
    return this.bookingService.assignTechnician(bookingId, technicianId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Technician updates booking status to finished',
    description:
      'Requires Bearer token in the Authorization header. Login first with TECHINICIAN ACCOUNT to get the token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated to finished',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have technician role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  public async updateBooking(
    @Param('id') id: string,
    @Req() req: any,
    @Body() completeBookingDto: CompleteBookingDto,
  ) {
    const technicianId = req.user._id;
    const { serviceFee, status } = completeBookingDto;

    return this.bookingService.updateBookingStatus(
      id,
      technicianId,
      serviceFee!,
      status,
    );
  }

  @ApiOperation({
    summary: 'Technician Edit Service Fee',
    description:
      'Requires Bearer token in the Authorization header. Login first with TECHINICIAN ACCOUNT to get the token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service Fee Edited',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have technician role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  @Patch(':id/service-fee')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  public async updateServiceFee(
    @Param('id') id: string,
    @Body() completeBookingDto: CompleteBookingDto,
    @Req() req: any,
  ) {
    const technicianId = req.user._id;
    return this.bookingService.updateServiceFee(
      id,
      completeBookingDto.serviceFee!,
      technicianId,
    );
  }

  @ApiOperation({ summary: 'User Make Payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment status has changed',
  })
  @Patch(':id/payment')
  public async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.bookingService.updatePayment(
      id,
      updatePaymentDto.paymentStatus,
    );
  }
}
