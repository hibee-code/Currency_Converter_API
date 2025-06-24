import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { EmailService } from '../common/email.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private emailService: EmailService,
  ) {}

  async addAlert(userId: number, fromCurrency: string, toCurrency: string, targetRate: number) {
    // ... create and save alert logic ...
  }

  async checkAndNotifyAlerts(currentRates: Record<string, number>) {
    const alerts = await this.alertRepository.find({ relations: ['user'] });
    for (const alert of alerts) {
      const rate = currentRates[alert.toCurrency] / currentRates[alert.fromCurrency];
      if (alert.isActive && rate >= alert.targetRate) {
        await this.emailService.sendAlert(alert.user.email, `Alert: ${alert.fromCurrency}/${alert.toCurrency} reached ${rate}`);
        // Optionally deactivate alert
        alert.isActive = false;
        await this.alertRepository.save(alert);
      }
    }
  }

  async getAlerts(userId: number) {
    // TODO: Implement logic to get alerts for a user
    return [];
  }
} 