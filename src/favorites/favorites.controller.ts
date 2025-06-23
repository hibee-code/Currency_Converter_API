import { Controller, Post, Get, Delete, Body, UseGuards, Request, Req, UnauthorizedException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addFavorite(@Body() body: { fromCurrency: string; toCurrency: string }, @Req() req: ExpressRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.favoritesService.addFavorite(req.user.id, body.fromCurrency, body.toCurrency);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getFavorites(@Req() req: ExpressRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Delete()
  async removeFavoritePair(
    @Body() body: { fromCurrency: string; toCurrency: string },
    @Request() req: ExpressRequest,
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.favoritesService.removeFavoritePair(
      req.user.id,
      body.fromCurrency,
      body.toCurrency,
    );
  }
} 