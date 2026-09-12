import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies.jwt_token || req.cookies.jwt || null;
  }
  return null;
};

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName?: string;
  phoneNumber?: string;
  nidNumber?: string;
  garageName?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'super_secret_jwt_egms_key_2026_enterprise_secure!',
      ),
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.fullName,
      role: payload.role,
      companyId: payload.companyId,
      companyName: payload.companyName,
      phoneNumber: payload.phoneNumber,
      nidNumber: payload.nidNumber,
      garageName: payload.garageName,
    };
  }
}
