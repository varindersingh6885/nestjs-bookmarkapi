import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt', // it sets 'jwt' name by default for this strategy because we used 'Strategy' from the passport-jwt, so we can skip
  // providing it here
  // otherwise we can provide a name we like such as 'jwt-verify-strategy'
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // we can perform any validation required here on the decoded jwt token

    // this will be appended to request object as user
    // req.user
    return { userId: payload.sub, email: payload.email };
  }
}
