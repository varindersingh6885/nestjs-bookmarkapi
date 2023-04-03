import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signup(dto: AuthDto) {
    // hash the user password
    const hash = await argon.hash(dto.password);

    // create new user in db
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      // return the user
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials aleady exists in database');
      } else {
        throw error;
      }
    }
  }

  async signin(dto: AuthDto) {
    // get user with emailId
    const user = await this.prismaService.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('User does not exists');
    }
    // console.log(user);
    // compare password with hash
    const isValid = await argon.verify(user.hash, dto.password);
    if (!isValid) {
      throw new ForbiddenException('Invalid Credentials');
    }
    delete user.hash;
    return user;
  }
}
