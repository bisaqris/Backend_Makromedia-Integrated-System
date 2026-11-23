import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
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
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

  // Rotasi refresh token: tukar refresh token lama dengan sepasang token baru.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Tukar refresh token dengan access & refresh token baru (rotasi)' })
  @ApiOkResponse({ description: 'Token berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout: cabut refresh token' })
  @ApiOkResponse({ description: 'Logout berhasil.' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Ambil profil lengkap user yang sedang login' })
  @ApiOkResponse({ description: 'Data profil user saat ini berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.getProfile(user.id);
  }

  @ApiBearerAuth()
  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // file ditahan di memori lalu di-encode base64, tanpa disk
      limits: { fileSize: 2 * 1024 * 1024 }, // maks 2 MB
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
          cb(new BadRequestException('File harus gambar (jpeg/png/webp/gif).'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload / ganti foto profil user saat ini (field: file)' })
  @ApiOkResponse({ description: 'Foto profil berhasil diperbarui; mengembalikan profil terbaru.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    return this.auth.setAvatar(user.id, file);
  }

  @ApiBearerAuth()
  @Delete('me/avatar')
  @ApiOperation({ summary: 'Hapus foto profil user saat ini' })
  @ApiOkResponse({ description: 'Foto profil berhasil dihapus; mengembalikan profil terbaru.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  removeAvatar(@CurrentUser() user: AuthUser) {
    return this.auth.removeAvatar(user.id);
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
