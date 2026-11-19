import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully established connection to PostgreSQL (labourlens_db).');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma Client disconnected from PostgreSQL.');
  }

  /**
   * Healthcheck helper verifying connection and PostGIS availability.
   */
  async checkHealth(): Promise<{ status: string; postgisVersion: string; timestamp: Date }> {
    const result = await this.$queryRaw<Array<{ postgis_version: string; now: Date }>>`
      SELECT PostGIS_Version() as postgis_version, NOW() as now;
    `;
    return {
      status: 'UP',
      postgisVersion: result[0]?.postgis_version || 'unknown',
      timestamp: result[0]?.now || new Date(),
    };
  }
}
