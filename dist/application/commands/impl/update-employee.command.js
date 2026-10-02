"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeCommand = void 0;
class UpdateEmployeeCommand {
    id;
    companyId;
    name;
    address;
    phoneNumber;
    nidNumber;
    updatedByStamp;
    phoneNumbers;
    documents;
    constructor(id, companyId, name, address, phoneNumber, nidNumber, updatedByStamp, phoneNumbers, documents) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.nidNumber = nidNumber;
        this.updatedByStamp = updatedByStamp;
        this.phoneNumbers = phoneNumbers;
        this.documents = documents;
    }
}
exports.UpdateEmployeeCommand = UpdateEmployeeCommand;
//# sourceMappingURL=update-employee.command.js.map