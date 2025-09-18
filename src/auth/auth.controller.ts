import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTechnicianDto } from './dtos/create-techinicians.dto';
import { AuthService } from './providers/auth.service';
import { LoginDto } from './dtos/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './user.schema';
import { isValidObjectId } from 'mongoose';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateTechnicianDto } from './dtos/update-technicians.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard())
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer-token')
  @ApiOperation({ summary: 'Register a new user (technician or admin)' })
  @ApiBody({ type: CreateTechnicianDto })
  @ApiResponse({
    status: 201,
    description: 'User created and JWT token returned',
  })
  @ApiResponse({ status: 400, description: 'Bad request or validation error' })
  @Post('technician/signup')
  public async signUpTechnician(
    @Body() createTechnicianDto: CreateTechnicianDto,
  ) {
    return this.authService.signUpTechnician(createTechnicianDto);
  }

  @ApiOperation({ summary: 'Register a new user ' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created and JWT token returned',
  })
  @ApiResponse({ status: 400, description: 'Bad request or validation error' })
  @Post('user/signup')
  public async signUpUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUpUser(createUserDto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, JWT token returned',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @Post('login')
  public async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @Post('/tech/login')
  public async Techlogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Get All Users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Get('users')
  public async findAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.authService.findAllUsers(page, limit);
  }

  @ApiOperation({ summary: 'Get User By ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the user',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @Get('users/:id')
  public async getUserById(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid Format Id');
    }
    return this.authService.findUserById(id);
  }

  @ApiOperation({ summary: 'Get Technician By ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the Technician',
  })
  @ApiResponse({
    status: 200,
    description: 'Technician retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @Get('technician/:id')
  public async getTechById(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid Format ID');
    }
    return this.authService.findTechById(id);
  }

  @ApiOperation({ summary: 'Update a User' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the user',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID or body data' })
  @Patch('users/:id')
  public async updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUserById(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update a technician' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the technician',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Techinican updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID or body data' })
  @Patch('technician/:id')
  public async updateTechById(
    @Param('id') id: string,
    @Body() updateTechDto: UpdateTechnicianDto,
  ) {
    return this.authService.updateTechnicianById(id, updateTechDto);
  }

  @ApiOperation({ summary: 'Delete a User' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the user',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @Delete('users/:id')
  public async deleteUserById(@Param('id') id: string) {
    return this.authService.deleteUserById(id);
  }

  @ApiOperation({ summary: 'Delete a technician' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the technician',
  })
  @ApiResponse({ status: 200, description: 'Techinican deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @Delete('technician/:id')
  public async deleteTechById(@Param('id') id: string) {
    return this.authService.deleteTechById(id);
  }
}
