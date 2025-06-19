import { Module } from '@nestjs/common';
import { CurrencyGateway } from './currency.gateway';
import { CurrencyModule } from '../currency/currency.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CurrencyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CurrencyGateway],
  exports: [CurrencyGateway],
})
export class WebsocketModule {} 