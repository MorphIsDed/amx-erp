import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      const code = typeof err?.code === 'string' ? err.code : undefined;
      const databaseUrl = process.env.DATABASE_URL;

      const urlHint = databaseUrl
        ? `\n- DATABASE_URL: ${databaseUrl}`
        : `\n- DATABASE_URL is not set (check apps/api/.env)`;

      if (code === 'P1000') {
        // Authentication failed
        // Most common dev cause: a local Postgres instance is running on 5432 with a different password
        // (Docker guide expects postgres/postgres).
        // Provide an actionable message before rethrowing.

        console.error(
          [
            'Prisma failed to authenticate with the database (P1000).',
            urlHint,
            '',
            'Fix options:',
            '- If you are using Docker: ensure Docker Desktop is running, then from repo root run: docker-compose up -d',
            '- If you have a local Postgres on port 5432: either stop it, or update apps/api/.env to match its credentials',
            '- If you changed DB creds in docker-compose: update apps/api/.env DATABASE_URL accordingly',
          ].join('\n'),
        );
      } else if (code === 'P1001') {
        // Can't reach database server

        console.error(
          [
            'Prisma cannot reach the database server (P1001).',
            urlHint,
            '',
            'Fix options:',
            '- Start infrastructure: docker-compose up -d (repo root)',
            '- Ensure port 5432 is free (or adjust ports and DATABASE_URL)',
          ].join('\n'),
        );
      }

      throw err;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
