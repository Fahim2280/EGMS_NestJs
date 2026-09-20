import { Employee } from './employee.entity';

describe('Employee Entity', () => {
  it('should create a valid employee with GENERAL role and NID', () => {
    const emp = Employee.create({
      id: 'emp-201',
      companyId: 'comp-101',
      name: 'Lucius Fox',
      address: '42 Tech Way, Gotham City',
      email: 'lucius@wayne.com',
      password: 'hashed_password_123',
      phoneNumber: '+1-555-8888',
      nidNumber: 'NID-9988776655',
    });

    expect(emp.id).toBe('emp-201');
    expect(emp.companyId).toBe('comp-101');
    expect(emp.name).toBe('Lucius Fox');
    expect(emp.role).toBe('GENERAL');
    expect(emp.nidNumber).toBe('NID-9988776655');
  });

  it('should throw error when NID number is too short', () => {
    expect(() =>
      Employee.create({
        id: 'emp-202',
        companyId: 'comp-101',
        name: 'Lucius Fox',
        address: 'Gotham',
        email: 'lucius@wayne.com',
        password: 'password',
        phoneNumber: '+1-555-8888',
        nidNumber: '12',
      }),
    ).toThrow('NID number must be at least 5 characters.');
  });

  it('should allow admin to update role and toggle active status', () => {
    const emp = Employee.create({
      id: 'emp-203',
      companyId: 'comp-101',
      name: 'Lucius Fox',
      address: 'Gotham',
      email: 'lucius@wayne.com',
      password: 'password',
      phoneNumber: '+1-555-8888',
      nidNumber: 'NID-9988776655',
    });

    expect(emp.role).toBe('GENERAL');
    expect(emp.isActive).toBe(true);

    emp.updateRole('SUPER_ADMIN', 'comp-101|SUPER_ADMIN');
    expect(emp.role).toBe('SUPER_ADMIN');
    expect(emp.editByName).toBe('comp-101|SUPER_ADMIN');

    emp.deactivate('comp-101|SUPER_ADMIN');
    expect(emp.isActive).toBe(false);

    emp.activate('comp-101|SUPER_ADMIN');
    expect(emp.isActive).toBe(true);
  });

  it('should throw error on invalid role update', () => {
    const emp = Employee.create({
      id: 'emp-204',
      companyId: 'comp-101',
      name: 'Lucius Fox',
      address: 'Gotham',
      email: 'lucius@wayne.com',
      password: 'password',
      phoneNumber: '+1-555-8888',
      nidNumber: 'NID-9988776655',
    });

    expect(() => emp.updateRole('INVALID_ROLE')).toThrow(/Invalid role/);
  });
});
