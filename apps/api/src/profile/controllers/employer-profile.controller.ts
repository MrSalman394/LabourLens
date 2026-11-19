import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmployerProfileService } from '../services/employer-profile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interfaces';
import { UpdateEmployerProfileDto } from '../dto/update-employer-profile.dto';
import { ManageEmployerPreferencesDto } from '../dto/manage-employer-preferences.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Controller('employers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployerProfileController {
  constructor(private readonly employerProfileService: EmployerProfileService) {}

  @Get('profile/me')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.employerProfileService.getEmployerProfileByUserId(user.id);
  }

  @Patch('profile/me')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerProfileService.updateEmployerProfile(user.id, dto);
  }

  @Put('profile/me/preferences')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ManageEmployerPreferencesDto,
  ) {
    return this.employerProfileService.updatePreferences(user.id, dto);
  }

  @Put('profile/me/address')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.employerProfileService.updateAddress(user.id, dto);
  }

  @Public()
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.employerProfileService.getPublicEmployerProfile(id);
  }
}
