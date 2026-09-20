export interface CreatePasswordResetTokenProps {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  isUsed?: boolean;
  createdAt?: Date;
}

export class PasswordResetToken {
  public readonly id: string;
  public readonly email: string;
  public readonly token: string;
  public readonly expiresAt: Date;
  public isUsed: boolean;
  public readonly createdAt: Date;

  constructor(props: CreatePasswordResetTokenProps) {
    this.id = props.id;
    this.email = props.email.trim().toLowerCase();
    this.token = props.token;
    this.expiresAt = new Date(props.expiresAt);
    this.isUsed = props.isUsed ?? false;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
  }

  public isValid(): boolean {
    return !this.isUsed && this.expiresAt.getTime() > Date.now();
  }

  public markUsed(): void {
    this.isUsed = true;
  }
}
