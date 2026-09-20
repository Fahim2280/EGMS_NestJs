import { BillingCalculationService, RATE_PER_UNIT } from './billing-calculation.service';
import { Customer } from '@domain/entities/customer.entity';
import { ElectricBill } from '@domain/entities/electric-bill.entity';

describe('BillingCalculationService', () => {
  let service: BillingCalculationService;
  let mockCustomerRepo: any;
  let mockBillRepo: any;

  const mockCustomer = Customer.create({
    id: 'cust-1',
    companyId: 'comp-1',
    name: 'Rahim',
    fatherName: '',
    motherName: '',
    address: 'Dhaka',
    mobileNumber: '01711000000',
    nidNumber: '1234567890',
    previousUnit: 100, // initial reading
    advanceMoney: 1000, // initial advance dues
  });

  beforeEach(() => {
    mockCustomerRepo = {
      getByIdAsync: jest.fn().mockResolvedValue(mockCustomer),
    };

    mockBillRepo = {
      findLatestByCustomerId: jest.fn(),
      findPreviousBill: jest.fn(),
      findSubsequentBills: jest.fn().mockResolvedValue([]),
    };

    service = new BillingCalculationService(mockCustomerRepo, mockBillRepo);
  });

  it('should verify RATE_PER_UNIT is 15', () => {
    expect(RATE_PER_UNIT).toBe(15);
  });

  it('should calculate initial bill values from Customer table when no previous bills exist', async () => {
    mockBillRepo.findPreviousBill.mockResolvedValue(null);

    // Current unit = 160. Baseline previous unit = 100.
    // Consumed = 60 units. Electric charge = 60 * 15 = 900.
    // Previous dues = advance money (1000).
    // Rent = 2000, Loan = 500, Total = 1000 + 900 + 2000 + 500 = 4400.
    // Paid = 3000. Present Dues = 4400 - 3000 = 1400.
    const result = await service.calculateBillValues(
      'cust-1',
      'comp-1',
      160,
      2000,
      500,
      3000,
      new Date('2026-09-01'),
    );

    expect(result.previousUnit).toBe(100);
    expect(result.previousDues).toBe(1000);
    expect(result.totalUnit).toBe(60);
    expect(result.electricBill).toBe(900);
    expect(result.totalBill).toBe(4400);
    expect(result.presentDues).toBe(1400);
  });

  it('should calculate subsequent bill values from last bill currentUnit and presentDues', async () => {
    const lastBill = ElectricBill.create({
      id: 'bill-1',
      customerId: 'cust-1',
      companyId: 'comp-1',
      date: new Date('2026-08-01'),
      previousUnit: 100,
      currentUnit: 160,
      totalUnit: 60,
      electricBill: 900,
      previousDues: 1000,
      rentBill: 2000,
      loan: 500,
      totalBill: 4400,
      clearMoney: 3000,
      presentDues: 1400, // becomes previous dues for next bill!
    });

    mockBillRepo.findPreviousBill.mockResolvedValue(lastBill);

    // For second bill:
    // Current unit = 220. Previous unit from lastBill = 160.
    // Consumed = 220 - 160 = 60 units.
    // Electric = 60 * 15 = 900.
    // Previous dues from lastBill = 1400.
    // Rent = 2000, Loan = 0, Total = 1400 + 900 + 2000 + 0 = 4300.
    // Paid = 4000. Present Dues = 4300 - 4000 = 300.
    const result = await service.calculateBillValues(
      'cust-1',
      'comp-1',
      220,
      2000,
      0,
      4000,
      new Date('2026-09-01'),
    );

    expect(result.previousUnit).toBe(160);
    expect(result.previousDues).toBe(1400);
    expect(result.totalUnit).toBe(60);
    expect(result.electricBill).toBe(900);
    expect(result.totalBill).toBe(4300);
    expect(result.presentDues).toBe(300);
  });

  it('should throw error when current unit is less than previous unit', async () => {
    mockBillRepo.findPreviousBill.mockResolvedValue(null);

    // Customer baseline is 100, input is 80
    await expect(
      service.calculateBillValues(
        'cust-1',
        'comp-1',
        80,
        1000,
        0,
        0,
        new Date('2026-09-01'),
      ),
    ).rejects.toThrow('cannot be less than previous unit');
  });

  it('should calculate electric bill using custom admin configured unit rate', async () => {
    mockBillRepo.findPreviousBill.mockResolvedValue(null);

    // Baseline = 100, Current = 150 -> 50 units
    // Custom unitRate = 20 -> Electric = 50 * 20 = 1000
    // Previous dues = 1000, Rent = 1500, Loan = 0, Paid = 2500
    // Total = 1000 + 1000 + 1500 = 3500, Present dues = 3500 - 2500 = 1000
    const result = await service.calculateBillValues(
      'cust-1',
      'comp-1',
      150,
      1500,
      0,
      2500,
      new Date('2026-09-01'),
      undefined,
      20,
    );

    expect(result.totalUnit).toBe(50);
    expect(result.unitRate).toBe(20);
    expect(result.electricBill).toBe(1000);
    expect(result.totalBill).toBe(3500);
    expect(result.presentDues).toBe(1000);
  });

  it('should preview bill using custom admin configured unit rate', async () => {
    mockBillRepo.findLatestByCustomerId.mockResolvedValue(null);

    // Baseline = 100, Current = 140 -> 40 units
    // Custom rate = 25 -> Electric = 40 * 25 = 1000
    // Prev dues = 1000, Rent = 500, Loan = 200 -> Total = 1000 + 1000 + 500 + 200 = 2700
    const preview = await service.previewBill(
      'cust-1',
      'comp-1',
      140,
      500,
      200,
      25,
    );

    expect(preview.consumedUnits).toBe(40);
    expect(preview.unitRate).toBe(25);
    expect(preview.electricBill).toBe(1000);
    expect(preview.totalBill).toBe(2700);
  });
});
