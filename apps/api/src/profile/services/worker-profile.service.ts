import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SpatialService } from '../../spatial/spatial.service';
import { ProfileCompletionService } from './profile-completion.service';
import { UpdateWorkerProfileDto } from '../dto/update-worker-profile.dto';
import { UpdateWorkerSkillsDto } from '../dto/update-worker-skills.dto';
import { CreateWorkerExperienceDto, UpdateWorkerExperienceDto } from '../dto/manage-worker-experience.dto';
import { CreateWorkerQualificationDto, UpdateWorkerQualificationDto } from '../dto/manage-worker-qualification.dto';
import { UpdateWorkerAvailabilityDto } from '../dto/manage-worker-availability.dto';
import { UpdateWorkerPortfolioDto } from '../dto/manage-worker-portfolio.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { ProfileVisibility } from '@prisma/client';

@Injectable()
export class WorkerProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spatialService: SpatialService,
    private readonly completionService: ProfileCompletionService,
  ) {}

  /**
   * Helper to serialize BigInt fields for clean JSON responses.
   */
  private serializeWorker(worker: any) {
    if (!worker) return null;
    return {
      ...worker,
      expectedWageHourlyMinor: worker.expectedWageHourlyMinor ? Number(worker.expectedWageHourlyMinor) : null,
      expectedWageDailyMinor: worker.expectedWageDailyMinor ? Number(worker.expectedWageDailyMinor) : null,
      expectedWageMonthlyMinor: worker.expectedWageMonthlyMinor ? Number(worker.expectedWageMonthlyMinor) : null,
    };
  }

  /**
   * Retrieves full private worker profile with all relations and completion calculation.
   */
  async getWorkerProfileByUserId(userId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            preferredLocale: true,
            createdAt: true,
            identities: {
              select: {
                id: true,
                identityType: true,
                normalizedValue: true,
                isPrimary: true,
                verifiedAt: true,
              },
            },
          },
        },
        primaryCategory: {
          select: {
            id: true,
            code: true,
            nameEn: true,
            nameUr: true,
            categoryType: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                code: true,
                nameEn: true,
                nameUr: true,
                categoryId: true,
              },
            },
          },
          orderBy: { proficiencyLevel: 'desc' },
        },
        experiences: {
          orderBy: { startedOn: 'desc' },
        },
        qualifications: {
          orderBy: { issuedOn: 'desc' },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found for the authenticated user');
    }

    const address = await this.prisma.address.findFirst({
      where: { ownerUserId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const completion = this.completionService.calculateWorkerCompletion(worker, address);

    return {
      profile: this.serializeWorker(worker),
      address: address
        ? {
            id: address.id,
            streetAddress: address.streetAddress,
            locality: address.locality,
            city: address.city,
            district: address.district,
            province: address.province,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            latitude: address.approximateLatitude ? Number(address.approximateLatitude) : null,
            longitude: address.approximateLongitude ? Number(address.approximateLongitude) : null,
            isExactPrivate: address.isExactPrivate,
          }
        : null,
      completion,
    };
  }

  /**
   * Updates core worker profile fields.
   */
  async updateWorkerProfile(userId: string, dto: UpdateWorkerProfileDto) {
    const existing = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Worker profile does not exist');
    }

    const updated = await this.prisma.workerProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.headline !== undefined ? { headline: dto.headline } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.dateOfBirth !== undefined ? { dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null } : {}),
        ...(dto.profilePictureUrl !== undefined ? { profilePictureUrl: dto.profilePictureUrl } : {}),
        ...(dto.primaryCategoryId !== undefined ? { primaryCategoryId: dto.primaryCategoryId } : {}),
        ...(dto.experienceMonths !== undefined ? { experienceMonths: dto.experienceMonths } : {}),
        ...(dto.expectedWageHourlyMinor !== undefined
          ? { expectedWageHourlyMinor: dto.expectedWageHourlyMinor ? BigInt(dto.expectedWageHourlyMinor) : null }
          : {}),
        ...(dto.expectedWageDailyMinor !== undefined
          ? { expectedWageDailyMinor: dto.expectedWageDailyMinor ? BigInt(dto.expectedWageDailyMinor) : null }
          : {}),
        ...(dto.expectedWageMonthlyMinor !== undefined
          ? { expectedWageMonthlyMinor: dto.expectedWageMonthlyMinor ? BigInt(dto.expectedWageMonthlyMinor) : null }
          : {}),
        ...(dto.preferredEngagementType !== undefined ? { preferredEngagementType: dto.preferredEngagementType } : {}),
        ...(dto.availabilityStatus !== undefined ? { availabilityStatus: dto.availabilityStatus } : {}),
        ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
        ...(dto.profileVisibility !== undefined ? { profileVisibility: dto.profileVisibility } : {}),
        ...(dto.languages !== undefined ? { languages: dto.languages } : {}),
      },
    });

    return this.getWorkerProfileByUserId(userId);
  }

  /**
   * Replaces worker skills list.
   */
  async updateWorkerSkills(userId: string, dto: UpdateWorkerSkillsDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    await this.prisma.$transaction(async tx => {
      // Remove previous skills
      await tx.workerSkill.deleteMany({
        where: { workerProfileId: worker.id },
      });

      // Insert new skills
      if (dto.skills && dto.skills.length > 0) {
        await tx.workerSkill.createMany({
          data: dto.skills.map(s => ({
            workerProfileId: worker.id,
            skillId: s.skillId,
            proficiencyLevel: s.proficiencyLevel,
            experienceMonths: s.experienceMonths,
            evidenceSource: s.evidenceSource || 'SELF_DECLARED',
          })),
        });
      }
    });

    return this.getWorkerProfileByUserId(userId);
  }

  /**
   * Adds work experience record.
   */
  async addExperience(userId: string, dto: CreateWorkerExperienceDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    const exp = await this.prisma.workerExperience.create({
      data: {
        workerProfileId: worker.id,
        roleTitle: dto.roleTitle,
        employerName: dto.employerName || null,
        city: dto.city || null,
        startedOn: new Date(dto.startedOn),
        endedOn: dto.endedOn ? new Date(dto.endedOn) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description || null,
        evidenceSource: dto.evidenceSource || 'SELF_DECLARED',
      },
    });

    return exp;
  }

  /**
   * Updates existing work experience record with ownership check.
   */
  async updateExperience(userId: string, expId: string, dto: UpdateWorkerExperienceDto) {
    const exp = await this.prisma.workerExperience.findUnique({
      where: { id: expId },
      include: { workerProfile: true },
    });

    if (!exp) {
      throw new NotFoundException('Experience record not found');
    }

    if (exp.workerProfile.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this experience record');
    }

    return this.prisma.workerExperience.update({
      where: { id: expId },
      data: {
        ...(dto.roleTitle !== undefined ? { roleTitle: dto.roleTitle } : {}),
        ...(dto.employerName !== undefined ? { employerName: dto.employerName } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.startedOn !== undefined ? { startedOn: new Date(dto.startedOn) } : {}),
        ...(dto.endedOn !== undefined ? { endedOn: dto.endedOn ? new Date(dto.endedOn) : null } : {}),
        ...(dto.isCurrent !== undefined ? { isCurrent: dto.isCurrent } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.evidenceSource !== undefined ? { evidenceSource: dto.evidenceSource } : {}),
      },
    });
  }

  /**
   * Deletes work experience record with ownership check.
   */
  async deleteExperience(userId: string, expId: string) {
    const exp = await this.prisma.workerExperience.findUnique({
      where: { id: expId },
      include: { workerProfile: true },
    });

    if (!exp) {
      throw new NotFoundException('Experience record not found');
    }

    if (exp.workerProfile.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this experience record');
    }

    await this.prisma.workerExperience.delete({
      where: { id: expId },
    });

    return { message: 'Experience record removed successfully' };
  }

  /**
   * Adds qualification / certification record.
   */
  async addQualification(userId: string, dto: CreateWorkerQualificationDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    return this.prisma.workerQualification.create({
      data: {
        workerProfileId: worker.id,
        title: dto.title,
        issuer: dto.issuer || null,
        qualificationType: dto.qualificationType || 'CERTIFICATION',
        credentialUrl: dto.credentialUrl || null,
        issuedOn: dto.issuedOn ? new Date(dto.issuedOn) : null,
        expiresOn: dto.expiresOn ? new Date(dto.expiresOn) : null,
        evidenceSource: dto.evidenceSource || 'SELF_DECLARED',
      },
    });
  }

  /**
   * Updates qualification record with ownership check.
   */
  async updateQualification(userId: string, qualId: string, dto: UpdateWorkerQualificationDto) {
    const qual = await this.prisma.workerQualification.findUnique({
      where: { id: qualId },
      include: { workerProfile: true },
    });

    if (!qual) {
      throw new NotFoundException('Qualification record not found');
    }

    if (qual.workerProfile.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this qualification');
    }

    return this.prisma.workerQualification.update({
      where: { id: qualId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.issuer !== undefined ? { issuer: dto.issuer } : {}),
        ...(dto.qualificationType !== undefined ? { qualificationType: dto.qualificationType } : {}),
        ...(dto.credentialUrl !== undefined ? { credentialUrl: dto.credentialUrl } : {}),
        ...(dto.issuedOn !== undefined ? { issuedOn: dto.issuedOn ? new Date(dto.issuedOn) : null } : {}),
        ...(dto.expiresOn !== undefined ? { expiresOn: dto.expiresOn ? new Date(dto.expiresOn) : null } : {}),
        ...(dto.evidenceSource !== undefined ? { evidenceSource: dto.evidenceSource } : {}),
      },
    });
  }

  /**
   * Deletes qualification record with ownership check.
   */
  async deleteQualification(userId: string, qualId: string) {
    const qual = await this.prisma.workerQualification.findUnique({
      where: { id: qualId },
      include: { workerProfile: true },
    });

    if (!qual) {
      throw new NotFoundException('Qualification record not found');
    }

    if (qual.workerProfile.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this qualification');
    }

    await this.prisma.workerQualification.delete({
      where: { id: qualId },
    });

    return { message: 'Qualification record removed successfully' };
  }

  /**
   * Updates weekly availability slots and availability status.
   */
  async updateAvailability(userId: string, dto: UpdateWorkerAvailabilityDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    await this.prisma.$transaction(async tx => {
      // Update overall status if provided
      if (dto.availabilityStatus !== undefined || dto.isAvailable !== undefined) {
        await tx.workerProfile.update({
          where: { id: worker.id },
          data: {
            ...(dto.availabilityStatus !== undefined ? { availabilityStatus: dto.availabilityStatus } : {}),
            ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
          },
        });
      }

      // Replace weekly slots if provided
      if (dto.weeklySchedule !== undefined) {
        await tx.workerAvailability.deleteMany({
          where: { workerProfileId: worker.id },
        });

        if (dto.weeklySchedule.length > 0) {
          await tx.workerAvailability.createMany({
            data: dto.weeklySchedule.map(slot => ({
              workerProfileId: worker.id,
              dayOfWeek: slot.dayOfWeek,
              isAvailable: slot.isAvailable ?? true,
              engagementPreference: slot.engagementPreference || 'ANY',
            })),
          });
        }
      }
    });

    return this.getWorkerProfileByUserId(userId);
  }

  /**
   * Updates portfolio items JSON collection.
   */
  async updatePortfolio(userId: string, dto: UpdateWorkerPortfolioDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    const items = dto.portfolioItems.map((item, idx) => ({
      id: item.id || `portfolio_${Date.now()}_${idx}`,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl || null,
      projectUrl: item.projectUrl || null,
      completedDate: item.completedDate || null,
    }));

    await this.prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        portfolioItems: items as any,
      },
    });

    return this.getWorkerProfileByUserId(userId);
  }

  /**
   * Updates or sets user address with PostGIS geography point.
   */
  async updateAddress(userId: string, dto: UpdateAddressDto) {
    let address = await this.prisma.address.findFirst({
      where: { ownerUserId: userId, deletedAt: null },
    });

    if (address) {
      address = await this.prisma.address.update({
        where: { id: address.id },
        data: {
          addressType: dto.addressType || address.addressType,
          streetAddress: dto.streetAddress !== undefined ? dto.streetAddress : address.streetAddress,
          locality: dto.locality,
          city: dto.city,
          district: dto.district !== undefined ? dto.district : address.district,
          province: dto.province,
          postalCode: dto.postalCode !== undefined ? dto.postalCode : address.postalCode,
          countryCode: dto.countryCode || address.countryCode,
          approximateLatitude: dto.latitude,
          approximateLongitude: dto.longitude,
          isExactPrivate: dto.isExactPrivate !== undefined ? dto.isExactPrivate : address.isExactPrivate,
        },
      });
    } else {
      address = await this.prisma.address.create({
        data: {
          ownerUserId: userId,
          addressType: dto.addressType || 'HOME',
          streetAddress: dto.streetAddress || null,
          locality: dto.locality,
          city: dto.city,
          district: dto.district || null,
          province: dto.province,
          postalCode: dto.postalCode || null,
          countryCode: dto.countryCode || 'PK',
          approximateLatitude: dto.latitude,
          approximateLongitude: dto.longitude,
          isExactPrivate: dto.isExactPrivate ?? true,
        },
      });
    }

    // Update PostGIS geography(Point, 4326)
    await this.spatialService.updateAddressLocation(address.id, dto.longitude, dto.latitude);

    return this.getWorkerProfileByUserId(userId);
  }

  /**
   * Public view of a worker profile for directory browsing or employer job matches.
   * Strips exact private address and private contact data for safety.
   */
  async getPublicWorkerProfile(workerProfileId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        primaryCategory: {
          select: { id: true, code: true, nameEn: true, nameUr: true, categoryType: true },
        },
        skills: {
          include: {
            skill: { select: { id: true, code: true, nameEn: true, nameUr: true } },
          },
          orderBy: { proficiencyLevel: 'desc' },
        },
        experiences: {
          select: {
            id: true,
            roleTitle: true,
            employerName: true,
            city: true,
            startedOn: true,
            endedOn: true,
            isCurrent: true,
            description: true,
          },
          orderBy: { startedOn: 'desc' },
        },
        qualifications: {
          select: {
            id: true,
            title: true,
            issuer: true,
            qualificationType: true,
            issuedOn: true,
            evidenceSource: true,
          },
          orderBy: { issuedOn: 'desc' },
        },
        availability: {
          select: {
            dayOfWeek: true,
            isAvailable: true,
            engagementPreference: true,
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!worker || worker.deletedAt) {
      throw new NotFoundException('Worker profile not found');
    }

    if (worker.profileVisibility === ProfileVisibility.PRIVATE) {
      throw new ForbiddenException('This worker profile is set to private');
    }

    const address = await this.prisma.address.findFirst({
      where: { ownerUserId: worker.userId, deletedAt: null },
      select: {
        city: true,
        locality: true,
        province: true,
        countryCode: true,
      },
    });

    return {
      id: worker.id,
      displayName: worker.displayName,
      headline: worker.headline,
      profilePictureUrl: worker.profilePictureUrl,
      bio: worker.bio,
      experienceMonths: worker.experienceMonths,
      expectedWageHourlyMinor: worker.expectedWageHourlyMinor ? Number(worker.expectedWageHourlyMinor) : null,
      expectedWageDailyMinor: worker.expectedWageDailyMinor ? Number(worker.expectedWageDailyMinor) : null,
      preferredEngagementType: worker.preferredEngagementType,
      verificationLevel: worker.verificationLevel,
      isAvailable: worker.isAvailable,
      availabilityStatus: worker.availabilityStatus,
      languages: worker.languages,
      portfolioItems: worker.portfolioItems,
      primaryCategory: worker.primaryCategory,
      skills: worker.skills,
      experiences: worker.experiences,
      qualifications: worker.qualifications,
      availability: worker.availability,
      location: address,
      safetyNotice:
        'LabourLens conducts identity and document verification to enhance transparency. However, verification does not guarantee personal safety. Always verify references and follow safety guidelines.',
    };
  }
}
