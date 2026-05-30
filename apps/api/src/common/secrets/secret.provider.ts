import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretProvider implements OnModuleInit {
  private readonly logger = new Logger(SecretProvider.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.validateSecrets();
  }

  validateSecrets() {
    this.logger.log('Initiating production secret validation scan...');

    // 1. Critical Secrets (Application MUST crash if these are missing)
    const requiredKeys = ['DATABASE_URL', 'JWT_SECRET'];
    const missingKeys: string[] = [];

    for (const key of requiredKeys) {
      const val = this.configService.get<string>(key) || process.env[key];
      if (!val || val.trim() === '') {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      const errorMsg = `FATAL SECURITY CONFIGURATION ERROR: Missing required secrets: [${missingKeys.join(', ')}]. NestJS application startup aborted.`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 2. Non-Critical Secrets / Integrations (With safe fallbacks and warnings)
    const integrationKeys = [
      { key: 'REDIS_HOST', fallback: '127.0.0.1' },
      { key: 'REDIS_PORT', fallback: '6379' },
      { key: 'PORT', fallback: '3001' },
    ];

    for (const integration of integrationKeys) {
      const val =
        this.configService.get<string>(integration.key) ||
        process.env[integration.key];
      if (!val || val.trim() === '') {
        this.logger.warn(
          `Configuration Warning: Missing optional key "${integration.key}". Falling back to default: "${integration.fallback}".`,
        );
        // Set fallback in process.env so downstream services can consume it
        process.env[integration.key] = integration.fallback;
      }
    }

    this.logger.log(
      'Secret validation scan completed successfully. All required keys verified.',
    );
  }

  // Vault/External provider interface (easily extensible for production integrations)
  getSecret(key: string): string {
    return this.configService.get<string>(key) || process.env[key] || '';
  }
}
