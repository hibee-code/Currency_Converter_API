import { Controller, Post, Get, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addAlert(@Body() body: { fromCurrency: string; toCurrency: string; targetRate: number }, @Req() req: ExpressRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.alertsService.addAlert(req.user.id, body.fromCurrency, body.toCurrency, body.targetRate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAlerts(@Req() req: ExpressRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.alertsService.getAlerts(req.user.id);
  }
} 