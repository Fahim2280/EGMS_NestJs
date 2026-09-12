import { Company } from './company.entity';

describe('Company Entity', () => {
  it('should create a valid company with SUPER_ADMIN role', () => {
    const company = Company.create({
      id: 'comp-101',
      name: 'Bruce Wayne',
      companyName: 'Wayne Enterprises',
      email: 'bruce@wayne.com',
      password: 'hashed_password_xyz',
      phoneNumber: '+1-555-9999',
      address: '1007 Mountain Drive, Gotham City',
    });

    expect(company.id).toBe('comp-101');
    expect(company.companyName).toBe('Wayne Enterprises');
    expect(company.role).toBe('SUPER_ADMIN');
    expect(company.email).toBe('bruce@wayne.com');
  });

  it('should throw error when company name is too short', () => {
    expect(() =>
      Company.create({
        id: 'comp-102',
        name: 'Bruce Wayne',
        companyName: 'W',
        email: 'bruce@wayne.com',
        password: 'password',
        phoneNumber: '+1-555-9999',
        address: 'Gotham',
      }),
    ).toThrow('Company name must be at least 2 characters.');
  });

  it('should throw error on invalid email', () => {
    expect(() =>
      Company.create({
        id: 'comp-103',
        name: 'Bruce Wayne',
        companyName: 'Wayne Enterprises',
        email: 'invalid-email',
        password: 'password',
        phoneNumber: '+1-555-9999',
        address: 'Gotham',
      }),
    ).toThrow('A valid company email is required.');
  });
});
