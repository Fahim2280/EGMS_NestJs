"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guarantor = void 0;
const auditable_entity_1 = require("../common/auditable.entity");
class Guarantor extends auditable_entity_1.AuditableEntity {
    id;
    customerId;
    employeeId;
    companyId;
    name;
    fatherName;
    motherName;
    address;
    mobileNumber;
    phoneNumbers;
    documents;
    nidNumber;
    relationship;
    constructor(props) {
        super(props);
        this.validate(props);
        this.id = props.id;
        this.customerId = props.customerId;
        this.employeeId = props.employeeId;
        this.companyId = props.companyId;
        this.name = props.name.trim();
        this.fatherName = (props.fatherName || '').trim();
        this.motherName = (props.motherName || '').trim();
        this.address = props.address.trim();
        this.documents = props.documents ? [...props.documents] : [];
        if (props.phoneNumbers && props.phoneNumbers.length > 0) {
            this.phoneNumbers = props.phoneNumbers.map((p) => ({
                number: p.number.trim(),
                type: p.type || 'PERSONAL',
                isPrimary: Boolean(p.isPrimary),
            }));
            const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
            primary.isPrimary = true;
            this.mobileNumber = primary.number;
        }
        else {
            const mob = (props.mobileNumber || '').trim();
            this.mobileNumber = mob;
            this.phoneNumbers = mob ? [{ number: mob, type: 'PRIMARY', isPrimary: true }] : [];
        }
        this.nidNumber = props.nidNumber.trim();
        this.relationship = (props.relationship || '').trim();
    }
    static create(props) {
        return new Guarantor({
            ...props,
            isActive: true,
            isDeleted: false,
            createdDate: props.createdDate || new Date(),
        });
    }
    updateDetails(name, fatherName, motherName, address, mobileNumber, nidNumber, relationship, updatedByStamp, phoneNumbers) {
        if (!name || name.trim().length < 2) {
            throw new Error('Guarantor name must be at least 2 characters.');
        }
        if (phoneNumbers && phoneNumbers.length > 0) {
            this.phoneNumbers = phoneNumbers.map((p) => ({
                number: p.number.trim(),
                type: p.type || 'PERSONAL',
                isPrimary: Boolean(p.isPrimary),
            }));
            const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
            primary.isPrimary = true;
            this.mobileNumber = primary.number;
        }
        else {
            if (!mobileNumber || mobileNumber.trim().length < 6) {
                throw new Error('Valid mobile number is required for guarantor.');
            }
            this.mobileNumber = mobileNumber.trim();
            this.phoneNumbers = [{ number: this.mobileNumber, type: 'PRIMARY', isPrimary: true }];
        }
        if (!nidNumber || nidNumber.trim().length < 6) {
            throw new Error('Valid NID number is required for guarantor.');
        }
        if (!address || address.trim().length < 2) {
            throw new Error('Address is required for guarantor.');
        }
        this.name = name.trim();
        this.fatherName = (fatherName || '').trim();
        this.motherName = (motherName || '').trim();
        this.address = address.trim();
        this.nidNumber = nidNumber.trim();
        if (relationship !== undefined) {
            this.relationship = (relationship || '').trim();
        }
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    addDocument(doc) {
        if (!this.documents) {
            this.documents = [];
        }
        this.documents.push(doc);
        this.modifiedDate = new Date();
    }
    removeDocument(docId) {
        if (!this.documents || this.documents.length === 0) {
            return null;
        }
        const index = this.documents.findIndex((d) => d.id === docId);
        if (index === -1) {
            return null;
        }
        const [removed] = this.documents.splice(index, 1);
        this.modifiedDate = new Date();
        return removed;
    }
    setDocuments(docs) {
        this.documents = docs ? [...docs] : [];
        this.modifiedDate = new Date();
    }
    validate(props) {
        if (!props.id)
            throw new Error('Guarantor ID is required.');
        if (!props.customerId && !props.employeeId) {
            throw new Error('Either Customer ID or Employee ID is required.');
        }
        if (!props.companyId)
            throw new Error('Company ID is required.');
        if (!props.name || props.name.trim().length < 2) {
            throw new Error('Guarantor name must be at least 2 characters.');
        }
        const hasValidPhone = (props.phoneNumbers && props.phoneNumbers.length > 0 && props.phoneNumbers[0].number?.trim().length >= 6) ||
            (props.mobileNumber && props.mobileNumber.trim().length >= 6);
        if (!hasValidPhone) {
            throw new Error('Valid mobile number is required.');
        }
        if (!props.nidNumber || props.nidNumber.trim().length < 6) {
            throw new Error('Valid NID number is required.');
        }
        if (!props.address || props.address.trim().length < 2) {
            throw new Error('Address is required.');
        }
    }
}
exports.Guarantor = Guarantor;
//# sourceMappingURL=guarantor.entity.js.map