import { AuditLog } from './audit-log.entity';

describe('AuditLog Domain Entity', () => {
  it('should create a valid audit log entry', () => {
    const log = AuditLog.create({
      id: 'audit-001',
      companyId: 'comp-001',
      userId: 'user-001',
      userName: 'Super Admin',
      userRole: 'SUPER_ADMIN',
      action: 'create',
      entityType: 'customer',
      entityId: 'cust-123',
      entityName: 'Rahim Uddin (CUST-001)',
      details: 'Registered new customer',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
    });

    expect(log.id).toBe('audit-001');
    expect(log.companyId).toBe('comp-001');
    expect(log.userId).toBe('user-001');
    expect(log.userName).toBe('Super Admin');
    expect(log.userRole).toBe('SUPER_ADMIN');
    expect(log.action).toBe('CREATE');
    expect(log.entityType).toBe('CUSTOMER');
    expect(log.entityId).toBe('cust-123');
    expect(log.entityName).toBe('Rahim Uddin (CUST-001)');
    expect(log.details).toBe('Registered new customer');
    expect(log.ipAddress).toBe('192.168.1.100');
    expect(log.userAgent).toBe('Mozilla/5.0 Chrome/120.0');
    expect(log.createdDate).toBeInstanceOf(Date);
  });

  it('should throw validation error when required fields are missing', () => {
    expect(() =>
      AuditLog.create({
        id: '',
        companyId: 'comp-001',
        userId: 'user-001',
        userName: 'Admin',
        userRole: 'SUPER_ADMIN',
        action: 'CREATE',
        entityType: 'CUSTOMER',
      }),
    ).toThrow('AuditLog ID is required.');

    expect(() =>
      AuditLog.create({
        id: 'audit-002',
        companyId: '',
        userId: 'user-001',
        userName: 'Admin',
        userRole: 'SUPER_ADMIN',
        action: 'CREATE',
        entityType: 'CUSTOMER',
      }),
    ).toThrow('Company ID is required.');

    expect(() =>
      AuditLog.create({
        id: 'audit-003',
        companyId: 'comp-001',
        userId: '',
        userName: 'Admin',
        userRole: 'SUPER_ADMIN',
        action: 'CREATE',
        entityType: 'CUSTOMER',
      }),
    ).toThrow('User ID is required.');

    expect(() =>
      AuditLog.create({
        id: 'audit-004',
        companyId: 'comp-001',
        userId: 'user-001',
        userName: 'Admin',
        userRole: 'SUPER_ADMIN',
        action: '',
        entityType: 'CUSTOMER',
      }),
    ).toThrow('Action is required.');

    expect(() =>
      AuditLog.create({
        id: 'audit-005',
        companyId: 'comp-001',
        userId: 'user-001',
        userName: 'Admin',
        userRole: 'SUPER_ADMIN',
        action: 'CREATE',
        entityType: '',
      }),
    ).toThrow('Entity type is required.');
  });
});
