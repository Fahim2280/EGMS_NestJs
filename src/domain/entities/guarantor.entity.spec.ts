import { Guarantor } from './guarantor.entity';

describe('Guarantor Entity', () => {
  it('should create a valid guarantor with all details', () => {
    const guarantor = Guarantor.create({
      id: 'guar-001',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'Md. Rafiqul Islam',
      fatherName: 'Abdul Karim',
      motherName: 'Fatema Begum',
      address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
      mobileNumber: '01711223344',
      nidNumber: '19851122334455667',
      relationship: 'Brother',
      createdBy: 'comp-001|SUPER_ADMIN',
    });

    expect(guarantor.id).toBe('guar-001');
    expect(guarantor.customerId).toBe('cust-001');
    expect(guarantor.companyId).toBe('comp-001');
    expect(guarantor.name).toBe('Md. Rafiqul Islam');
    expect(guarantor.fatherName).toBe('Abdul Karim');
    expect(guarantor.motherName).toBe('Fatema Begum');
    expect(guarantor.address).toBe('House 12, Road 4, Sector 7, Uttara, Dhaka');
    expect(guarantor.mobileNumber).toBe('01711223344');
    expect(guarantor.nidNumber).toBe('19851122334455667');
    expect(guarantor.relationship).toBe('Brother');
    expect(guarantor.isActive).toBe(true);
    expect(guarantor.isDeleted).toBe(false);
  });

  it('should handle optional fatherName, motherName, and relationship gracefully', () => {
    const guarantor = Guarantor.create({
      id: 'guar-002',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'Nasreen Akter',
      address: 'Apt 4B, Green View Tower, Tongi',
      mobileNumber: '01822334455',
      nidNumber: '19902233445566778',
    });

    expect(guarantor.fatherName).toBe('');
    expect(guarantor.motherName).toBe('');
    expect(guarantor.relationship).toBe('');
  });

  it('should throw validation error when required fields are missing or invalid', () => {
    expect(() =>
      Guarantor.create({
        id: '',
        customerId: 'cust-001',
        companyId: 'comp-001',
        name: 'Nasreen',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '123456',
      }),
    ).toThrow('Guarantor ID is required.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: '',
        companyId: 'comp-001',
        name: 'Nasreen',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '123456',
      }),
    ).toThrow('Customer ID is required.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: 'cust-001',
        companyId: '',
        name: 'Nasreen',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '123456',
      }),
    ).toThrow('Company ID is required.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: 'cust-001',
        companyId: 'comp-001',
        name: 'A',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '123456',
      }),
    ).toThrow('Guarantor name must be at least 2 characters.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: 'cust-001',
        companyId: 'comp-001',
        name: 'Valid Name',
        address: 'Dhaka',
        mobileNumber: '123',
        nidNumber: '123456',
      }),
    ).toThrow('Valid mobile number is required.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: 'cust-001',
        companyId: 'comp-001',
        name: 'Valid Name',
        address: 'Dhaka',
        mobileNumber: '01711223344',
        nidNumber: '12',
      }),
    ).toThrow('Valid NID number is required.');

    expect(() =>
      Guarantor.create({
        id: 'guar-003',
        customerId: 'cust-001',
        companyId: 'comp-001',
        name: 'Valid Name',
        address: ' ',
        mobileNumber: '01711223344',
        nidNumber: '123456789',
      }),
    ).toThrow('Address is required.');
  });

  it('should update details and modify audit stamp', () => {
    const guarantor = Guarantor.create({
      id: 'guar-004',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'Initial Name',
      address: 'Old Address',
      mobileNumber: '01700000000',
      nidNumber: '111222333444',
      relationship: 'Friend',
    });

    guarantor.updateDetails(
      'Updated Name',
      'Updated Father',
      'Updated Mother',
      'New Address, Gazipur',
      '01899999999',
      '999888777666',
      'Uncle',
      'comp-001|SUPER_ADMIN',
    );

    expect(guarantor.name).toBe('Updated Name');
    expect(guarantor.fatherName).toBe('Updated Father');
    expect(guarantor.motherName).toBe('Updated Mother');
    expect(guarantor.address).toBe('New Address, Gazipur');
    expect(guarantor.mobileNumber).toBe('01899999999');
    expect(guarantor.nidNumber).toBe('999888777666');
    expect(guarantor.relationship).toBe('Uncle');
    expect(guarantor.editByName).toBe('comp-001|SUPER_ADMIN');
  });

  it('should validate inputs in updateDetails', () => {
    const guarantor = Guarantor.create({
      id: 'guar-005',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'Initial Name',
      address: 'Address',
      mobileNumber: '01700000000',
      nidNumber: '111222333444',
    });

    expect(() =>
      guarantor.updateDetails('', '', '', 'Address', '01700000000', '111222333444'),
    ).toThrow('Guarantor name must be at least 2 characters.');

    expect(() =>
      guarantor.updateDetails('Name', '', '', 'Address', '12', '111222333444'),
    ).toThrow('Valid mobile number is required for guarantor.');

    expect(() =>
      guarantor.updateDetails('Name', '', '', 'Address', '01700000000', '12'),
    ).toThrow('Valid NID number is required for guarantor.');

    expect(() =>
      guarantor.updateDetails('Name', '', '', ' ', '01700000000', '111222333444'),
    ).toThrow('Address is required for guarantor.');
  });

  it('should support soft delete', () => {
    const guarantor = Guarantor.create({
      id: 'guar-006',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'To Delete',
      address: 'Address',
      mobileNumber: '01700000000',
      nidNumber: '111222333444',
    });

    guarantor.softDelete('comp-001|SUPER_ADMIN');
    expect(guarantor.isDeleted).toBe(true);
    expect(guarantor.isActive).toBe(false);
    expect(guarantor.deletedBy).toBe('comp-001|SUPER_ADMIN');
  });

  it('should support multiple phone numbers and synchronize primary phone to mobileNumber', () => {
    const guarantor = Guarantor.create({
      id: 'guar-multi-01',
      customerId: 'cust-001',
      companyId: 'comp-001',
      name: 'Multi Phone Guarantor',
      address: 'Dhaka',
      phoneNumbers: [
        { number: '01711223344', type: 'PERSONAL', isPrimary: false },
        { number: '01899887766', type: 'WHATSAPP', isPrimary: true },
      ],
      nidNumber: '111222333444',
    });

    expect(guarantor.phoneNumbers.length).toBe(2);
    expect(guarantor.mobileNumber).toBe('01899887766');

    guarantor.updateDetails(
      'Updated Guarantor',
      '',
      '',
      'Dhaka',
      '',
      '111222333444',
      'Brother',
      undefined,
      [
        { number: '01900000000', type: 'WORK', isPrimary: true },
        { number: '01500000000', type: 'EMERGENCY', isPrimary: false },
      ],
    );

    expect(guarantor.phoneNumbers.length).toBe(2);
    expect(guarantor.mobileNumber).toBe('01900000000');
  });
});
