/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingService } from './providers/booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { Booking } from './booking.schema';

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
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearer-token')
  @Roles(UserRole.USER)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('photos'))
  public async createBooking(
    @UploadedFiles() files: Express.Multer.File[],

    @Body() body: any,
    @Req() req: any,
  ) {
    if (body.contactInfo && typeof body.contactInfo === 'string') {
      try {
        body.contactInfo = JSON.parse(body.contactInfo);
      } catch (error) {
        throw new BadRequestException('Invalid JSON in contactInfo', error);
      }
    }

    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    // Optionally transform to DTO instance
    const createBookingDto = plainToInstance(CreateBookingDto, body);
    return this.bookingService.createBooking(createBookingDto, files, userId);
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({
    summary: 'Get user booking',
  })
  @ApiResponse({
    status: 201,
    description:
      'You get a 200 response if your booking is fetched successfully',
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearer-token')
  @Roles(UserRole.USER)
  @Get('user/my-bookings')
  public async getUserBookings(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.getUserBookings(userId, page, limit);
  }

  @ApiOperation({
    summary: 'Get a single user booking by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking Fetched by ID successfully',
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearer-token')
  @Roles(UserRole.USER, UserRole.TECHNICIAN, UserRole.ADMIN)
  @Get('my-bookings/:bookingId')
  public async getUserBookingById(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    const userId = req.user._id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.getUserBookingById(userId, bookingId);
  }

  @ApiOperation({ summary: 'Get User Service History' })
  @ApiResponse({
    status: 200,
    description: 'Returns completed bookings for the user',
    type: [Booking],
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearer-token')
  @Get('service-history')
  public async getServiceHistory(
    @Req() req: any,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.bookingService.getServiceHistory(userId, page, limit);
  }
  @ApiOperation({
    summary: 'Get all bookings with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated bookings',
  })
  @Get()
  public async getAllBookings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.bookingService.getAllBookings(page, limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  @Get('technician/my-bookings')
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

  // @ApiOperation({
  //   summary: 'Get available booking slots for a given date',
  // })
  // @ApiQuery({
  //   name: 'date',
  //   type: String,
  //   required: true,
  //   description: 'Date in YYYY-MM-DD format',
  //   example: '2025-06-08',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns available time slots for the given date',
  // })
  // @Get('available-slots')
  // public async getAvailableSlots(@Query('date') date: string) {
  //   return this.bookingService.getAvailableSlots(date);
  // }

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

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Get technician dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token missing or invalid',
  })
  @Get('technician/dashboard')
  public async getTechDashboard(@Req() req: any) {
    const technicianId = req.user.id;
    if (!technicianId) {
      throw new UnauthorizedException('Technician ID not found in token');
    }
    return this.bookingService.getTechnicianDashboard(technicianId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.TECHNICIAN)
  @ApiBearerAuth('bearer-token')
  @Get('technician/by-category')
  @ApiOperation({
    summary: 'Get technician bookings grouped by today, upcoming, and history',
  })
  @ApiResponse({ status: 200, description: 'Bookings grouped successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getBookingsByCategory(@Req() req: any) {
    const technicianId = req.user.id;
    if (!technicianId) {
      throw new UnauthorizedException('Technician ID not found in token');
    }

    return this.bookingService.getTechnicianBookings(technicianId);
  }

  @ApiOperation({
    summary: 'Get Top Services By Customer Booking',
  })
  @ApiResponse({ status: 200, description: 'Top Services Get Successfully' })
  @Get('top-services')
  public async getTopServices() {
    return this.bookingService.getStatsTopServices();
  }

  @Get('technician-stats')
  public async getTechnicianWorkLoad() {
    return this.bookingService.getTechnicianWorkload();
  }

  @ApiOperation({
    summary: 'Get available booking slots for a date',
    description:
      'Returns available time slots between 9:00 AM and 5:00 PM. ' +
      'If the date is today, past time slots are excluded. ' +
      'If the date is in the future, all slots from 9:00 AM to 5:00 PM are available. ' +
      'If the date is in the past, no slots are returned.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    example: '2025-09-01',
    description:
      'Date to check available slots. Accepted formats: yyyy-MM-dd or dd.MM.yyyy',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available slots for the given date',
    schema: {
      example: {
        availableSlots: [
          '9:00 AM',
          '10:00 AM',
          '11:00 AM',
          '12:00 PM',
          '1:00 PM',
          '2:00 PM',
          '3:00 PM',
          '4:00 PM',
          '5:00 PM',
        ],
      },
    },
  })
  @Get('slots')
  getAvailableSlots(@Query('date') date: string) {
    return this.bookingService.getAvailableSlots(date);
  }

  @Get('admin/dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics fetched successfully',
    schema: {
      example: {
        totalBookings: 120,
        totalRevenue: 45000,
        totalTechnicians: 10,
        totalUsers: 50,
      },
    },
  })
  async getAdminDashboard() {
    return this.bookingService.getAdminDashboardStats();
  }

  @Get('admin/recent-bookings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiOkResponse({
    description: 'Get recent bookings',
    schema: {
      example: [
        {
          _id: '64f29d3d83',
          title: 'AC Repair',
          serviceType: 'repair_and_fix',
          serviceFee: 2000,
          status: 'completed',
          user: { _id: '64f1', name: 'John Doe', email: 'john@example.com' },
          assignedTechnician: {
            _id: '64f2',
            name: 'Jane Tech',
            email: 'jane@example.com',
          },
          createdAt: '2025-08-31T08:00:00Z',
        },
      ],
    },
  })
  async getRecentBookings(@Query('limit') limit?: number) {
    return this.bookingService.adminGetRecentBookings(limit || 5);
  }

  @Get('admin/popular-services')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Get most popular services' })
  @ApiResponse({
    status: 200,
    description: 'Popular services fetched successfully',
    schema: {
      example: [
        { serviceType: 'routine_cleaning', totalRequests: 45 },
        { serviceType: 'repair_and_fix', totalRequests: 30 },
      ],
    },
  })
  async getPopularServices() {
    return this.bookingService.adminGetPopularServices(3);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Get user booking count for user management' })
  @Get('admin/user-booking-count')
  async getUsersWithBookingCount() {
    return await this.bookingService.adminGetUsersWithBookingCount();
  }

  @Get('admin/:bookingId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Get booking details by ID (Admin)' })
  @ApiParam({
    name: 'bookingId',
    description: 'ID of the booking to fetch',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details fetched successfully',
    type: Booking, // optionally use your Booking schema
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingByIdForAdmin(bookingId);
  }
}
