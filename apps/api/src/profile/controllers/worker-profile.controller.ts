import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkerProfileService } from '../services/worker-profile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interfaces';
import { UpdateWorkerProfileDto } from '../dto/update-worker-profile.dto';
import { UpdateWorkerSkillsDto } from '../dto/update-worker-skills.dto';
import { CreateWorkerExperienceDto, UpdateWorkerExperienceDto } from '../dto/manage-worker-experience.dto';
import { CreateWorkerQualificationDto, UpdateWorkerQualificationDto } from '../dto/manage-worker-qualification.dto';
import { UpdateWorkerAvailabilityDto } from '../dto/manage-worker-availability.dto';
import { UpdateWorkerPortfolioDto } from '../dto/manage-worker-portfolio.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Controller('workers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkerProfileController {
  constructor(private readonly workerProfileService: WorkerProfileService) {}

  @Get('profile/me')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.workerProfileService.getWorkerProfileByUserId(user.id);
  }

  @Patch('profile/me')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerProfileDto,
  ) {
    return this.workerProfileService.updateWorkerProfile(user.id, dto);
  }

  @Put('profile/me/skills')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateMySkills(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerSkillsDto,
  ) {
    return this.workerProfileService.updateWorkerSkills(user.id, dto);
  }

  @Post('profile/me/experiences')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async addExperience(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkerExperienceDto,
  ) {
    return this.workerProfileService.addExperience(user.id, dto);
  }

  @Put('profile/me/experiences/:id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateExperience(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') expId: string,
    @Body() dto: UpdateWorkerExperienceDto,
  ) {
    return this.workerProfileService.updateExperience(user.id, expId, dto);
  }

  @Delete('profile/me/experiences/:id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteExperience(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') expId: string,
  ) {
    return this.workerProfileService.deleteExperience(user.id, expId);
  }

  @Post('profile/me/qualifications')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async addQualification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkerQualificationDto,
  ) {
    return this.workerProfileService.addQualification(user.id, dto);
  }

  @Put('profile/me/qualifications/:id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateQualification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') qualId: string,
    @Body() dto: UpdateWorkerQualificationDto,
  ) {
    return this.workerProfileService.updateQualification(user.id, qualId, dto);
  }

  @Delete('profile/me/qualifications/:id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteQualification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') qualId: string,
  ) {
    return this.workerProfileService.deleteQualification(user.id, qualId);
  }

  @Put('profile/me/availability')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerAvailabilityDto,
  ) {
    return this.workerProfileService.updateAvailability(user.id, dto);
  }

  @Put('profile/me/portfolio')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updatePortfolio(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerPortfolioDto,
  ) {
    return this.workerProfileService.updatePortfolio(user.id, dto);
  }

  @Put('profile/me/address')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.workerProfileService.updateAddress(user.id, dto);
  }

  @Public()
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.workerProfileService.getPublicWorkerProfile(id);
  }
}
