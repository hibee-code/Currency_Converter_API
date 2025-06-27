import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import * as cron from 'node-cron';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AlertsSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AlertsSchedulerService.name);
  constructor(
    private readonly alertsService: AlertsService,
    private readonly currencyService: CurrencyService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting alert notification scheduler (every 5 minutes)');
    // Runs every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      this.logger.log('Checking alerts for notification...');
      const currentRates = await this.currencyService.getExchangeRates();
      await this.alertsService.checkAndNotifyAlerts(currentRates.rates);
    });
  }
} 