import { ContactPhoneDto } from './contact-phone.dto';
import { ContactPhone } from '../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../domain/common/attached-document.interface';
export declare class CreateEmployeeDto {
    companyId?: string;
    name: string;
    address: string;
    email: string;
    password: string;
    phoneNumber?: string;
    phoneNumbers?: ContactPhoneDto[];
    phoneNumbersJson?: string;
    documents?: AttachedDocument[];
    documentsJson?: string;
    nidNumber: string;
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
export declare class UpdateEmployeeDto {
    name?: string;
    address?: string;
    phoneNumber?: string;
    phoneNumbers?: ContactPhoneDto[];
    phoneNumbersJson?: string;
    documents?: AttachedDocument[];
    documentsJson?: string;
    nidNumber?: string;
    removeAvatar?: string;
}
export declare class EmployeeResponseDto {
    id: string;
    companyId: string;
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    phoneNumbers?: ContactPhone[];
    documents?: AttachedDocument[];
    role: string;
    nidNumber: string;
    isActive: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    permittedGarageIds?: string[];
    permittedGarages?: any[];
    createdAt: string;
    updatedAt: string;
    createdDate?: Date;
    modifiedDate?: Date;
    createdBy?: string;
    editByName?: string;
    companyName?: string;
}
