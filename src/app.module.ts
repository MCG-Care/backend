import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from './booking/booking.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FeedbackController } from './feedback/feedback.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    BookingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    MongooseModule.forRoot(
      'mongodb+srv://kminkhant2817:Min6511498@cluster0.nk1eq0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      { dbName: 'mcg-database' },
    ),
    ProductModule,
    AuthModule,
    FeedbackModule,
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [AppController, FeedbackController],
  providers: [AppService],
})
export class AppModule {}
