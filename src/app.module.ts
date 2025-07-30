// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { CurrencyModule } from './currency/currency.module';
// import { FavoritesModule } from './favorites/favorites.module';
// import { AlertsModule } from './alerts/alerts.module';
// import { User } from './users/user.entity';
// import { ConversionHistory } from './currency/conversion-history.entity';
// import { FavoritePair } from './favorites/favorite-pair.entity';
// import { Alert } from './alerts/alert.entity';
// import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
// import { redisConfig } from './config/redis/redis.config';
// import { dataSourceOptions } from './config/database/data-source';
// import { CacheModule } from '@nestjs/cache-manager';
// import { redisStore } from 'cache-manager-redis-yet';


// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),

//     CacheModule.registerAsync({
//       isGlobal: true,
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (config: ConfigService) => {
//         // Option 1: Redis Cache (Recommended)
//         try {
//           return {
//             store: redisStore,
//             url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', '6379')}`,
//             ttl: 60 * 1000, // 60 seconds in milliseconds
//             // Additional Redis options
//             retryDelayOnFailover: 100,
//             maxRetriesPerRequest: 3,
//           };
//         } catch (error) {
//           console.warn('Redis cache setup failed, falling back to in-memory cache:', error);
//           // Fallback to in-memory cache if Redis fails
//           return {
//             ttl: 60 * 1000,
//           };
//         }
//       },
//     }),

//     ThrottlerModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => [
//         {
//           ttl: Number(config.get('THROTTLE_TTL') ?? 60),
//           limit: Number(config.get('THROTTLE_LIMIT') ?? 10),
//         },
//       ],
//     }),

//     TypeOrmModule.forRoot(dataSourceOptions),

//     UsersModule,
//     AuthModule,
//     CurrencyModule,
//     FavoritesModule,
//     AlertsModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CurrencyModule } from './currency/currency.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AlertsModule } from './alerts/alerts.module';
import { dataSourceOptions } from './config/database/data-source';
import { redisStore } from 'cache-manager-redis-yet';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          store: redisStore,
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379')),
          ttl: 60, // seconds (not milliseconds for this package)
          max: 100, // maximum number of items in cache
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