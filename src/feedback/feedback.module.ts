import { Module } from '@nestjs/common';
import { FeedbackService } from './providers/feedback.service';

@Module({
  providers: [FeedbackService],
})
export class FeedbackModule {}
