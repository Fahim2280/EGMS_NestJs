export interface AuditableProps {
    isActive?: boolean;
    isDeleted?: boolean;
    createdBy?: string;
    editByName?: string;
    deletedBy?: string;
    createdDate?: Date;
    modifiedDate?: Date;
    deletedDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare abstract class AuditableEntity {
    isActive: boolean;
    isDeleted: boolean;
    createdBy?: string;
    editByName?: string;
    deletedBy?: string;
    createdDate: Date;
    modifiedDate?: Date;
    deletedDate?: Date;
    constructor(props?: AuditableProps);
    get createdAt(): Date;
    get updatedAt(): Date;
    markModified(byStamp: string): void;
    softDelete(byStamp: string): void;
    restore(byStamp: string): void;
    activate(byStamp?: string): void;
    deactivate(byStamp?: string): void;
}
