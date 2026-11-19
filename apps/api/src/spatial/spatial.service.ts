import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NearbyAddressResult {
  id: string;
  owner_user_id: string;
  address_type: string;
  locality: string;
  city: string;
  distance_meters: number;
}

@Injectable()
export class SpatialService {
  private readonly logger = new Logger(SpatialService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Updates an address location using parameterized PostGIS geography point construction.
   * Parameterized via Prisma tagged template literal ($1, $2, $3).
   * Note: PostGIS expects longitude first, then latitude.
   */
  async updateAddressLocation(addressId: string, longitude: number, latitude: number): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE "addresses"
      SET 
        "location" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        "approximate_latitude" = ${latitude},
        "approximate_longitude" = ${longitude}
      WHERE "id" = ${addressId}::uuid;
    `;
  }

  /**
   * Finds addresses within a specified radius (in meters) using PostGIS ST_DWithin and ST_Distance.
   * Parameterized query utilizing the GiST spatial index on "addresses"("location").
   */
  async findNearbyAddresses(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit: number = 20,
  ): Promise<NearbyAddressResult[]> {
    return this.prisma.$queryRaw<NearbyAddressResult[]>`
      SELECT 
        a.id,
        a.owner_user_id,
        a.address_type,
        a.locality,
        a.city,
        ST_Distance(
          a.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) AS distance_meters
      FROM "addresses" a
      WHERE a."location" IS NOT NULL
        AND a."deleted_at" IS NULL
        AND ST_DWithin(
          a.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY distance_meters ASC
      LIMIT ${limit};
    `;
  }

  /**
   * Calculates the exact geodesic distance in meters between two coordinates.
   */
  async calculateDistanceBetweenCoordinates(
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ distance_meters: number }>>`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lon1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lon2}, ${lat2}), 4326)::geography
      ) AS distance_meters;
    `;
    return result[0]?.distance_meters ?? 0;
  }
}
