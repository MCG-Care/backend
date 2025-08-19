/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly notificationGateway: NotificationGateway,
    private readonly cloudinaryService: CloudinaryService,
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

  //   const newBooking = await this.bookingModel.create({
  //     ...createBookingDto,
  //     photos: uploadedImages,
  //     user: userId,
  //   });
  //   this.notificationGateway.sendNewBookingNotification({
  //     id: newBooking._id,
  //     customer: newBooking.contactInfo.name,
  //     timeSlot: newBooking.timeSlot,
  //   });
  //   return newBooking;
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

    // 🧠 Auto-assign technician
    const technician = await this.findAvailableTechnician(
      createBookingDto.serviceType,
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
      photos: uploadedImages,
      user: userId,
      assignedTechnician: technician?._id || null,
      status: technician ? 'assigned' : 'pending',
      date: createBookingDto.date,
      timeSlot: createBookingDto.timeSlot,
    });
    // 🔔 Notify admin or technician
    this.notificationGateway.sendNewBookingNotification({
      id: newBooking._id,
      customer: newBooking.contactInfo.name,
      timeSlot: newBooking.timeSlot,
    });

    return newBooking;
  }

  private async findAvailableTechnician(
    serviceType: BookingServiceCategory,
    timeSlot: string,
    date: string,
  ): Promise<User | null> {
    //Get all matching technicians

    console.log('Finding technician for:', {
      serviceType,
      timeSlot,
      date,
    });
    const matchingTechs = await this.userModel.find({
      role: UserRole.TECHNICIAN,
      skills: { $in: [serviceType] },
      availableSlots: { $in: [timeSlot] },
    });

    console.log('Matching technicians found:', matchingTechs.length);
    console.log(
      'Technicians:',
      matchingTechs.map((t) => ({
        name: t.name,
        skills: t.skills,
        availableSlots: t.availableSlots,
      })),
    );
    // No technicians available at the requested time — suggest other time slots from other technicians

    if (matchingTechs.length === 0) {
      console.log(
        ' No technician available at that time. Finding alternatives...',
      );

      // Find techs who can do the service other time slot
      const alternativeTechs = await this.userModel.find({
        role: UserRole.TECHNICIAN,
        skills: serviceType,
      });
      if (alternativeTechs.length === 0) {
        throw new NotFoundException(
          'No technicians available for this service at all',
        );
      }

      // Collect all available slots from these techs
      const suggestedSlots = alternativeTechs.flatMap(
        (tech) => tech.availableSlots,
      );
      const uniqueSuggestedSlots = [...new Set(suggestedSlots)];
      throw new NotFoundException({
        message:
          'No technicians available at the selected time. Please choose another slot.',
        suggestedSlots: uniqueSuggestedSlots,
      });
    }

    //alg workload for each technician
    const techsWithLoad = await Promise.all(
      matchingTechs.map(async (tech) => {
        const bookings = await this.bookingModel.countDocuments({
          assignedTechnician: tech._id,
          timeSlot,
          date,
          status: { $ne: 'completed' }, //we want only active bookings
        });
        return { tech, workload: bookings };
      }),
    );
    console.log('Technician workloads:', techsWithLoad);

    //i will pick technician with lowest workload
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
          'productModel title bookingDate assignedTechnician status serviceFee paymentStatus',
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

  public async getAllBookings() {
    return this.bookingModel.find();
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
      throw new NotFoundException('booking Not Found');
    }

    const assignedTechnicianId = booking.assignedTechnician?.toString();
    const technicianIdStr = technicianId.toString();

    if (assignedTechnicianId !== technicianIdStr) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    if (status) {
      booking.status = status;
    } else {
      booking.status = 'completed';
    }

    if (typeof serviceFee === 'number') {
      booking.serviceFee = serviceFee;
    }

    booking.paymentStatus = PaymentStatus.PENDING;

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

    const bookings = await this.bookingModel
      .find({
        assignedTechnician: technicianId,
      })
      .lean();

    const todayStr = today.toISOString().split('T')[0];

    const todayBookings = bookings.filter((b) => b.date === todayStr);
    const upcomingBookings = bookings.filter(
      (b) => b.date > todayStr && b.status !== 'completed',
    );
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
        $group: {
          _id: '$serviceType',
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
        const { points, rating } = calculateRatingPoints(completedServices);
        return {
          technicianId: tech._id,
          name: tech.name,
          email: tech.email,
          completedServices,
          points,
          rating,
        };
      }),
    );
    return results.filter((r) => r.completedServices > 0);
  }

  public generateTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`);
    }
    return slots;
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
