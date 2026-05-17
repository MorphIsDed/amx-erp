import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdempotencyService {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  /**
   * Checks if an operation is idempotent (has not been executed before).
   * @param key Unique identifier for the operation (e.g., event ID)
   * @param ttl Seconds to keep the idempotency key (default: 24 hours)
   * @returns true if the operation is safe to proceed, false if it's a duplicate
   */
  async isIdempotent(key: string, ttl: number = 86400): Promise<boolean> {
    const prefixedKey = `idempotency:${key}`;
    // NX = Set if Not eXists, EX = expire in seconds
    const result = await this.redisClient.set(prefixedKey, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }
}
