export interface CreateCompanyApprovalTokenProps {
  id: string;
  companyId: string;
  token: string;
  expiresAt: Date;
  isUsed?: boolean;
  createdAt?: Date;
}

export class CompanyApprovalToken {
  public readonly id: string;
  public readonly companyId: string;
  public readonly token: string;
  public readonly expiresAt: Date;
  public isUsed: boolean;
  public readonly createdAt: Date;

  constructor(props: CreateCompanyApprovalTokenProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.token = props.token;
    this.expiresAt = new Date(props.expiresAt);
    this.isUsed = props.isUsed ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  public isValid(): boolean {
    return !this.isUsed && this.expiresAt.getTime() > Date.now();
  }

  public markUsed(): void {
    this.isUsed = true;
  }
}
