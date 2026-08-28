import { Module } from '@nestjs/common';
import { ServiceCategoriesRepository } from './service-categories.repository';
import { ServiceCategoriesService } from './service-categories.service';

@Module({
  providers: [ServiceCategoriesRepository, ServiceCategoriesService],
  exports: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
