import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetElectricBillsByCompanyQuery } from '../impl/get-electric-bills-by-company.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { ElectricBillResponseDto } from '../../dtos/electric-bill.dto';

@QueryHandler(GetElectricBillsByCompanyQuery)
export class GetElectricBillsByCompanyHandler
  implements IQueryHandler<GetElectricBillsByCompanyQuery>
{
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(
    query: GetElectricBillsByCompanyQuery,
  ): Promise<ElectricBillResponseDto[]> {
    let [bills, customers] = await Promise.all([
      this.billRepo.findByCompanyId(query.companyId),
      this.customerRepo.findByCompanyId(query.companyId),
    ]);

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // Enforce role-based allowed garages
    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      const allowedCustomerIds = new Set(
        customers.filter((c) => c.garageId && allowedSet.has(c.garageId)).map((c) => c.id),
      );
      bills = bills.filter((b) => allowedCustomerIds.has(b.customerId));
    }

    // Filter by specific user-selected garage
    if (query.garageId && query.garageId.trim()) {
      const targetGarageId = query.garageId.trim();
      const targetCustomerIds = new Set(
        customers.filter((c) => c.garageId === targetGarageId).map((c) => c.id),
      );
      bills = bills.filter((b) => targetCustomerIds.has(b.customerId));
    }

    // Filter by fromDate (start of day)
    if (query.fromDate) {
      const fromTime = new Date(query.fromDate).setHours(0, 0, 0, 0);
      bills = bills.filter((b) => new Date(b.date).getTime() >= fromTime);
    }

    // Filter by toDate (end of day)
    if (query.toDate) {
      const toTime = new Date(query.toDate).setHours(23, 59, 59, 999);
      bills = bills.filter((b) => new Date(b.date).getTime() <= toTime);
    }

    // Filter by search query (customer name, customer code, cId, NID, phone, bill number)
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      bills = bills.filter((b) => {
        const cust = customerMap.get(b.customerId);
        const nameMatch = cust?.name?.toLowerCase().includes(q);
        const codeMatch = cust?.customerCode?.toLowerCase().includes(q);
        const phoneMatch = cust?.mobileNumber?.includes(q);
        const billNumMatch = String(b.billNumber || '').includes(q);
        const cIdMatch = cust?.cId !== undefined && String(cust.cId).includes(q);
        const nidMatch = cust?.nidNumber?.toLowerCase().includes(q);
        const uuidMatch = b.customerId?.toLowerCase().includes(q);
        return nameMatch || codeMatch || phoneMatch || billNumMatch || cIdMatch || nidMatch || uuidMatch;
      });
    }

    // Sort descending by date (newest first), then by createdDate
    bills.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      const createdA = (a as any).createdDate ? new Date((a as any).createdDate).getTime() : 0;
      const createdB = (b as any).createdDate ? new Date((b as any).createdDate).getTime() : 0;
      return createdB - createdA;
    });

    const seenCustomerIds = new Set<string>();

    return bills.map((b) => {
      const cust = customerMap.get(b.customerId);
      const isLatest = !seenCustomerIds.has(b.customerId);
      seenCustomerIds.add(b.customerId);

      return {
        id: b.id,
        billNumber: b.billNumber,
        customerId: b.customerId,
        customerName: cust?.name || 'Unknown Customer',
        customerCode: cust?.customerCode || null,
        customerCId: cust?.cId,
        garageId: cust?.garageId,
        garageName: cust?.garageName || null,
        companyId: b.companyId,
        date: b.date,
        previousUnit: b.previousUnit,
        currentUnit: b.currentUnit,
        totalUnit: b.totalUnit,
        electricBill: b.electricBill,
        previousDues: b.previousDues,
        rentBill: b.rentBill,
        loan: b.loan,
        totalBill: b.totalBill,
        clearMoney: b.clearMoney,
        presentDues: b.presentDues,
        isLatestBill: isLatest,
      };
    });
  }
}
