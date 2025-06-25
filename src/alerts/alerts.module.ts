import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import { AlertsService } from './alerts.service';
import { AlertsSchedulerService } from './alerts.scheduler';
import { CurrencyModule } from '../currency/currency.module';
import { EmailService } from '../common/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), CurrencyModule],
  providers: [AlertsService, AlertsSchedulerService, EmailService],
  exports: [AlertsService],
})
export class AlertsModule {}
