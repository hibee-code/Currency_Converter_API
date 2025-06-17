import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionHistory } from './conversion-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConversionHistory])],
})
export class CurrencyModule {}
