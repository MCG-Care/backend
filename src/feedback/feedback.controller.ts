/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './providers/feedback.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/user.schema';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(':bookingId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('bearer-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Submit feedback after payment' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  public async submitFeedback(
    @Param('bookingId') bookingId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.feedbackService.createFeedback(
      userId,
      bookingId,
      createFeedbackDto,
    );
  }

  @ApiOperation({ summary: 'GET all feedbacks with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCount: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @Get()
  public async allFeedbacks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.feedbackService.getAllFeedback(page, limit);
  }

  @ApiOperation({ summary: 'GET Feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback get successfully by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectID of the feedback',
    example: '6643e7f4d29e3301e82a65b2',
  })
  @Get(':id')
  public async getFeedbackById(@Param('id') id: string) {
    return this.feedbackService.getFeedbackById(id);
  }

  @ApiOperation({ summary: 'GET Feedback by Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Feedback get successfully by Booking ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectID of the booking',
    example: '6643e7f4d29e3301e82a65b2',
  })
  @Get('booking/:bookingId')
  public async getByBookingId(@Param('bookingId') bookingId: string) {
    return this.feedbackService.getFeedbackByBookingId(bookingId);
  }
}
