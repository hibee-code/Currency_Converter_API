import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritePair } from './favorite-pair.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoritePair])],
})
export class FavoritesModule {}
