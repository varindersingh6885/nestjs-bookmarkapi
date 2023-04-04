import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUserById(userReq) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userReq.userId },
    });
    delete user.hash;
    return user;
  }
}
