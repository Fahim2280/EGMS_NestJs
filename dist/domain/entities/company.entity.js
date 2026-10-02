"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const auditable_entity_1 = require("../common/auditable.entity");
class Company extends auditable_entity_1.AuditableEntity {
    id;
    name;
    companyName;
    email;
    password;
    phoneNumber;
    role;
    address;
    unitRate;
    registrationStatus;
    constructor(props) {
        super(props);
        this.validate(props);
        this.id = props.id;
        this.name = props.name.trim();
        this.companyName = props.companyName.trim();
        this.email = props.email.trim().toLowerCase();
        this.password = props.password;
        this.phoneNumber = props.phoneNumber.trim();
        this.role = props.role || 'SUPER_ADMIN';
        this.address = props.address.trim();
        this.unitRate = props.unitRate !== undefined && props.unitRate !== null ? Number(props.unitRate) : 15;
        this.registrationStatus = props.registrationStatus ?? 'PENDING';
    }
    static create(props) {
        return new Company({
            ...props,
            role: 'SUPER_ADMIN',
            isActive: false,
            registrationStatus: 'PENDING',
            isDeleted: false,
            createdDate: new Date(),
        });
    }
    updateDetails(name, companyName, phoneNumber, address, unitRate, updatedByStamp) {
        if (!name || name.trim().length < 2)
            throw new Error('Name must be at least 2 characters.');
        if (!companyName || companyName.trim().length < 2)
            throw new Error('Company name must be at least 2 characters.');
        this.name = name.trim();
        this.companyName = companyName.trim();
        this.phoneNumber = phoneNumber.trim();
        this.address = address.trim();
        if (unitRate !== undefined && unitRate !== null) {
            if (Number(unitRate) <= 0)
                throw new Error('Unit rate must be greater than 0.');
            this.unitRate = Number(unitRate);
        }
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    approve() {
        this.registrationStatus = 'ACTIVE';
        this.isActive = true;
        this.modifiedDate = new Date();
    }
    updatePassword(hashedPassword, updatedByStamp) {
        if (!hashedPassword)
            throw new Error('Password hash cannot be empty.');
        this.password = hashedPassword;
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    validate(props) {
        if (!props.id)
            throw new Error('Company ID is required.');
        if (!props.name || props.name.trim().length < 2)
            throw new Error('Name must be at least 2 characters.');
        if (!props.companyName || props.companyName.trim().length < 2)
            throw new Error('Company name must be at least 2 characters.');
        if (!props.email || !props.email.includes('@'))
            throw new Error('A valid company email is required.');
        if (!props.password)
            throw new Error('Password is required.');
        if (!props.phoneNumber || props.phoneNumber.trim().length < 6)
            throw new Error('Phone number is required.');
        if (!props.address || props.address.trim().length < 3)
            throw new Error('Address is required.');
    }
}
exports.Company = Company;
//# sourceMappingURL=company.entity.js.map