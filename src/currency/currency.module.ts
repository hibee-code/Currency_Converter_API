// currency.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { ConversionHistory } from './conversion-history.entity';
import { CurrencyGateway } from 'src/websocket/currency.gateway';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    TypeOrmModule.forFeature([ConversionHistory]),
    CacheModule.register(),
    HttpModule,
    ConfigModule, // Caching support
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, CurrencyGateway],
  exports: [CurrencyService],
})
export class CurrencyModule {}
