"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetElectricBillsByCompanyQuery = void 0;
class GetElectricBillsByCompanyQuery {
    companyId;
    allowedGarageIds;
    fromDate;
    toDate;
    garageId;
    search;
    constructor(companyId, allowedGarageIds, fromDate, toDate, garageId, search) {
        this.companyId = companyId;
        this.allowedGarageIds = allowedGarageIds;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.garageId = garageId;
        this.search = search;
    }
}
exports.GetElectricBillsByCompanyQuery = GetElectricBillsByCompanyQuery;
//# sourceMappingURL=get-electric-bills-by-company.query.js.map