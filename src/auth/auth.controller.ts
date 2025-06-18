import { Body, Controller, Post } from '@nestjs/common';
import { CreateTechnicianDto } from './dtos/create-techinicians.dto';
import { AuthService } from './providers/auth.service';
import { LoginDto } from './dtos/login.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user (technician or admin)' })
  @ApiBody({ type: CreateTechnicianDto })
  @ApiResponse({
    status: 201,
    description: 'User created and JWT token returned',
  })
  @ApiResponse({ status: 400, description: 'Bad request or validation error' })
  @Post('signup')
  public async signUp(@Body() createUserDto: CreateTechnicianDto) {
    return this.authService.signUp(createUserDto);
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
