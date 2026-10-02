export declare abstract class BaseAuditableOrmEntity {
    isActive: boolean;
    isDeleted: boolean;
    createdBy?: string;
    editByName?: string;
    deletedBy?: string;
    createdDate: Date;
    modifiedDate?: Date;
    deletedDate?: Date;
}
