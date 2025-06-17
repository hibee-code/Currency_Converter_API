import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
})
export class AlertsModule {}
