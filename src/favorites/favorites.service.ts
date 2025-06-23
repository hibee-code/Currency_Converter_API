import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritePair } from './favorite-pair.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritePair)
    private favoritePairRepository: Repository<FavoritePair>,
  ) {}

  async addFavorite(userId: number, fromCurrency: string, toCurrency: string) {
    const favorite = this.favoritePairRepository.create({
      user: { id: userId },
      fromCurrency,
      toCurrency,
    });
    return this.favoritePairRepository.save(favorite);
  }

  async getFavorites(userId: number) {
    return this.favoritePairRepository.find({
      where: { user: { id: userId } },
    });
  }

  async removeFavoritePair(userId: number, fromCurrency: string, toCurrency: string) {
    return this.favoritePairRepository.delete({
      user: { id: userId },
      fromCurrency,
      toCurrency,
    });
  }
} 