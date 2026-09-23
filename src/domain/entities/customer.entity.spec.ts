import { Customer } from './customer.entity';

describe('Customer Entity', () => {
  it('should create a valid customer with baseline meter and advance money', () => {
    const customer = Customer.create({
      id: 'cust-001',
      cId: 1,
      companyId: 'comp-001',
      name: 'Rahim Uddin',
      fatherName: 'Karim Uddin',
      motherName: 'Fatema Begum',
      address: 'Shop 12, Station Road, Gazipur',
      mobileNumber: '01711223344',
      nidNumber: '19901234567890123',
      previousUnit: 150.5,
      advanceMoney: 5000,
      createdBy: 'comp-001|SUPER_ADMIN',
    });

    expect(customer.id).toBe('cust-001');
    expect(customer.cId).toBe(1);
    expect(customer.name).toBe('Rahim Uddin');
    expect(customer.previousUnit).toBe(150.5);
    expect(customer.advanceMoney).toBe(5000);
    expect(customer.isActive).toBe(true);
    expect(customer.isDeleted).toBe(false);
  });

  it('should throw validation error when required fields are missing', () => {
    expect(() =>
      Customer.create({
        id: '',
        companyId: 'comp-001',
        name: 'Rahim',
        fatherName: '',
        motherName: '',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '123456',
        previousUnit: 0,
        advanceMoney: 0,
      }),
    ).toThrow('Customer ID is required.');
  });

  it('should update details and update audit stamp', () => {
    const customer = Customer.create({
      id: 'cust-002',
      companyId: 'comp-001',
      name: 'Rahim',
      fatherName: 'Karim',
      motherName: 'Fatema',
      address: 'Dhaka',
      mobileNumber: '01711223344',
      nidNumber: '123456789',
      previousUnit: 100,
      advanceMoney: 2000,
    });

    customer.updateDetails(
      'Rahim Uddin Ahmed',
      'Karim Uddin',
      'Fatema Begum',
      'Mirpur 10, Dhaka',
      '01799887766',
      '123456789',
      120,
      2500,
      'gar-001',
      'CUST-002',
      'comp-001|SUPER_ADMIN',
    );

    expect(customer.name).toBe('Rahim Uddin Ahmed');
    expect(customer.mobileNumber).toBe('01799887766');
    expect(customer.advanceMoney).toBe(2500);
    expect(customer.previousUnit).toBe(120);
    expect(customer.garageId).toBe('gar-001');
    expect(customer.customerCode).toBe('CUST-002');
    expect(customer.editByName).toBe('comp-001|SUPER_ADMIN');
  });

  it('should create customer with customerCode and trim whitespace', () => {
    const customer = Customer.create({
      id: 'cust-code-01',
      companyId: 'comp-001',
      customerCode: '  CUST-999  ',
      name: 'Test Customer',
      fatherName: '',
      motherName: '',
      address: 'Dhaka',
      mobileNumber: '01711223344',
      nidNumber: '123456789',
      previousUnit: 10,
      advanceMoney: 1000,
    });

    expect(customer.customerCode).toBe('CUST-999');
  });

  it('should create customer with assigned garageId', () => {
    const customer = Customer.create({
      id: 'cust-004',
      companyId: 'comp-001',
      name: 'Salim',
      fatherName: '',
      motherName: '',
      address: 'Dhaka',
      mobileNumber: '01711223344',
      nidNumber: '123456789',
      previousUnit: 50,
      advanceMoney: 1000,
      garageId: 'gar-apex-001',
    });

    expect(customer.garageId).toBe('gar-apex-001');
  });

  it('should support soft delete', () => {
    const customer = Customer.create({
      id: 'cust-003',
      companyId: 'comp-001',
      name: 'Rahim',
      fatherName: '',
      motherName: '',
      address: 'Dhaka',
      mobileNumber: '01711223344',
      nidNumber: '123456789',
      previousUnit: 0,
      advanceMoney: 0,
    });

    customer.softDelete('comp-001|SUPER_ADMIN');
    expect(customer.isDeleted).toBe(true);
    expect(customer.isActive).toBe(false);
    expect(customer.deletedBy).toBe('comp-001|SUPER_ADMIN');
  });

  it('should support multiple phone numbers and synchronize primary phone to mobileNumber', () => {
    const customer = Customer.create({
      id: 'cust-multi-phone',
      companyId: 'comp-001',
      name: 'Rahim',
      fatherName: '',
      motherName: '',
      address: 'Dhaka',
      phoneNumbers: [
        { number: '01711223344', type: 'PERSONAL', isPrimary: false },
        { number: '01899887766', type: 'WHATSAPP', isPrimary: true },
        { number: '01911223344', type: 'EMERGENCY', isPrimary: false },
      ],
      nidNumber: '123456789',
      previousUnit: 0,
      advanceMoney: 0,
    });

    expect(customer.phoneNumbers.length).toBe(3);
    expect(customer.mobileNumber).toBe('01899887766');

    customer.updateDetails(
      'Rahim Updated',
      '',
      '',
      'Dhaka',
      '',
      '123456789',
      0,
      0,
      undefined,
      null,
      undefined,
      [
        { number: '01700000000', type: 'PRIMARY', isPrimary: true },
        { number: '01800000000', type: 'WORK', isPrimary: false },
      ],
    );

    expect(customer.phoneNumbers.length).toBe(2);
    expect(customer.mobileNumber).toBe('01700000000');
  });
});
