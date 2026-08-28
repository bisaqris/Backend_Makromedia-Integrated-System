import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
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

@ApiTags('auth')
@ApiExtraModels(SuccessEnvelopeDto, LoginResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

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
}
