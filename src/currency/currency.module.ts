// currency.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { ConversionHistory } from './conversion-history.entity';
import { CurrencyGateway } from 'src/websocket/currency.gateway';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    forwardRef(() => CurrencyModule),
    TypeOrmModule.forFeature([ConversionHistory]),
    CacheModule.register(),
    HttpModule,
    ConfigModule, // Caching support
    AuthModule, // Caching support
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, CurrencyGateway],
  exports: [CurrencyService],
})
export class CurrencyModule {}
