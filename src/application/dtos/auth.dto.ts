import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export interface AuthenticatedUserPayload {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'GENERAL' | string;
  companyId: string;
  companyName?: string;
  phoneNumber?: string;
  nidNumber?: string;
  garageName?: string;
}

export class AuthResponseDto {
  success: boolean;
  message: string;
  data: {
    user: AuthenticatedUserPayload;
    accessToken: string;
  };
}
