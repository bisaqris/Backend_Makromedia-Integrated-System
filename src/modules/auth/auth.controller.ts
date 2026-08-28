import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  SuccessEnvelopeDto,
  UnauthorizedResponse,
  apiSuccessResponse,
} from '../../common/swagger/api-response.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/profile.dto';

@ApiTags('auth')
@ApiExtraModels(SuccessEnvelopeDto, LoginResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Anti brute-force: maksimal 5 percobaan login / menit per IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login dan dapatkan JWT access token' })
  @ApiOkResponse(apiSuccessResponse({ $ref: getSchemaPath(LoginResponseDto) }, 'Login berhasil'))
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Ambil data user yang sedang login' })
  @ApiOkResponse({ description: 'Data user saat ini berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update profil user saat ini' })
  @ApiOkResponse({ description: 'Profil berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.id, dto);
  }

  @ApiBearerAuth()
  @Patch('me/password')
  @ApiOperation({ summary: 'Ganti password user saat ini' })
  @ApiOkResponse({ description: 'Password berhasil diubah.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.id, dto);
  }
}
