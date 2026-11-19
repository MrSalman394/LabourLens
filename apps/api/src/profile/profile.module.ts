import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SpatialModule } from '../spatial/spatial.module';
import { AuthModule } from '../auth/auth.module';
import { WorkerProfileController } from './controllers/worker-profile.controller';
import { EmployerProfileController } from './controllers/employer-profile.controller';
import { TaxonomyController } from './controllers/taxonomy.controller';
import { WorkerProfileService } from './services/worker-profile.service';
import { EmployerProfileService } from './services/employer-profile.service';
import { TaxonomyService } from './services/taxonomy.service';
import { ProfileCompletionService } from './services/profile-completion.service';

@Module({
  imports: [PrismaModule, SpatialModule, AuthModule],
  controllers: [
    WorkerProfileController,
    EmployerProfileController,
    TaxonomyController,
  ],
  providers: [
    WorkerProfileService,
    EmployerProfileService,
    TaxonomyService,
    ProfileCompletionService,
  ],
  exports: [
    WorkerProfileService,
    EmployerProfileService,
    TaxonomyService,
    ProfileCompletionService,
  ],
})
export class ProfileModule {}
