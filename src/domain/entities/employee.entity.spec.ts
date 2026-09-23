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

  it('should manage granular action permissions and garage access', () => {
    const emp = Employee.create({
      id: 'emp-205',
      companyId: 'comp-101',
      name: 'Bruce Wayne',
      address: 'Gotham',
      email: 'bruce@wayne.com',
      password: 'password',
      phoneNumber: '+1-555-9999',
      nidNumber: 'NID-9988776655',
    });

    // Default permissions
    expect(emp.canCreate).toBe(false);
    expect(emp.canEdit).toBe(false);
    expect(emp.canDelete).toBe(false);
    expect(emp.canView).toBe(true);
    expect(emp.permittedGarageIds).toEqual([]);
    expect(emp.hasGarageAccess('gar-1')).toBe(false);

    // Update permissions
    emp.updatePermissions(true, false, false, true, ['gar-1', 'gar-2'], 'admin');

    expect(emp.canPerform('create')).toBe(true);
    expect(emp.canPerform('edit')).toBe(false);
    expect(emp.canPerform('delete')).toBe(false);
    expect(emp.canPerform('view')).toBe(true);

    expect(emp.hasGarageAccess('gar-1')).toBe(true);
    expect(emp.hasGarageAccess('gar-2')).toBe(true);
    expect(emp.hasGarageAccess('gar-3')).toBe(false);
    expect(emp.hasGarageAccess(null)).toBe(false);
  });

  it('should support multiple phone numbers and synchronize primary phone to phoneNumber', () => {
    const emp = Employee.create({
      id: 'emp-multi-01',
      companyId: 'comp-101',
      name: 'Multi Phone Employee',
      address: 'Gotham',
      email: 'multi@wayne.com',
      password: 'password',
      phoneNumbers: [
        { number: '01711223344', type: 'PERSONAL', isPrimary: false },
        { number: '01899887766', type: 'WORK', isPrimary: true },
      ],
      nidNumber: 'NID-9988776655',
    });

    expect(emp.phoneNumbers.length).toBe(2);
    expect(emp.phoneNumber).toBe('01899887766');

    emp.updateDetails(
      'Updated Employee',
      'New Address, Gotham',
      '',
      'NID-9988776655',
      undefined,
      [
        { number: '01900000000', type: 'PRIMARY', isPrimary: true },
        { number: '01600000000', type: 'PERSONAL', isPrimary: false },
      ],
    );

    expect(emp.phoneNumbers.length).toBe(2);
    expect(emp.phoneNumber).toBe('01900000000');
  });
});
