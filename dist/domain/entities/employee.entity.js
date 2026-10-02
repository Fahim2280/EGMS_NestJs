"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const auditable_entity_1 = require("../common/auditable.entity");
class Employee extends auditable_entity_1.AuditableEntity {
    id;
    companyId;
    name;
    address;
    email;
    password;
    phoneNumber;
    phoneNumbers;
    documents;
    role;
    nidNumber;
    canCreate;
    canEdit;
    canDelete;
    canView;
    permittedGarageIds;
    constructor(props) {
        super(props);
        this.validate(props);
        this.id = props.id;
        this.companyId = props.companyId;
        this.name = props.name.trim();
        this.address = props.address.trim();
        this.email = props.email.trim().toLowerCase();
        this.password = props.password;
        this.documents = props.documents ? [...props.documents] : [];
        if (props.phoneNumbers && props.phoneNumbers.length > 0) {
            this.phoneNumbers = props.phoneNumbers.map((p) => ({
                number: p.number.trim(),
                type: p.type || 'PERSONAL',
                isPrimary: Boolean(p.isPrimary),
            }));
            const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
            primary.isPrimary = true;
            this.phoneNumber = primary.number;
        }
        else {
            const ph = (props.phoneNumber || '').trim();
            this.phoneNumber = ph;
            this.phoneNumbers = ph ? [{ number: ph, type: 'PRIMARY', isPrimary: true }] : [];
        }
        this.role = props.role || 'GENERAL';
        this.nidNumber = props.nidNumber.trim();
        this.canCreate = props.canCreate ?? (props.role === 'SUPER_ADMIN');
        this.canEdit = props.canEdit ?? (props.role === 'SUPER_ADMIN');
        this.canDelete = props.canDelete ?? (props.role === 'SUPER_ADMIN');
        this.canView = props.canView ?? true;
        this.permittedGarageIds = props.permittedGarageIds ? [...props.permittedGarageIds] : [];
    }
    static create(props) {
        return new Employee({
            ...props,
            role: props.role || 'GENERAL',
            canCreate: props.canCreate ?? (props.role === 'SUPER_ADMIN'),
            canEdit: props.canEdit ?? (props.role === 'SUPER_ADMIN'),
            canDelete: props.canDelete ?? (props.role === 'SUPER_ADMIN'),
            canView: props.canView ?? true,
            permittedGarageIds: props.permittedGarageIds ? [...props.permittedGarageIds] : [],
            isActive: true,
            isDeleted: false,
            createdDate: new Date(),
        });
    }
    updateDetails(name, address, phoneNumber, nidNumber, updatedByStamp, phoneNumbers) {
        if (!name || name.trim().length < 2)
            throw new Error('Employee name must be at least 2 characters.');
        if (!address || address.trim().length < 3)
            throw new Error('Address must be at least 3 characters.');
        if (phoneNumbers && phoneNumbers.length > 0) {
            this.phoneNumbers = phoneNumbers.map((p) => ({
                number: p.number.trim(),
                type: p.type || 'PERSONAL',
                isPrimary: Boolean(p.isPrimary),
            }));
            const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
            primary.isPrimary = true;
            this.phoneNumber = primary.number;
        }
        else {
            if (!phoneNumber || phoneNumber.trim().length < 6)
                throw new Error('Phone number is required.');
            this.phoneNumber = phoneNumber.trim();
            this.phoneNumbers = [{ number: this.phoneNumber, type: 'PRIMARY', isPrimary: true }];
        }
        if (!nidNumber || nidNumber.trim().length < 5)
            throw new Error('A valid NID Number is required.');
        this.name = name.trim();
        this.address = address.trim();
        this.nidNumber = nidNumber.trim();
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
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
    updateRole(newRole, updatedByStamp) {
        const validRoles = ['SUPER_ADMIN', 'GENERAL'];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role '${newRole}'. Allowed roles: ${validRoles.join(', ')}`);
        }
        this.role = newRole;
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    updatePermissions(canCreate, canEdit, canDelete, canView, garageIds, updatedByStamp) {
        this.canCreate = Boolean(canCreate);
        this.canEdit = Boolean(canEdit);
        this.canDelete = Boolean(canDelete);
        this.canView = Boolean(canView);
        this.permittedGarageIds = Array.isArray(garageIds) ? [...garageIds] : [];
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
    hasGarageAccess(garageId) {
        if (this.role === 'SUPER_ADMIN')
            return true;
        if (!garageId)
            return false;
        return this.permittedGarageIds.includes(garageId);
    }
    canPerform(action) {
        if (this.role === 'SUPER_ADMIN')
            return true;
        switch (action) {
            case 'create':
                return this.canCreate;
            case 'edit':
                return this.canEdit;
            case 'delete':
                return this.canDelete;
            case 'view':
                return this.canView;
            default:
                return false;
        }
    }
    validate(props) {
        if (!props.id)
            throw new Error('Employee ID is required.');
        if (!props.companyId)
            throw new Error('Company ID is required.');
        if (!props.name || props.name.trim().length < 2)
            throw new Error('Employee name must be at least 2 characters.');
        if (!props.address || props.address.trim().length < 3)
            throw new Error('Address must be at least 3 characters.');
        if (!props.email || !props.email.includes('@'))
            throw new Error('A valid email address is required.');
        if (!props.password)
            throw new Error('Password is required.');
        const hasValidPhone = (props.phoneNumbers && props.phoneNumbers.length > 0 && props.phoneNumbers[0].number?.trim().length >= 6) ||
            (props.phoneNumber && props.phoneNumber.trim().length >= 6);
        if (!hasValidPhone)
            throw new Error('Phone number is required.');
        if (!props.nidNumber || props.nidNumber.trim().length < 5)
            throw new Error('NID number must be at least 5 characters.');
    }
}
exports.Employee = Employee;
//# sourceMappingURL=employee.entity.js.map