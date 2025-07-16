import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CurrencyModule } from './currency/currency.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AlertsModule } from './alerts/alerts.module';
import { User } from './users/user.entity';
import { ConversionHistory } from './currency/conversion-history.entity';
import { FavoritePair } from './favorites/favorite-pair.entity';
import { Alert } from './alerts/alert.entity';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { redisConfig } from './config/redis/redis.config';
import { dataSourceOptions } from './config/database/data-source';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        });
    
        return {
          store, // ✅ use the resolved store directly
          ttl: 60,
        };
      },
    }),
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => [
    {
      ttl: Number(config.get('THROTTLE_TTL') ?? 60),
      limit: Number(config.get('THROTTLE_LIMIT') ?? 10),
    },
  ],
}),

    TypeOrmModule.forRoot(dataSourceOptions),

    UsersModule,
    AuthModule,
    CurrencyModule,
    FavoritesModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}