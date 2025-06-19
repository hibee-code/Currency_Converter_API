import { Controller, Post, Get, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavoritePair(
    @Body() body: { fromCurrency: string; toCurrency: string },
    @Request() req,
  ) {
    return this.favoritesService.addFavoritePair(
      req.user.id,
      body.fromCurrency,
      body.toCurrency,
    );
  }

  @Get()
  async getFavoritePairs(@Request() req) {
    return this.favoritesService.getFavoritePairs(req.user.id);
  }

  @Delete()
  async removeFavoritePair(
    @Body() body: { fromCurrency: string; toCurrency: string },
    @Request() req,
  ) {
    return this.favoritesService.removeFavoritePair(
      req.user.id,
      body.fromCurrency,
      body.toCurrency,
    );
  }
} 