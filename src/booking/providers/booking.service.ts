/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingServiceCategory,
  PaymentStatus,
} from '../booking.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { CompletionStatus } from '../dtos/complete-booking.dto';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserRole } from 'src/auth/user.schema';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly notificationGateway: NotificationGateway,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
  ) {}

  // public async createBooking(
  //   createBookingDto: CreateBookingDto,
  //   files: Express.Multer.File[] | undefined,
  //   userId: string,
  // ) {
  //   // Initialize with empty array if no files
  //   const filesToProcess = files || [];
  //   const uploadedImages: string[] = [];

  //   // Process files only if they exist
  //   for (const file of filesToProcess) {
  //     try {
  //       const result = await this.cloudinaryService.uploadImage(file);
  //       if (result?.secure_url) {
  //         uploadedImages.push(result.secure_url);
  //       } else {
  //         throw new BadRequestException('Image upload failed');
  //       }
  //     } catch (error) {
  //       throw new BadRequestException(
  //         `Failed to upload image: ${error.message}`,
  //       );
  //     }
  //   }

  //   // 🧠 Auto-assign technician
  //   const technician = await this.findAvailableTechnician(
  //     createBookingDto.serviceType,
  //     createBookingDto.timeSlot,
  //     createBookingDto.date,
  //   );

  //   // Technician was assigned, but someone else just booked them at the same time — suggest other times for same tech
  //   if (technician) {
  //     const existingBooking = await this.bookingModel.findOne({
  //       assignedTechnician: technician._id,
  //       date: createBookingDto.date,
  //       timeSlot: createBookingDto.timeSlot,
  //       status: { $in: ['assigned', 'pending'] },
  //     });

  //     if (existingBooking) {
  //       // Get all bookings for this tech on that day
  //       const sameDayBookings = await this.bookingModel.find({
  //         assignedTechnician: technician._id,
  //         date: createBookingDto.date,
  //         status: { $in: ['assigned', 'pending'] },
  //       });

  //       const bookedSlots = sameDayBookings.map((b) => b.timeSlot);
  //       const availableSameDay = (technician.availableSlots || []).filter(
  //         (slot) => !bookedSlots.includes(slot),
  //       );

  //       if (availableSameDay.length > 0) {
  //         throw new BadRequestException({
  //           message: `There is no technician available at ${createBookingDto.timeSlot} on ${createBookingDto.date}.`,
  //           suggestedSlots: availableSameDay,
  //         });
  //       } else {
  //         throw new BadRequestException({
  //           message: `Technicians have no available slots left on ${createBookingDto.date}. Please choose another day.`,
  //         });
  //       }
  //     }
  //   }

  //   const newBooking = await this.bookingModel.create({
  //     ...createBookingDto,
  //     photos: uploadedImages,
  //     user: userId,
  //     assignedTechnician: technician?._id || null,
  //     status: technician ? 'assigned' : 'pending',
  //     date: createBookingDto.date,
  //     timeSlot: createBookingDto.timeSlot,
  //   });
  //   // 🔔 Notify admin or technician
  //   this.notificationGateway.sendNewBookingNotification({
  //     id: newBooking._id,
  //     customer: newBooking.contactInfo.name,
  //     timeSlot: newBooking.timeSlot,
  //   });

  //   return newBooking;
  // }

  // private async findAvailableTechnician(
  //   serviceType: BookingServiceCategory,
  //   timeSlot: string,
  //   date: string,
  // ): Promise<User | null> {
  //   //Get all matching technicians

  //   console.log('Finding technician for:', {
  //     serviceType,
  //     timeSlot,
  //     date,
  //   });
  //   const matchingTechs = await this.userModel.find({
  //     role: UserRole.TECHNICIAN,
  //     skills: { $in: [serviceType] },
  //     availableSlots: { $in: [timeSlot] },
  //   });

  //   console.log('Matching technicians found:', matchingTechs.length);
  //   console.log(
  //     'Technicians:',
  //     matchingTechs.map((t) => ({
  //       name: t.name,
  //       skills: t.skills,
  //       availableSlots: t.availableSlots,
  //     })),
  //   );
  //   // No technicians available at the requested time — suggest other time slots from other technicians

  //   if (matchingTechs.length === 0) {
  //     console.log(
  //       ' No technician available at that time. Finding alternatives...',
  //     );

  //     // Find techs who can do the service other time slot
  //     const alternativeTechs = await this.userModel.find({
  //       role: UserRole.TECHNICIAN,
  //       skills: serviceType,
  //     });
  //     if (alternativeTechs.length === 0) {
  //       throw new NotFoundException(
  //         'No technicians available for this service at all',
  //       );
  //     }

  //     // Collect all available slots from these techs
  //     const suggestedSlots = alternativeTechs.flatMap(
  //       (tech) => tech.availableSlots,
  //     );
  //     const uniqueSuggestedSlots = [...new Set(suggestedSlots)];
  //     throw new NotFoundException({
  //       message:
  //         'No technicians available at the selected time. Please choose another slot.',
  //       suggestedSlots: uniqueSuggestedSlots,
  //     });
  //   }

  //   //alg workload for each technician
  //   const techsWithLoad = await Promise.all(
  //     matchingTechs.map(async (tech) => {
  //       const bookings = await this.bookingModel.countDocuments({
  //         assignedTechnician: tech._id,
  //         date,
  //         status: { $in: ['assigned', 'completed'] }, // Active bookings
  //       });
  //       return { tech, workload: bookings };
  //     }),
  //   );
  //   console.log('Technician workloads:', techsWithLoad);

  //   //i will pick technician with lowest workload
  //   techsWithLoad.sort((a, b) => a.workload - b.workload);

  //   return techsWithLoad[0].tech;
  // }

  public async createBooking(
    createBookingDto: CreateBookingDto,
    files: Express.Multer.File[] | undefined,
    userId: string,
  ) {
    // Initialize with empty array if no files
    const filesToProcess = files || [];
    const uploadedImages: string[] = [];

    // Process files only if they exist
    for (const file of filesToProcess) {
      try {
        const result = await this.cloudinaryService.uploadImage(file);
        if (result?.secure_url) {
          uploadedImages.push(result.secure_url);
        } else {
          throw new BadRequestException('Image upload failed');
        }
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload image: ${error.message}`,
        );
      }
    }

    let serviceTypesArray: BookingServiceCategory[];
    try {
      if (typeof createBookingDto.serviceTypes === 'string') {
        serviceTypesArray = JSON.parse(createBookingDto.serviceTypes);
      } else {
        serviceTypesArray = createBookingDto.serviceTypes;
      }
    } catch (error) {
      throw new BadRequestException('Invalid service types format');
    }

    // 🧠 Auto-assign technician
    const technician = await this.findAvailableTechnician(
      serviceTypesArray,
      createBookingDto.timeSlot,
      createBookingDto.date,
    );

    // Technician was assigned, but someone else just booked them at the same time — suggest other times for same tech
    if (technician) {
      const existingBooking = await this.bookingModel.findOne({
        assignedTechnician: technician._id,
        date: createBookingDto.date,
        timeSlot: createBookingDto.timeSlot,
        status: { $in: ['assigned', 'pending'] },
      });

      if (existingBooking) {
        // Get all bookings for this tech on that day
        const sameDayBookings = await this.bookingModel.find({
          assignedTechnician: technician._id,
          date: createBookingDto.date,
          status: { $in: ['assigned', 'pending'] },
        });

        const bookedSlots = sameDayBookings.map((b) => b.timeSlot);
        const availableSameDay = (technician.availableSlots || []).filter(
          (slot) => !bookedSlots.includes(slot),
        );

        if (availableSameDay.length > 0) {
          throw new BadRequestException({
            message: `There is no technician available at ${createBookingDto.timeSlot} on ${createBookingDto.date}.`,
            suggestedSlots: availableSameDay,
          });
        } else {
          throw new BadRequestException({
            message: `Technicians have no available slots left on ${createBookingDto.date}. Please choose another day.`,
          });
        }
      }
    }

    const newBooking = await this.bookingModel.create({
      ...createBookingDto,
      serviceTypes: serviceTypesArray,
      photos: uploadedImages,
      user: userId,
      assignedTechnician: technician?._id || null,
      status: technician ? 'assigned' : 'pending',
      date: createBookingDto.date,
      timeSlot: createBookingDto.timeSlot,
    });

    // Notify admin or technician
    this.notificationGateway.sendNewBookingNotification({
      id: newBooking._id,
      customer: newBooking.contactInfo.name,
      timeSlot: newBooking.timeSlot,
    });

    // Send email to technician if assigned (non-blocking)
    if (technician && newBooking.assignedTechnician) {
      this.sendTechnicianAssignmentEmail(newBooking, technician)
        .then(() => {
          this.logger.log(`Email sent to technician ${technician._id}`);
        })
        .catch((error) => {
          this.logger.error(
            `Failed to send email to technician ${technician._id}: ${error.message}`,
          );
        });
    }

    return newBooking;
  }

  private async sendTechnicianAssignmentEmail(
    booking: Booking,
    technician: User,
  ) {
    try {
      if (technician && technician.email) {
        await this.mailService.sendTechnicianAssignmentEmail(
          technician.email,
          technician.name || 'Technician',
          {
            id: (booking._id as any).toString(),
            customerName: booking.contactInfo.name,
            serviceTypes: booking.serviceTypes,
            date: booking.date,
            timeSlot: booking.timeSlot,
            address: `${booking.contactInfo.building}, ${booking.contactInfo.street}, ${booking.contactInfo.ward}, ${booking.contactInfo.state}`,
          },
        );

        this.logger.log(`Email sent successfully to ${technician.email}`);
      } else {
        this.logger.warn(`Technician ${technician?._id} has no email address`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send technician assignment email: ${error.message}`,
        error.stack,
      );
    }
  }

  private async findAvailableTechnician(
    serviceTypes: BookingServiceCategory[],
    timeSlot: string,
    date: string,
  ): Promise<User | null> {
    // Get all matching technicians
    const serviceTypesArray =
      typeof serviceTypes === 'string'
        ? JSON.parse(serviceTypes)
        : serviceTypes;

    console.log('Finding technician for:', {
      serviceTypes: serviceTypesArray,
      timeSlot,
      date,
    });

    // Find technicians with ALL required skills and available time slot
    const allMatchingTechs = await this.userModel.find({
      role: UserRole.TECHNICIAN,
      skills: { $all: serviceTypesArray },
      availableSlots: { $in: [timeSlot] },
    });

    console.log('Technicians with ALL skills found:', allMatchingTechs.length);

    // Filter out technicians who are already booked at this time
    const availableTechs = await Promise.all(
      allMatchingTechs.map(async (tech) => {
        const existingBooking = await this.bookingModel.findOne({
          assignedTechnician: tech._id,
          date: date,
          timeSlot: timeSlot,
          status: { $in: ['assigned', 'pending'] },
        });
        return existingBooking ? null : tech;
      }),
    );

    // Filter out null values (technicians who are already booked)
    const matchingTechs = availableTechs.filter((tech) => tech !== null);

    console.log('Available technicians with ALL skills:', matchingTechs.length);

    // If no technicians with ALL skills are available at this time
    if (matchingTechs.length === 0) {
      console.log(
        'No technician with ALL skills available. Finding alternative time slots...',
      );

      // Find ALL technicians who have ALL the required skills (regardless of time slot)
      const allSkilledTechs = await this.userModel.find({
        role: UserRole.TECHNICIAN,
        skills: { $all: serviceTypesArray },
      });

      console.log('All technicians with ALL skills:', allSkilledTechs.length);

      if (allSkilledTechs.length === 0) {
        // No technicians have ALL the required skills at all
        throw new NotFoundException(
          'No technicians available with all the required skills for these services.',
        );
      }

      // Get available time slots from technicians who have ALL the required skills
      const suggestedSlots: string[] = [];
      for (const tech of allSkilledTechs) {
        for (const slot of tech.availableSlots ?? []) {
          // Check if this slot is available for this tech on this date
          const isBooked = await this.bookingModel.findOne({
            assignedTechnician: tech._id,
            date: date,
            timeSlot: slot,
            status: { $in: ['assigned', 'pending'] },
          });

          if (!isBooked && slot !== timeSlot) {
            suggestedSlots.push(slot);
          }
        }
      }

      const uniqueSuggestedSlots = [...new Set(suggestedSlots)].sort();

      throw new NotFoundException({
        message: `No technicians with all required skills available at ${timeSlot}. Please choose another time.`,
        suggestedSlots: uniqueSuggestedSlots,
      });
    }

    // Algorithm: workload for each available technician
    const techsWithLoad = await Promise.all(
      matchingTechs.map(async (tech) => {
        const bookings = await this.bookingModel.countDocuments({
          assignedTechnician: tech._id,
          date,
          status: { $in: ['assigned', 'completed'] },
        });
        return { tech, workload: bookings };
      }),
    );

    console.log('Available Technician workloads:', techsWithLoad);

    // Pick technician with lowest workload
    techsWithLoad.sort((a, b) => a.workload - b.workload);
    return techsWithLoad[0].tech;
  }

  public async getUserBookings(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find({ user: userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.bookingModel.countDocuments({ user: userId }),
    ]);
    return {
      bookings: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getServiceHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find({
          user: userId,
          status: 'completed',
        })
        .select(
          'productModel title bookingDate assignedTechnician status serviceFee paymentStatus serviceTypes description brandName serviceEndDate',
        )
        .populate({
          path: 'assignedTechnician',
          select: 'name email',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.bookingModel.countDocuments({
        user: userId,
        status: 'completed',
      }),
    ]);
    return {
      serviceHistory: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getAllBookings(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ bookings: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find()
        .select(
          'bookingId user assignedTechnician status serviceFee createdAt date timeSlot',
        )
        .populate('user', 'name email')
        .populate('assignedTechnician', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.bookingModel.countDocuments(), // Removed filters
    ]);

    return {
      bookings,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserBookingById(userId: string, bookingId: string) {
    const booking = await this.bookingModel
      .findOne({
        _id: bookingId,
        user: userId,
      })
      .populate('user', 'name email ')
      .populate('assignedTechnician', 'name email skills availableSlots');
    if (!booking) {
      throw new NotFoundException('Booking Nout Found');
    }
    return booking;
  }

  public async getBookingsByTechnician(technicianId: string) {
    const bookings = await this.bookingModel.find({
      assignedTechnician: technicianId,
    });
    if (!bookings || bookings.length === 0) {
      throw new NotFoundException('No bookings found for this technician.');
    }
    return bookings;
  }

  // private generateTimeSlots(date: Date): string[] {
  //   const startHour = 9;
  //   const endHour = 16;
  //   const now = new Date();

  //   const isToday = date.toDateString() === now.toDateString();

  //   const slots: string[] = [];

  //   for (let hour = startHour; hour <= endHour; hour++) {
  //     const slotTime = new Date(date);
  //     slotTime.setHours(hour, 0, 0, 0);

  //     // Skip past hours for today
  //     if (!isToday || slotTime > now) {
  //       const datePart = slotTime.toLocaleDateString('en-CA'); // "YYYY-MM-DD"
  //       const timePart = slotTime.toLocaleTimeString('en-US', {
  //         hour: 'numeric',
  //         minute: '2-digit',
  //         hour12: true,
  //       }); // "9:00 PM"

  //       const fullSlot = `${datePart} ${timePart}`; // "2025-07-28 9:00 PM"
  //       slots.push(fullSlot);
  //     }
  //   }

  //   return slots;
  // }

  // async getAvailableSlots(date: string) {
  //   const zone = 'Asia/Bangkok';
  //   const now = DateTime.now().setZone(zone);

  //   const startOfDay = DateTime.fromISO(date, { zone }).startOf('day');
  //   const endOfDay = startOfDay.endOf('day');

  //   const start = startOfDay.toJSDate();
  //   const end = endOfDay.toJSDate();

  //   if (startOfDay < now.startOf('day')) {
  //     return [];
  //   }

  //   const allSlots = this.generateTimeSlots(start);

  //   const bookings = await this.bookingModel.find({
  //     bookingDate: {
  //       $gte: start,
  //       $lte: end,
  //     },
  //   });

  //   const bookedSlots = bookings.map((b) => {
  //     const slotDate = DateTime.fromJSDate(b.bookingDate).toFormat(
  //       'yyyy-MM-dd',
  //     );
  //     return `${slotDate} ${b.timeSlot}`; // e.g., "2025-07-28 9:00 PM"
  //   });

  //   const availableSlots = allSlots.filter(
  //     (slot) => !bookedSlots.includes(slot),
  //   );

  //   return availableSlots;
  // }

  public async assignTechnician(bookingId: string, technicianId: string) {
    if (
      !Types.ObjectId.isValid(bookingId) ||
      !Types.ObjectId.isValid(technicianId)
    ) {
      throw new Error('Invalid ID Format');
    }
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        assignedTechnician: technicianId,
        status: 'assigned',
      },
      { new: true },
    );
  }

  public async updateBookingStatus(
    bookingId: string,
    technicianId: string,
    serviceFee: number,
    status?: CompletionStatus,
  ) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking Not Found');
    }

    // Check if the technician is assigned
    if (booking.assignedTechnician?.toString() !== technicianId.toString()) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    // Update status
    booking.status = status || 'completed';

    if (booking.status === 'completed') {
      const now = new Date();
      // Create ISO string with +07:00 offset
      const thailandTimeISO = new Date(
        now.getTime() + 7 * 60 * 60 * 1000,
      ).toISOString();
      booking.serviceEndDate = thailandTimeISO;
    }

    // Update service fee if provided
    if (typeof serviceFee === 'number') {
      booking.serviceFee = serviceFee;
    }

    // Set payment status to pending
    booking.paymentStatus = PaymentStatus.PAID;

    return booking.save();
  }

  public async updateServiceFee(
    bookingId: string,
    newFee: number,
    technicianId: string,
  ) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking Not Found');
    }
    const assignedTechnicianId = booking.assignedTechnician?.toString();
    const technicianIdStr = technicianId.toString();

    if (assignedTechnicianId !== technicianIdStr) {
      throw new ForbiddenException('You are not assigned to this booking');
    }
    booking.serviceFee = newFee;
    // Optionally reset paymentStatus to 'pending' if fee changed after paid
    if (booking.paymentStatus === PaymentStatus.PAID) {
      booking.paymentStatus = PaymentStatus.PENDING;
    }
    return booking.save();
  }
  public async updatePayment(bookingId: string, paymentStatus: PaymentStatus) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking Not Found');
    }
    booking.paymentStatus = paymentStatus;
    return booking.save();
  }

  public async getTechnicianDashboard(technicianId: string) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const allBookings = await this.bookingModel
      .find({
        assignedTechnician: technicianId,
      })
      .lean();

    const completedTasks = allBookings.filter((b) => b.status === 'completed');

    const todayTasks = allBookings.filter(
      (b) => b.date === todayStr && ['assigned', 'pending'].includes(b.status),
    );

    const upcomingTasks = allBookings.filter(
      (b) => b.date > todayStr && ['assigned', 'pending'].includes(b.status),
    );

    return {
      completedTasks: completedTasks.length,
      todayTasks: todayTasks.length,
      upcomingTasks: upcomingTasks.length,
    };
  }

  public async getTechnicianBookings(technicianId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const bookings = await this.bookingModel
      .find({ assignedTechnician: technicianId })
      .lean();

    // Today's assigned/active jobs
    const todayBookings = bookings.filter(
      (b) => b.date === todayStr && b.status !== 'completed',
    );

    // Upcoming future jobs (not completed)
    const upcomingBookings = bookings.filter(
      (b) => b.date > todayStr && b.status !== 'completed',
    );

    // History: completed jobs + past jobs + today's completed jobs
    const historyBookings = bookings.filter(
      (b) => b.date < todayStr || b.status === 'completed',
    );

    return {
      today: todayBookings,
      upcoming: upcomingBookings,
      history: historyBookings,
    };
  }

  async getStatsTopServices(limit = 5) {
    return this.bookingModel.aggregate([
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $unwind: '$serviceTypes', // Split the array into individual documents
      },
      {
        $group: {
          _id: '$serviceTypes', // Group by each service type
          totalBookings: { $sum: 1 },
        },
      },
      {
        $sort: { totalBookings: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          serviceType: '$_id',
          totalBookings: 1,
        },
      },
    ]);
  }

  async getTechnicianWorkload() {
    const technicians = await this.userModel
      .find({ role: UserRole.TECHNICIAN })
      .lean();

    const results = await Promise.all(
      technicians.map(async (tech) => {
        const completedServices = await this.bookingModel.countDocuments({
          assignedTechnician: tech._id,
          status: 'completed',
        });
        const pendingServices = await this.bookingModel.countDocuments({
          assignedTechnician: tech._id,
          status: { $ne: 'completed' }, // Count all jobs that are not completed
        });
        const { points, rating } = calculateRatingPoints(completedServices);
        return {
          technicianId: tech._id,
          name: tech.name,
          email: tech.email,
          completedServices,
          pendingServices,
          points,
          rating,
        };
      }),
    );
    return results.filter((r) => r.completedServices > 0);
  }

  async getAdminDashboardStats() {
    const totalBookings = await this.bookingModel.countDocuments();

    const revenueResult = await this.bookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$serviceFee' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const totalTechnicians = await this.userModel.countDocuments({
      role: UserRole.TECHNICIAN,
    });

    const totalUsers = await this.userModel.countDocuments({
      role: UserRole.USER,
    });

    return {
      totalBookings,
      totalRevenue,
      totalTechnicians,
      totalUsers,
    };
  }

  async adminGetRecentBookings(limit = 5) {
    const bookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'date serviceTypes user assignedTechnician serviceFee paymentStatus',
      )
      .populate('user', 'name')
      .populate('assignedTechnician', 'name');

    return bookings;
  }

  async adminGetPopularServices(limit = 10) {
    const result = await this.bookingModel.aggregate([
      {
        $unwind: '$serviceTypes', // Break down the serviceTypes array
      },
      {
        $match: {
          serviceTypes: {
            $ne: null,
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: '$serviceTypes', // Group by each individual service type
          totalRequests: { $sum: 1 }, // Count occurrences
        },
      },
      { $sort: { totalRequests: -1 } }, // Sort by most popular first
      { $limit: limit },
    ]);

    return result.map((r) => ({
      serviceType: r._id,
      totalRequests: r.totalRequests,
    }));
  }

  async adminGetUsersWithBookingCount() {
    const users = await this.userModel
      .find({
        role: { $nin: ['Technician', 'Admin'] },
      })
      .lean();

    const usersWithBookings = await Promise.all(
      users.map(async (user) => {
        const count = await this.bookingModel.countDocuments({
          user: user._id,
        });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role, // Include role in response
          bookings: count,
        };
      }),
    );

    return usersWithBookings;
  }

  // pass the selected date from your UI, e.g. "01.09.2025" or "2025-09-01"
  // getAvailableSlots(selectedDate: string | Date): string[] {
  //   const startHour = 9;
  //   const endHour = 17;

  //   const selected = this.parseDateInput(selectedDate); // <- supports dd.MM.yyyy and yyyy-MM-dd
  //   const today = new Date();

  //   // normalize to midnight (local)
  //   const selMidnight = new Date(
  //     selected.getFullYear(),
  //     selected.getMonth(),
  //     selected.getDate(),
  //   );
  //   const todayMidnight = new Date(
  //     today.getFullYear(),
  //     today.getMonth(),
  //     today.getDate(),
  //   );

  //   // past dates: no slots
  //   if (selMidnight.getTime() < todayMidnight.getTime()) return [];

  //   const isToday = selMidnight.getTime() === todayMidnight.getTime();

  //   // if today, start from the next full hour; else from opening hour
  //   const currentHour = today.getHours();
  //   const currentMinute = today.getMinutes();
  //   const firstHourToday = currentMinute > 0 ? currentHour + 1 : currentHour;
  //   const loopStart = isToday ? Math.max(startHour, firstHourToday) : startHour;

  //   const slots: string[] = [];
  //   for (let hour = loopStart; hour <= endHour; hour++) {
  //     slots.push(this.formatTime(hour, 0)); // e.g. "3:00 PM"
  //   }
  //   return slots;
  // }

  // // Supports "31.08.2025" and "2025-09-01"
  private parseDateInput(input: string | Date): Date {
    if (input instanceof Date) return input;
    const s = String(input).trim();

    // dd.MM.yyyy
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('.').map(Number);
      return new Date(yyyy, mm - 1, dd);
    }

    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [yyyy, mm, dd] = s.split('-').map(Number);
      return new Date(yyyy, mm - 1, dd);
    }

    // fallback (may be timezone/locale-dependent)
    return new Date(s);
  }

  // private formatTime(hour: number, minute: number): string {
  //   const displayHour = hour % 12 || 12;
  //   const period = hour < 12 ? 'AM' : 'PM';
  //   return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  // }

  async getAvailableSlots(date: string | Date): Promise<string[]> {
    try {
      const selected = this.parseDateInput(date);
      const today = new Date();

      // Normalize to midnight for date comparison
      const selMidnight = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      // Past dates: no slots
      if (selMidnight.getTime() < todayMidnight.getTime()) {
        return [];
      }

      const isToday = selMidnight.getTime() === todayMidnight.getTime();

      // Get all technicians
      const technicians = await this.userModel.find({
        role: UserRole.TECHNICIAN,
      });

      console.log('Technicians found:', technicians.length);

      // Get existing bookings for this specific date
      const formattedDate = this.formatDate(selMidnight);
      const existingBookings = await this.bookingModel.find({
        date: formattedDate,
        status: { $in: ['assigned', 'pending'] },
      });

      console.log(
        'Existing bookings for',
        formattedDate,
        ':',
        existingBookings.length,
      );

      // Get ALL available slots from all technicians (their weekly availability)
      const allTechnicianSlots = technicians.flatMap(
        (tech) => tech.availableSlots || [],
      );
      const uniqueSlots = [...new Set(allTechnicianSlots)].sort();

      console.log('All technician slots:', uniqueSlots);

      // For today, filter out past times
      let availableSlots = uniqueSlots;
      if (isToday) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();

        availableSlots = uniqueSlots.filter((slot) => {
          const slotHour = this.parseTimeSlotToHour(slot);
          return (
            slotHour > currentHour ||
            (slotHour === currentHour && currentMinute < 50)
          );
        });
      }

      console.log('After time filter:', availableSlots);

      // Remove slots where ALL technicians are booked
      const finalSlots = availableSlots.filter((slot) => {
        return this.isSlotAvailable(slot, technicians, existingBookings);
      });

      console.log('Final available slots:', finalSlots);
      return finalSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  private parseTimeSlotToHour(timeSlot: string): number {
    // Convert "10:00 AM" to 10, "2:00 PM" to 14, etc.
    const [time, period] = timeSlot.split(' ');
    const [hourStr] = time.split(':');
    let hour = parseInt(hourStr);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour;
  }

  private isSlotAvailable(
    timeSlot: string,
    technicians: User[],
    existingBookings: Booking[],
  ): boolean {
    // Check if at least ONE technician is available for this slot
    return technicians.some((technician: User) => {
      // 1. Check if technician has this slot in their weekly availability
      const hasSlot = technician.availableSlots?.includes(timeSlot) ?? false;
      if (!hasSlot) return false;

      // 2. Check if this specific technician is already booked at this time on this date
      const isBooked = existingBookings.some(
        (booking) =>
          booking.assignedTechnician?.toString() ===
            (technician._id as Types.ObjectId).toString() &&
          booking.timeSlot === timeSlot,
      );

      return !isBooked;
    });
  }
  private formatDate(date: Date): string {
    // Format to "YYYY-MM-DD" to match your booking date format
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function calculateRatingPoints(completed: number) {
  const points = completed * 10;
  if (points < 30) return { points, rating: 1 };
  if (points < 60) return { points, rating: 2 };
  if (points < 100) return { points, rating: 3 };
  if (points < 150) return { points, rating: 4 };
  return { points, rating: 5 };
}
