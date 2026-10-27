import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  BadRequestResponse,
  ForbiddenResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@Roles('DIREKTUR')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua pengguna (DIREKTUR only)' })
  @ApiOkResponse({ description: 'Daftar pengguna berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  findAll() { return this.users.findAll(); }

  @Post()
  @ApiOperation({ summary: 'Buat akun pengguna baru (DIREKTUR only)' })
  @ApiCreatedResponse({ description: 'Pengguna berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
}
