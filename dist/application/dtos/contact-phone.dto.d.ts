import { ContactPhone, PhoneType } from '../../domain/common/contact-phone.interface';
export declare class ContactPhoneDto implements ContactPhone {
    number: string;
    type?: PhoneType | string;
    isPrimary?: boolean;
}
export declare function parsePhoneNumbersInput(rawInput: any, fallbackSinglePhone?: string): ContactPhone[];
