import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import * as cron from 'node-cron';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AlertsSchedulerService implements OnModuleInit {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly currencyService: CurrencyService,
  ) {}

  onModuleInit() {
    // Runs every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      const currentRates = await this.currencyService.getExchangeRates();
      await this.alertsService.checkAndNotifyAlerts(currentRates.rates);
    });
  }
} 