"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateMonthlyBillsCommand = void 0;
class GenerateMonthlyBillsCommand {
    companyId;
    targetDate;
    actorStamp;
    fromDate;
    constructor(companyId, targetDate, actorStamp, fromDate) {
        this.companyId = companyId;
        this.targetDate = targetDate;
        this.actorStamp = actorStamp;
        this.fromDate = fromDate;
    }
}
exports.GenerateMonthlyBillsCommand = GenerateMonthlyBillsCommand;
//# sourceMappingURL=generate-monthly-bills.command.js.map