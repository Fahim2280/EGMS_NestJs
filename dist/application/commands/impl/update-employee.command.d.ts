import { ContactPhone } from '../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../domain/common/attached-document.interface';
export declare class UpdateEmployeeCommand {
    readonly id: string;
    readonly companyId: string;
    readonly name: string;
    readonly address: string;
    readonly phoneNumber: string;
    readonly nidNumber: string;
    readonly updatedByStamp: string;
    readonly phoneNumbers?: ContactPhone[] | undefined;
    readonly documents?: AttachedDocument[] | undefined;
    constructor(id: string, companyId: string, name: string, address: string, phoneNumber: string, nidNumber: string, updatedByStamp: string, phoneNumbers?: ContactPhone[] | undefined, documents?: AttachedDocument[] | undefined);
}
