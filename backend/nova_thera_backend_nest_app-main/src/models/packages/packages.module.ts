import { Module } from '@nestjs/common';
import { PackagesRepository } from './packages.repository';
import { PackagesService } from './packages.service';

@Module({
  providers: [PackagesRepository, PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
