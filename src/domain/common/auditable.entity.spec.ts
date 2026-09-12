import { AuditableEntity } from './auditable.entity';

class TestAuditable extends AuditableEntity {
  public id: string;
  constructor(id: string, props?: any) {
    super(props);
    this.id = id;
  }
}

describe('AuditableEntity Base Class', () => {
  it('should initialize with default active and not deleted state', () => {
    const entity = new TestAuditable('t-01', {
      createdBy: 'USER-01|ADMIN',
    });

    expect(entity.isActive).toBe(true);
    expect(entity.isDeleted).toBe(false);
    expect(entity.createdBy).toBe('USER-01|ADMIN');
    expect(entity.editByName).toBe('USER-01|ADMIN');
    expect(entity.createdDate).toBeInstanceOf(Date);
    expect(entity.modifiedDate).toBeUndefined();
    expect(entity.deletedDate).toBeUndefined();
    expect(entity.deletedBy).toBeUndefined();
  });

  it('should mark modified correctly with timestamp and stamp', () => {
    const entity = new TestAuditable('t-02', { createdBy: 'USER-01|ADMIN' });
    entity.markModified('USER-02|SUPER_ADMIN');

    expect(entity.editByName).toBe('USER-02|SUPER_ADMIN');
    expect(entity.modifiedDate).toBeInstanceOf(Date);
    expect(entity.isDeleted).toBe(false);
  });

  it('should soft delete correctly', () => {
    const entity = new TestAuditable('t-03');
    entity.softDelete('USER-03|SUPER_ADMIN');

    expect(entity.isDeleted).toBe(true);
    expect(entity.isActive).toBe(false);
    expect(entity.deletedBy).toBe('USER-03|SUPER_ADMIN');
    expect(entity.deletedDate).toBeInstanceOf(Date);
    expect(entity.modifiedDate).toBeInstanceOf(Date);
  });

  it('should restore from soft delete', () => {
    const entity = new TestAuditable('t-04');
    entity.softDelete('USER-04|SUPER_ADMIN');
    expect(entity.isDeleted).toBe(true);

    entity.restore('USER-05|SUPER_ADMIN');
    expect(entity.isDeleted).toBe(false);
    expect(entity.isActive).toBe(true);
    expect(entity.deletedBy).toBeUndefined();
    expect(entity.deletedDate).toBeUndefined();
    expect(entity.editByName).toBe('USER-05|SUPER_ADMIN');
  });

  it('should activate and deactivate with optional audit stamp', () => {
    const entity = new TestAuditable('t-05');
    entity.deactivate('USER-06|ADMIN');
    expect(entity.isActive).toBe(false);
    expect(entity.editByName).toBe('USER-06|ADMIN');

    entity.activate('USER-07|ADMIN');
    expect(entity.isActive).toBe(true);
    expect(entity.editByName).toBe('USER-07|ADMIN');
  });
});
