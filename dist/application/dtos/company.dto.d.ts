export declare class RegisterCompanyDto {
    name: string;
    companyName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phoneNumber: string;
    address: string;
    initialGarageName?: string;
    initialGarageAddress?: string;
}
export declare class UpdateCompanyDto {
    name?: string;
    companyName?: string;
    phoneNumber?: string;
    address?: string;
}
export declare class CompanyResponseDto {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phoneNumber: string;
    role: string;
    address: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdDate?: Date;
    modifiedDate?: Date;
    createdBy?: string;
    editByName?: string;
    garages?: any[];
    employeeCount?: number;
}
