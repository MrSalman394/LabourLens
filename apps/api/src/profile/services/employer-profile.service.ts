import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SpatialService } from '../../spatial/spatial.service';
import { ProfileCompletionService } from './profile-completion.service';
import { UpdateEmployerProfileDto } from '../dto/update-employer-profile.dto';
import { ManageEmployerPreferencesDto } from '../dto/manage-employer-preferences.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class EmployerProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spatialService: SpatialService,
    private readonly completionService: ProfileCompletionService,
  ) {}

  /**
   * Retrieves full private employer profile with stats and completion score.
   */
  async getEmployerProfileByUserId(userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
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
      },
    });

    if (!employer) {
      throw new NotFoundException('Employer profile not found for the authenticated user');
    }

    const address = await this.prisma.address.findFirst({
      where: { ownerUserId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    // Compute hiring statistics
    const [totalJobs, activeJobs, hiresCount] = await Promise.all([
      this.prisma.jobPosting.count({ where: { employerProfileId: employer.id } }),
      this.prisma.jobPosting.count({ where: { employerProfileId: employer.id, status: 'PUBLISHED' } }),
      this.prisma.hire.count({ where: { employerUserId: userId } }),
    ]);

    const completion = this.completionService.calculateEmployerCompletion(employer, address);

    return {
      profile: {
        id: employer.id,
        userId: employer.userId,
        displayName: employer.displayName,
        businessName: employer.businessName,
        employerType: employer.employerType,
        description: employer.description,
        ntnTaxNumber: employer.ntnTaxNumber,
        profilePictureUrl: employer.profilePictureUrl,
        isVerified: employer.isVerified,
        hiringPreferences: employer.hiringPreferences,
        createdAt: employer.createdAt,
        updatedAt: employer.updatedAt,
        user: employer.user,
      },
      stats: {
        totalJobPostings: totalJobs,
        activeJobPostings: activeJobs,
        totalHires: hiresCount,
      },
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
   * Updates employer core profile details.
   */
  async updateEmployerProfile(userId: string, dto: UpdateEmployerProfileDto) {
    const existing = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Employer profile does not exist');
    }

    await this.prisma.employerProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.employerType !== undefined ? { employerType: dto.employerType } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.ntnTaxNumber !== undefined ? { ntnTaxNumber: dto.ntnTaxNumber } : {}),
        ...(dto.profilePictureUrl !== undefined ? { profilePictureUrl: dto.profilePictureUrl } : {}),
      },
    });

    return this.getEmployerProfileByUserId(userId);
  }

  /**
   * Updates employer hiring preferences.
   */
  async updatePreferences(userId: string, dto: ManageEmployerPreferencesDto) {
    const existing = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Employer profile does not exist');
    }

    const currentPreferences = (existing.hiringPreferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...(dto.preferredCategoryIds !== undefined ? { preferredCategoryIds: dto.preferredCategoryIds } : {}),
      ...(dto.preferredEngagementTypes !== undefined ? { preferredEngagementTypes: dto.preferredEngagementTypes } : {}),
      ...(dto.minExperienceMonths !== undefined ? { minExperienceMonths: dto.minExperienceMonths } : {}),
      ...(dto.preferredLanguages !== undefined ? { preferredLanguages: dto.preferredLanguages } : {}),
      ...(dto.budgetMaxMinor !== undefined ? { budgetMaxMinor: dto.budgetMaxMinor } : {}),
    };

    await this.prisma.employerProfile.update({
      where: { userId },
      data: {
        hiringPreferences: updatedPreferences,
      },
    });

    return this.getEmployerProfileByUserId(userId);
  }

  /**
   * Sets or updates employer address with PostGIS geography point.
   */
  async updateAddress(userId: string, dto: UpdateAddressDto) {
    let address = await this.prisma.address.findFirst({
      where: { ownerUserId: userId, deletedAt: null },
    });

    if (address) {
      address = await this.prisma.address.update({
        where: { id: address.id },
        data: {
          addressType: dto.addressType || 'OFFICE',
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
          addressType: dto.addressType || 'OFFICE',
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

    return this.getEmployerProfileByUserId(userId);
  }

  /**
   * Public view of employer profile.
   */
  async getPublicEmployerProfile(employerProfileId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { id: employerProfileId },
      include: {
        jobPostings: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            category: { select: { nameEn: true, nameUr: true } },
            engagementType: true,
            createdAt: true,
          },
          take: 5,
        },
      },
    });

    if (!employer || employer.deletedAt) {
      throw new NotFoundException('Employer profile not found');
    }

    const address = await this.prisma.address.findFirst({
      where: { ownerUserId: employer.userId, deletedAt: null },
      select: {
        city: true,
        locality: true,
        province: true,
      },
    });

    return {
      id: employer.id,
      displayName: employer.displayName,
      businessName: employer.businessName,
      employerType: employer.employerType,
      description: employer.description,
      profilePictureUrl: employer.profilePictureUrl,
      isVerified: employer.isVerified,
      location: address,
      activeJobs: employer.jobPostings,
      safetyNotice:
        'LabourLens conducts verification to enhance transparency. Always follow safety guidelines for interviews and hiring.',
    };
  }
}
