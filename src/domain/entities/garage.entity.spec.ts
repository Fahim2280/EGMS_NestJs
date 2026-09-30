import { Garage } from './garage.entity';

describe('Garage Entity', () => {
  it('should create a valid garage linked to a company', () => {
    const garage = Garage.create({
      id: 'gar-101',
      companyId: 'comp-101',
      garageName: 'Apex Central Workshop',
      address: 'Industrial Area, Bay 4',
      createdBy: 'comp-101|SUPER_ADMIN',
    });

    expect(garage.id).toBe('gar-101');
    expect(garage.companyId).toBe('comp-101');
    expect(garage.garageName).toBe('Apex Central Workshop');
    expect(garage.address).toBe('Industrial Area, Bay 4');
    expect(garage.isActive).toBe(true);
    expect(garage.isDeleted).toBe(false);
    expect(garage.createdBy).toBe('comp-101|SUPER_ADMIN');
  });

  it('should throw error when garage name is missing or too short', () => {
    expect(() =>
      Garage.create({
        id: 'gar-102',
        companyId: 'comp-101',
        garageName: 'A',
        address: 'Industrial Area, Bay 4',
      }),
    ).toThrow('Garage name must be at least 2 characters.');
  });

  it('should throw error when company ID is missing', () => {
    expect(() =>
      Garage.create({
        id: 'gar-103',
        companyId: '',
        garageName: 'Apex Central',
        address: 'Industrial Area',
      }),
    ).toThrow('Company ID is required.');
  });

  it('should update details and audit stamp', () => {
    const garage = Garage.create({
      id: 'gar-104',
      companyId: 'comp-101',
      garageName: 'Apex Central',
      address: 'Industrial Area',
    });

    garage.updateDetails('Apex East Hub', 'Downtown Lane 5', 'comp-101|SUPER_ADMIN');
    expect(garage.garageName).toBe('Apex East Hub');
    expect(garage.address).toBe('Downtown Lane 5');
    expect(garage.editByName).toBe('comp-101|SUPER_ADMIN');
    expect(garage.modifiedDate).toBeInstanceOf(Date);
  });

  it('should toggle status and record audit stamp', () => {
    const garage = Garage.create({
      id: 'gar-105',
      companyId: 'comp-101',
      garageName: 'Apex Central',
      address: 'Industrial Area',
    });

    expect(garage.isActive).toBe(true);

    const suspended = garage.toggleStatus('comp-101|SUPER_ADMIN');
    expect(suspended).toBe(false);
    expect(garage.isActive).toBe(false);
    expect(garage.editByName).toBe('comp-101|SUPER_ADMIN');
    expect(garage.modifiedDate).toBeInstanceOf(Date);

    const reactivated = garage.toggleStatus('comp-101|SUPER_ADMIN');
    expect(reactivated).toBe(true);
    expect(garage.isActive).toBe(true);
  });
});
