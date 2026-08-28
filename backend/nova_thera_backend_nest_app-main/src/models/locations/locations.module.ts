import { Module } from '@nestjs/common';
import { LocationsRepository } from './locations.repository';
import { LocationsService } from './locations.service';

@Module({
  providers: [LocationsRepository, LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
