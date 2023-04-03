import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://varinder:root@localhost:5432/bookmarkapi?schema=public',
        },
      },
    });
  }
}
