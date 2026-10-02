import { ContactPhoneDto } from './contact-phone.dto';
import { ContactPhone } from '../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../domain/common/attached-document.interface';
export declare class CreateGuarantorDto {
    name: string;
    fatherName?: string;
    motherName?: string;
    mobileNumber?: string;
    phoneNumbers?: ContactPhoneDto[];
    phoneNumbersJson?: string;
    documents?: AttachedDocument[];
    documentsJson?: string;
    documentType?: string;
    nidNumber: string;
    address: string;
    relationship?: string;
}
export declare class UpdateGuarantorDto extends CreateGuarantorDto {
}
export declare class GuarantorResponseDto {
    id: string;
    customerId?: string;
    employeeId?: string;
    companyId: string;
    name: string;
    fatherName: string;
    motherName: string;
    address: string;
    mobileNumber: string;
    phoneNumbers?: ContactPhone[];
    documents?: AttachedDocument[];
    nidNumber: string;
    relationship: string;
    createdDate: Date;
}
