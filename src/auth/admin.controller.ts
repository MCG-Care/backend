import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './providers/admin.service';
import { UpdateTechnicianDto } from './dtos/update-technicians.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './user.schema';

@ApiTags('Admin CRUD Of Technicians')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('technicians')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get All Technicians' })
  @ApiResponse({ status: 200, description: 'List of all technicians' })
  public async getAllTechnicians() {
    return this.adminService.findAllTechnicians();
  }

  @Get('technicians/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a technician by ID' })
  @ApiParam({ name: 'id', description: 'Technician ID' })
  @ApiResponse({ status: 200, description: 'Technician found' })
  @ApiResponse({ status: 404, description: 'Technician not found' })
  public async getTechnician(@Param('id') id: string) {
    return this.adminService.findTechnicianById(id);
  }

  @Patch('technicians/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a technician by ID' })
  @ApiParam({ name: 'id', description: 'Technician ID' })
  @ApiResponse({ status: 200, description: 'Technician updated successfully' })
  @ApiResponse({ status: 404, description: 'Technician not found' })
  public async updateTechnician(
    @Param('id') id: string,
    @Body() updateTechnicianDto: UpdateTechnicianDto,
  ) {
    return this.adminService.updateTechnician(id, updateTechnicianDto);
  }

  @Delete('technicians/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a technician by ID' })
  @ApiParam({ name: 'id', description: 'Technician ID' })
  @ApiResponse({ status: 200, description: 'Technician deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Technician is assigned to a booking and cannot be deleted',
  })
  @ApiResponse({ status: 404, description: 'Technician not found' })
  public async deleteTechnician(@Param('id') id: string) {
    return this.adminService.deleteTechnician(id);
  }
}
