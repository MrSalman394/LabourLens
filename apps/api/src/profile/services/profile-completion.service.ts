import { Injectable } from '@nestjs/common';

export interface ProfileCompletionResult {
  percentage: number;
  suggestions: string[];
  isProfileComplete: boolean;
  breakdown: Record<string, { weight: number; completed: boolean; label: string }>;
}

@Injectable()
export class ProfileCompletionService {
  /**
   * Computes worker profile completion percentage and action-oriented suggestions.
   * Note: This measures profile completeness, NOT verification credibility.
   */
  calculateWorkerCompletion(worker: any, address?: any): ProfileCompletionResult {
    const breakdown: Record<string, { weight: number; completed: boolean; label: string }> = {
      headline: {
        weight: 10,
        completed: Boolean(worker.headline && worker.headline.trim().length >= 3),
        label: 'Professional Headline',
      },
      bio: {
        weight: 10,
        completed: Boolean(worker.bio && worker.bio.trim().length >= 20),
        label: 'Biography / Professional Summary',
      },
      photo: {
        weight: 5,
        completed: Boolean(worker.profilePictureUrl && worker.profilePictureUrl.length > 5),
        label: 'Profile Picture',
      },
      personalInfo: {
        weight: 5,
        completed: Boolean(worker.gender && worker.dateOfBirth),
        label: 'Personal Details (Gender & DOB)',
      },
      primaryCategory: {
        weight: 10,
        completed: Boolean(worker.primaryCategoryId),
        label: 'Primary Trade Category',
      },
      skillsBase: {
        weight: 10,
        completed: Boolean(worker.skills && worker.skills.length >= 1),
        label: 'At least 1 Skill Added',
      },
      skillsAdvanced: {
        weight: 5,
        completed: Boolean(worker.skills && worker.skills.length >= 3),
        label: '3 or more Skills Added',
      },
      wageRates: {
        weight: 10,
        completed: Boolean(
          worker.expectedWageDailyMinor ||
          worker.expectedWageHourlyMinor ||
          worker.expectedWageMonthlyMinor,
        ),
        label: 'Expected Wage / Rate',
      },
      engagementType: {
        weight: 5,
        completed: Boolean(worker.preferredEngagementType && worker.preferredEngagementType !== 'ANY'),
        label: 'Preferred Work Engagement Type',
      },
      experience: {
        weight: 10,
        completed: Boolean(worker.experiences && worker.experiences.length >= 1),
        label: 'Work Experience History',
      },
      credentialsOrPortfolio: {
        weight: 10,
        completed: Boolean(
          (worker.qualifications && worker.qualifications.length >= 1) ||
          (Array.isArray(worker.portfolioItems) && worker.portfolioItems.length >= 1),
        ),
        label: 'Certifications or Portfolio Projects',
      },
      location: {
        weight: 10,
        completed: Boolean(address && address.city && address.locality),
        label: 'Address & City Location',
      },
    };

    let totalScore = 0;
    const suggestions: string[] = [];

    for (const key of Object.keys(breakdown)) {
      const item = breakdown[key];
      if (item.completed) {
        totalScore += item.weight;
      } else {
        switch (key) {
          case 'headline':
            suggestions.push('Add a professional headline (e.g. "Senior Industrial Electrician") to summarize your trade.');
            break;
          case 'bio':
            suggestions.push('Write a short bio (at least 20 characters) highlighting your hands-on expertise.');
            break;
          case 'photo':
            suggestions.push('Upload a clear profile photo to enhance transparency and recognition.');
            break;
          case 'personalInfo':
            suggestions.push('Provide your date of birth and gender to complete your personal profile.');
            break;
          case 'primaryCategory':
            suggestions.push('Select your primary category so employers can find you in trade directories.');
            break;
          case 'skillsBase':
            suggestions.push('Add your primary skills with years of experience.');
            break;
          case 'skillsAdvanced':
            suggestions.push('Add at least 3 skills to demonstrate versatile capabilities.');
            break;
          case 'wageRates':
            suggestions.push('Specify your expected daily or hourly wage rate.');
            break;
          case 'engagementType':
            suggestions.push('Specify your preferred engagement type (Daily, Hourly, or Project).');
            break;
          case 'experience':
            suggestions.push('Add at least one past work experience or employment record.');
            break;
          case 'credentialsOrPortfolio':
            suggestions.push('Upload a vocational certificate (e.g. NAVTTC/TEVTA) or add portfolio photos.');
            break;
          case 'location':
            suggestions.push('Set your city and locality for accurate geographic proximity matching.');
            break;
        }
      }
    }

    return {
      percentage: Math.min(100, totalScore),
      suggestions,
      isProfileComplete: totalScore >= 80,
      breakdown,
    };
  }

  /**
   * Computes employer profile completion percentage.
   */
  calculateEmployerCompletion(employer: any, address?: any): ProfileCompletionResult {
    const breakdown: Record<string, { weight: number; completed: boolean; label: string }> = {
      name: {
        weight: 20,
        completed: Boolean(employer.displayName && employer.displayName.trim().length >= 2),
        label: 'Employer / Contact Name',
      },
      businessName: {
        weight: 15,
        completed: Boolean(employer.businessName || employer.employerType === 'INDIVIDUAL_HOUSEHOLD'),
        label: 'Business / Household Name',
      },
      description: {
        weight: 15,
        completed: Boolean(employer.description && employer.description.trim().length >= 15),
        label: 'Company or Household Description',
      },
      photo: {
        weight: 10,
        completed: Boolean(employer.profilePictureUrl && employer.profilePictureUrl.length > 5),
        label: 'Profile / Company Logo',
      },
      location: {
        weight: 20,
        completed: Boolean(address && address.city && address.locality),
        label: 'Work Site or Office Address',
      },
      hiringPreferences: {
        weight: 20,
        completed: Boolean(
          employer.hiringPreferences &&
          (employer.hiringPreferences.preferredCategoryIds?.length > 0 ||
           employer.hiringPreferences.preferredEngagementTypes?.length > 0),
        ),
        label: 'Hiring Preferences Specified',
      },
    };

    let totalScore = 0;
    const suggestions: string[] = [];

    for (const key of Object.keys(breakdown)) {
      const item = breakdown[key];
      if (item.completed) {
        totalScore += item.weight;
      } else {
        switch (key) {
          case 'name':
            suggestions.push('Provide a contact name for your employer account.');
            break;
          case 'businessName':
            suggestions.push('Add your company or contractor business name.');
            break;
          case 'description':
            suggestions.push('Add a description detailing your typical projects or household needs.');
            break;
          case 'photo':
            suggestions.push('Upload a logo or profile image.');
            break;
          case 'location':
            suggestions.push('Add your city, area, and location for geographic job matching.');
            break;
          case 'hiringPreferences':
            suggestions.push('Specify preferred worker categories and work engagement models.');
            break;
        }
      }
    }

    return {
      percentage: Math.min(100, totalScore),
      suggestions,
      isProfileComplete: totalScore >= 75,
      breakdown,
    };
  }
}
