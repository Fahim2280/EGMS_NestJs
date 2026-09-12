import { LoginDto } from '../../dtos/auth.dto';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}
