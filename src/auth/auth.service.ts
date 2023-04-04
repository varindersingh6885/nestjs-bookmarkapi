import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}

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
    const passwordMatches = await argon.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid Credentials');
    }

    const authToken = await this.signToken(user.id, user.email);

    return authToken;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ auth_token: string }> {
    const payload = {
      sub: userId,
      userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    return { auth_token: token };
  }

  async verifyToken(token: string) {
    return await this.jwt.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
