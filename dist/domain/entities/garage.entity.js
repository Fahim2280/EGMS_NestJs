"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Garage = void 0;
const auditable_entity_1 = require("../common/auditable.entity");
class Garage extends auditable_entity_1.AuditableEntity {
    id;
    garageName;
    address;
    companyId;
    constructor(props) {
        super(props);
        this.validate(props);
        this.id = props.id;
        this.garageName = props.garageName.trim();
        this.address = props.address.trim();
        this.companyId = props.companyId;
    }
    static create(props) {
        return new Garage({
            ...props,
            isActive: true,
            isDeleted: false,
            createdDate: new Date(),
        });
    }
    updateDetails(garageName, address, updatedByStamp) {
        if (!garageName || garageName.trim().length < 2)
            throw new Error('Garage name must be at least 2 characters.');
        if (!address || address.trim().length < 3)
            throw new Error('Address must be at least 3 characters.');
        this.garageName = garageName.trim();
        this.address = address.trim();
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    toggleStatus(byStamp) {
        this.isActive = !this.isActive;
        if (byStamp) {
            this.markModified(byStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
        return this.isActive;
    }
    validate(props) {
        if (!props.id)
            throw new Error('Garage ID is required.');
        if (!props.companyId)
            throw new Error('Company ID is required.');
        if (!props.garageName || props.garageName.trim().length < 2)
            throw new Error('Garage name must be at least 2 characters.');
        if (!props.address || props.address.trim().length < 3)
            throw new Error('Address must be at least 3 characters.');
    }
}
exports.Garage = Garage;
//# sourceMappingURL=garage.entity.js.map