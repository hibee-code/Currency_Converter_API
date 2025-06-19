import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const throttlerConfig = ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => [
    {
      ttl: Number(configService.get('THROTTLE_TTL')),
      limit: Number(configService.get('THROTTLE_LIMIT')),
    },
  ],
  inject: [ConfigService],
}); 