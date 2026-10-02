"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompanyCommand = void 0;
class UpdateCompanyCommand {
    companyId;
    name;
    companyName;
    phoneNumber;
    address;
    updatedByStamp;
    unitRate;
    constructor(companyId, name, companyName, phoneNumber, address, updatedByStamp, unitRate) {
        this.companyId = companyId;
        this.name = name;
        this.companyName = companyName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.updatedByStamp = updatedByStamp;
        this.unitRate = unitRate;
    }
}
exports.UpdateCompanyCommand = UpdateCompanyCommand;
//# sourceMappingURL=update-company.command.js.map