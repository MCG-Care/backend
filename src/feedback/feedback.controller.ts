import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FeedbackService } from './providers/feedback.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(':bookingId')
  @ApiOperation({ summary: 'Submit feedback after payment' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  public async submitFeedback(
    @Param('bookingId') bookingId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(bookingId, createFeedbackDto);
  }

  @ApiOperation({ summary: 'GET all feedbacks' })
  @ApiResponse({ status: 200, description: 'Feedback get successfully' })
  @Get()
  public async allFeedbacks() {
    return this.feedbackService.getAllFeedback();
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

  @Get('booking/:bookingId')
  public async getByBookingId(@Param('bookingId') bookingId: string) {
    return this.feedbackService.getFeedbackByBookingId(bookingId);
  }
}
