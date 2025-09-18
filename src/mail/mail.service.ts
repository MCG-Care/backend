/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendTechnicianAssignmentEmail(
    technicianEmail: string,
    technicianName: string,
    bookingDetails: {
      id: string;
      customerName: string;
      serviceTypes: string[];
      date: string;
      timeSlot: string;
      address: string;
    },
  ) {
    // Format service types for display
    const formattedServices = bookingDetails.serviceTypes
      .map((service) => this.formatServiceType(service))
      .join(', ');
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Assignment</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo-container { text-align: center; padding: 15px 20px; background: white; border-bottom: 2px solid #dc2626; }
        .logo { max-width: 120px; height: auto; } /* Smaller logo size */
        .header { background-color: #dc2626; color: white; padding: 15px; text-align: center; }
        .content { background-color: #fef2f2; padding: 20px; margin: 15px; border-radius: 8px; border-left: 4px solid #dc2626; }
        .footer { margin-top: 15px; padding: 15px; font-size: 12px; color: #777; text-align: center; background: #f8fafc; border-top: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .booking-title { color: #dc2626; margin-bottom: 15px; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Smaller logo -->
        <div class="logo-container">
          <img src="https://res.cloudinary.com/dp3yokuf8/image/upload/v1758125929/b462acaddbce09010ce3b5f92fbb3086d4e0584e_dt2w4r.png" 
               alt="MCG Care Logo" 
               class="logo"
               width="120"
               height="40">
        </div>
        
        <!-- Header -->
        <div class="header">
          <h2 style="margin: 0; font-size: 18px;">New Booking Assignment</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello <strong>${technicianName}</strong>,</p>
          
          <p>A new booking has been assigned to you. Here are the details:</p>
          
          <div class="content">
            <h3 class="booking-title">Booking Information</h3>
            <p><strong>Customer Name:</strong> ${bookingDetails.customerName}</p>
            <p><strong>Service Type:</strong> ${formattedServices}</p>
            <p><strong>Date:</strong> ${bookingDetails.date}</p>
            <p><strong>Time Slot:</strong> ${bookingDetails.timeSlot}</p>
            <p><strong>Address:</strong> ${bookingDetails.address}</p>
          </div>
          
          <p>Please make sure to arrive on time and bring all necessary equipment.</p>
          
          <p style="text-align: center;">
            <a href="#" class="button">View Details in App</a>
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Myanmar Classic Group Co.,Ltd. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const message = {
      from:
        this.configService.get('MAIL_FROM') ||
        'MCG CARE <noreply@bookings.com>',
      to: technicianEmail,
      subject: `New Booking Assigned to You`,
      text: `Hello ${technicianName},\n\nA new booking has been assigned to you:\n
Customer: ${bookingDetails.customerName}
Service Type: ${formattedServices}
Date: ${bookingDetails.date}
Time: ${bookingDetails.timeSlot}
Address: ${bookingDetails.address}\n
Please make sure to arrive on time and bring all necessary equipment.`,
      html: htmlContent,
    };

    try {
      const result = await this.transporter.sendMail(message);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private formatServiceType(serviceType: string): string {
    const serviceMap: { [key: string]: string } = {
      routine_cleaning: 'Routine Cleaning',
      gas_topup_and_leak_check: 'Gas Top-up & Leak Check',
      repair_and_fix: 'Repair & Fix',
      installation_and_relocation: 'Installation & Relocation',
      specialized_treatments: 'Specialized Treatments',
      other_services: 'Other Services',
    };

    return serviceMap[serviceType] || serviceType;
  }
}
