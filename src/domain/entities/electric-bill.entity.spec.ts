import { ElectricBill } from './electric-bill.entity';

describe('ElectricBill Entity', () => {
  it('should create an electric bill with correct calculation attributes', () => {
    // Current 250 - Prev 150 = 100 units
    // Electric Bill = 100 * 15 = 1500
    // Total Bill = PrevDues (500) + Electric (1500) + Rent (2000) + Loan (0) = 4000
    // Present Dues = 4000 - Clear (3000) = 1000
    const bill = ElectricBill.create({
      id: 'bill-001',
      billNumber: 1,
      customerId: 'cust-001',
      companyId: 'comp-001',
      date: new Date('2026-09-01'),
      previousUnit: 150,
      currentUnit: 250,
      totalUnit: 100,
      electricBill: 1500,
      previousDues: 500,
      rentBill: 2000,
      loan: 0,
      totalBill: 4000,
      clearMoney: 3000,
      presentDues: 1000,
      createdBy: 'comp-001|SUPER_ADMIN',
    });

    expect(bill.id).toBe('bill-001');
    expect(bill.totalUnit).toBe(100);
    expect(bill.electricBill).toBe(1500);
    expect(bill.totalBill).toBe(4000);
    expect(bill.presentDues).toBe(1000);
    expect(bill.isActive).toBe(true);
    expect(bill.isDeleted).toBe(false);
  });

  it('should recalculate correctly when previous unit and dues change', () => {
    const bill = ElectricBill.create({
      id: 'bill-002',
      customerId: 'cust-001',
      companyId: 'comp-001',
      date: new Date('2026-09-01'),
      previousUnit: 100,
      currentUnit: 200,
      totalUnit: 100,
      electricBill: 1500,
      previousDues: 0,
      rentBill: 1000,
      loan: 0,
      totalBill: 2500,
      clearMoney: 2000,
      presentDues: 500,
    });

    // Recalculate with updated previousUnit = 120 and previousDues = 200
    // New totalUnit = 200 - 120 = 80
    // New electricBill = 80 * 15 = 1200
    // New totalBill = 200 + 1200 + 1000 + 0 = 2400
    // New presentDues = 2400 - 2000 = 400
    bill.recalculate(120, 200, 15, 'comp-001|SUPER_ADMIN');

    expect(bill.previousUnit).toBe(120);
    expect(bill.totalUnit).toBe(80);
    expect(bill.electricBill).toBe(1200);
    expect(bill.totalBill).toBe(2400);
    expect(bill.presentDues).toBe(400);
    expect(bill.editByName).toBe('comp-001|SUPER_ADMIN');
  });

  it('should recalculate with custom unitRate', () => {
    const bill = ElectricBill.create({
      id: 'bill-003',
      customerId: 'cust-001',
      companyId: 'comp-001',
      date: new Date('2026-09-01'),
      previousUnit: 100,
      currentUnit: 200,
      totalUnit: 100,
      electricBill: 1500,
      unitRate: 15,
      previousDues: 0,
      rentBill: 0,
      loan: 0,
      totalBill: 1500,
      clearMoney: 0,
      presentDues: 1500,
    });

    // Recalculate with rate = 22.50
    // totalUnit = 100
    // electricBill = 100 * 22.5 = 2250
    bill.recalculate(100, 0, 22.5, 'admin');

    expect(bill.unitRate).toBe(22.5);
    expect(bill.electricBill).toBe(2250);
    expect(bill.totalBill).toBe(2250);
    expect(bill.presentDues).toBe(2250);
  });
});
