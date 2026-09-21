import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EMPLOYEE_REPOSITORY_TOKEN, IEmployeeRepository } from '@domain/index';

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
  constructor(
    private readonly configService: ConfigService,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {
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

    if (payload.role === 'SUPER_ADMIN') {
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.fullName,
        role: 'SUPER_ADMIN',
        companyId: payload.companyId,
        companyName: payload.companyName,
        phoneNumber: payload.phoneNumber,
        nidNumber: payload.nidNumber,
        garageName: payload.garageName,
        isSuperAdmin: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        garageIds: null,
      };
    }

    // General Employee: retrieve live state from employee repository
    const employee = await this.employeeRepo.findById(payload.sub);
    if (!employee || !employee.isActive || employee.isDeleted) {
      throw new UnauthorizedException('Employee account is inactive, suspended, or not found.');
    }

    const isSuperAdmin = employee.role === 'SUPER_ADMIN';

    return {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role || 'GENERAL',
      companyId: employee.companyId,
      companyName: payload.companyName,
      phoneNumber: employee.phoneNumber,
      nidNumber: employee.nidNumber,
      isSuperAdmin,
      canCreate: isSuperAdmin ? true : Boolean(employee.canCreate),
      canEdit: isSuperAdmin ? true : Boolean(employee.canEdit),
      canDelete: isSuperAdmin ? true : Boolean(employee.canDelete),
      canView: isSuperAdmin ? true : Boolean(employee.canView),
      garageIds: isSuperAdmin ? null : (employee.permittedGarageIds || []),
    };
  }
}
