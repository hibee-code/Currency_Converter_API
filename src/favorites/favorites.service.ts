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

  async addFavoritePair(userId: number, fromCurrency: string, toCurrency: string) {
    const existing = await this.favoritePairRepository.findOne({
      where: { userId, fromCurrency, toCurrency },
    });

    if (existing) {
      throw new Error('Favorite pair already exists');
    }

    const favorite = this.favoritePairRepository.create({
      userId,
      fromCurrency,
      toCurrency,
    });

    return this.favoritePairRepository.save(favorite);
  }

  async getFavoritePairs(userId: number) {
    return this.favoritePairRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async removeFavoritePair(userId: number, fromCurrency: string, toCurrency: string) {
    const favorite = await this.favoritePairRepository.findOne({
      where: { userId, fromCurrency, toCurrency },
    });

    if (!favorite) {
      throw new Error('Favorite pair not found');
    }

    await this.favoritePairRepository.remove(favorite);
    return { message: 'Favorite pair removed successfully' };
  }
} 