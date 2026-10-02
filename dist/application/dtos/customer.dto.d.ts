import { GuarantorResponseDto } from './guarantor.dto';
import { ContactPhoneDto } from './contact-phone.dto';
import { ContactPhone } from '../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../domain/common/attached-document.interface';
export declare class CreateCustomerDto {
    name: string;
    fatherName?: string;
    motherName?: string;
    address: string;
    mobileNumber?: string;
    phoneNumbers?: ContactPhoneDto[];
    phoneNumbersJson?: string;
    documents?: AttachedDocument[];
    documentsJson?: string;
    nidNumber: string;
    previousUnit: number;
    advanceMoney: number;
    garageId: string;
    customerCode?: string;
    removeAvatar?: string;
    hasGuarantor?: string;
    guarantorsJson?: string;
    guarantorName?: string;
    guarantorRelationship?: string;
    guarantorMobileNumber?: string;
    guarantorPhoneNumbersJson?: string;
    guarantorNidNumber?: string;
    guarantorFatherName?: string;
    guarantorMotherName?: string;
    guarantorAddress?: string;
    guarantorDocumentType?: string;
}
export declare class UpdateCustomerDto extends CreateCustomerDto {
}
export declare class CustomerResponseDto {
    id: string;
    cId?: number;
    companyId: string;
    customerCode?: string | null;
    name: string;
    fatherName: string;
    motherName: string;
    address: string;
    mobileNumber: string;
    phoneNumbers?: ContactPhone[];
    documents?: AttachedDocument[];
    nidNumber: string;
    previousUnit: number;
    advanceMoney: number;
    garageId?: string;
    garageName?: string;
    isActive: boolean;
    isGarageSuspended?: boolean;
    createdDate: Date;
    bills?: any[];
    guarantors?: GuarantorResponseDto[];
}
export declare class CustomerDashboardItemDto {
    id: string;
    cId?: number;
    customerCode?: string | null;
    name: string;
    mobileNumber: string;
    presentDues: number;
    advanceMoney: number;
    garageId?: string;
    garageName?: string;
    isActive: boolean;
    isGarageSuspended?: boolean;
    lastBillDate: Date;
    hasBills: boolean;
}
