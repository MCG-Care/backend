import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateTechnicianDto } from './dtos/create-techinicians.dto';
import { AuthService } from './providers/auth.service';
import { LoginDto } from './dtos/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './user.schema';

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
}
