# Electric Garage Management System (EGMS) - Technical Documentation

**System Version:** `1.0.0`  
**Framework:** NestJS 11 (Express Platform, TypeScript)  
**Architecture:** Hexagonal / Clean Architecture (Ports & Adapters) + CQRS  
**Database:** MySQL 8.0 (TypeORM)  
**Security:** JWT Authentication, Granular Role-Based Access Control (RBAC), Path Traversal Defense  
**Asset Management:** Native Under-5MB Progressive Image Compression Engine (`sharp`) & Secure Streaming  
**UI Engine:** Server-Side Rendered (SSR) Express Handlebars (HBS) with Bilingual Localization (EN / BN)

---

## Table of Contents
1. [System Architectural Design](#1-system-architectural-design)
2. [Domain Relationships & Entity Specifications](#2-domain-relationships--entity-specifications)
3. [Authentication, Authorization & Security Policies](#3-authentication-authorization--security-policies)
4. [Step-by-Step Core Business Logic](#4-step-by-step-core-business-logic)
   - 4.1 [Electricity Consumption & Billing Calculation Engine](#41-electricity-consumption--billing-calculation-engine)
   - 4.2 [Multi-Phone Number (`ContactPhone`) Subsystem](#42-multi-phone-number-contactphone-subsystem)
   - 4.3 [Progressive Under-5MB Compression & File Storage Subsystem](#43-progressive-under-5mb-compression--file-storage-subsystem)
   - 4.4 [Tenant Isolation & Soft Deletion Lifecycle](#44-tenant-isolation--soft-deletion-lifecycle)
   - 4.5 [Company Registration & Admin Email Approval Workflow](#45-company-registration--admin-email-approval-workflow)
5. [Complete API & MVC Endpoint Reference](#5-complete-api--mvc-endpoint-reference)
   - 5.1 [Authentication & Tenant Onboarding](#51-authentication--tenant-onboarding)
   - 5.2 [Executive Dashboard & Analytics](#52-executive-dashboard--analytics)
   - 5.3 [Customers Management](#53-customers-management)
   - 5.4 [Guarantors Management](#54-guarantors-management)
   - 5.5 [Employees & Access Control Management](#55-employees--access-control-management)
   - 5.6 [Garages & Facilities Management](#56-garages--facilities-management)
   - 5.7 [Electric Bills & Invoicing Ledger](#57-electric-bills--invoicing-ledger)
   - 5.8 [File Management, Streaming & Preview](#58-file-management-streaming--preview)
   - 5.9 [Security Audit Logs & Compliance](#59-security-audit-logs--compliance)
6. [UI Architecture & Handlebars Helper Pipeline](#6-ui-architecture--handlebars-helper-pipeline)
7. [Installation, Environment & Verification](#7-installation-environment--verification)

---

## 1. System Architectural Design

The project is structured according to **Clean Architecture** principles to decouple business rules from delivery mechanisms, web frameworks, and persistence models:

```
src/
├── domain/                      # Enterprise Business Rules (Entities, Value Objects, Interfaces)
│   ├── common/                  # AuditableEntity base, ContactPhone, AttachedDocument
│   ├── entities/                # Pure domain entities (Company, CompanyApprovalToken, Garage, Employee, Customer, etc.)
│   └── repositories/            # Repository port interfaces (ICustomerRepository, ICompanyApprovalTokenRepository, etc.)
├── application/                 # Application Business Rules (Use Cases, CQRS, DTOs, Mappings)
│   ├── commands/                # CQRS Commands & Command Handlers (RegisterCompany, ApproveCompany, RejectCompany, etc.)
│   ├── queries/                 # CQRS Queries & Query Handlers
│   ├── dtos/                    # Inbound validation DTOs
│   ├── mappings/                # AutoMapper profile definitions
│   └── services/                # BillingCalculationService, AuditLogService
├── infrastructure/              # External Interfaces & Framework Adapters
│   ├── auth/                    # JWT Strategy, RolesGuard, PermissionsGuard, Password Hashing
│   ├── email/                   # EmailService (Nodemailer SMTP, approval requests, welcome emails)
│   ├── persistence/typeorm/     # TypeORM Entities, Repositories, Database Seeders
│   ├── services/                # FileService (Sharp image compression & filesystem storage)
│   └── i18n/                    # Localization dictionary & translation helpers
└── presentation/                # Interface Adapters (Controllers, Routing, Views)
    └── controllers/             # MVC Controllers handling HTTP requests, file streams, views
```

### Architectural Data Flow:
```
[ Browser / API Client ]
        │
        ▼ HTTP Request (Cookies, JSON, Multipart/Form-Data)
[ Presentation Controllers ]
        │
        ▼ Dispatches CQRS Command / Query
[ Application Command/Query Bus ]
        │
        ├──► Executes Handlers (CreateCustomerHandler, etc.)
        │
        ├──► Enforces Domain Invariants & Rules (CustomerEntity, FileService)
        │
        └──► Interacts with Domain Ports (ICustomerRepository)
                 │
                 ▼ Implemented by Infrastructure
[ TypeORM Repositories / MySQL Database / Disk Storage ]
```

---

## 2. Domain Relationships & Entity Specifications

### Visual Entity Relationship Model
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       COMPANY                                          │
│ PK id: varchar(100)                                                                    │
│    companyName: varchar(255)                                                           │
│    registrationStatus: 'PENDING' | 'ACTIVE' | 'REJECTED'                               │
│    isActive: boolean (default: false)                                                  │
│    electricityRate: decimal(10,2)                                                      │
└───────┬───────────────────────────────┬───────────────────────────────┬────────────────┘
        │ 1:N                           │ 1:N                           │ 1:N
        ▼                               ▼                               ▼
┌───────────────────────────────┐ ┌────────────────────────────────┐ ┌───────────────────────────┐
│            GARAGE             │ │            EMPLOYEE            │ │  COMPANY_APPROVAL_TOKEN   │
│ PK id: varchar(100)           │ │ PK id: varchar(100)            │ │ PK id: varchar(100)       │
│ FK companyId: varchar(100)    │ │ FK companyId: varchar(100)     │ │ FK companyId: varchar     │
│    garageName: varchar(255)   │ │    email: varchar(255)         │ │    token: varchar(255)    │
│    address: text              │ │    role: 'SUPER_ADMIN'|'GENERAL│ │    expiresAt: datetime    │
└───────────────┬───────────────┘ │    phoneNumbers: json          │ │    isUsed: boolean        │
                │ 1:N             │    documents: json             │ │    createdAt: datetime    │
                ▼                 │    canCreate/canEdit/canDelete │ └───────────────────────────┘
┌───────────────────────────────┐ │    garageIds: json             │
│           CUSTOMER            │ └────────────────────────────────┘
│ PK id: varchar(100)           │
│ FK companyId: varchar(100)    │
│ FK garageId: varchar(100)     │
│    customerCode: varchar(50)  │
│    name: varchar(255)         │
│    previousUnit: decimal(10,2)│
│    advanceMoney: decimal(10,2)│
│    presentDues: decimal(10,2) │
│    phoneNumbers: json         │
│    documents: json            │
└───────┬───────────────────────┬───────┘
        │ 1:N                   │ 1:N
        ▼                       ▼
┌───────────────────────┐ ┌──────────────────────────────────────────────┐
│       GUARANTOR       │ │                 ELECTRICBILL                 │
│ PK id: varchar(100)   │ │ PK id: varchar(100)                          │
│ FK companyId: varchar │ │ FK companyId: varchar(100)                   │
│ FK customerId: varchar│ │ FK customerId: varchar(100)                  │
│    name: varchar(255) │ │ FK garageId: varchar(100)                    │
│    relationship: text │ │    date: date                                │
│    phoneNumbers: json │ │    previousUnit, currentUnit, totalUnit      │
│    documents: json    │ │    unitRate, electricBill, rentBill, loan    │
└───────────────────────┘ │    totalBill, clearMoney, presentDues        │
                          └──────────────────────────────────────────────┘
```

### Detailed Entity Schema

#### 1. `Company` (Tenant Root)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Owner / Contact representative name |
| `companyName` | `VARCHAR(255)` | NOT NULL | Registered company / organization name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Super Admin primary login email |
| `password` | `VARCHAR(255)` | NOT NULL | Salted Bcrypt hash (min 10 rounds) |
| `phoneNumber`| `VARCHAR(50)` | NOT NULL | Primary company contact number |
| `role` | `VARCHAR(50)` | NOT NULL | Default `SUPER_ADMIN` |
| `electricityRate`| `DECIMAL(10,2)`| NOT NULL, Default `12.00` | Baseline tariff rate per unit (৳) |
| `address` | `TEXT` | NOT NULL | Commercial headquarters address |
| `registrationStatus` | `VARCHAR(20)` | NOT NULL, Default `'PENDING'` | Approval state: `'PENDING'`, `'ACTIVE'`, `'REJECTED'` |
| `isActive` | `BOOLEAN` | Default `false` | Activated only upon administrator approval |
| `isDeleted` | `BOOLEAN` | Default `false` | Soft-deletion flag |
| Audit Fields | `VARCHAR`, `DATETIME` | Nullable | `createdBy`, `editByName`, `createdDate`, etc. |

#### 2. `Customer`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `companyId` | `VARCHAR(100)` | Foreign Key | References `companies.id` |
| `garageId` | `VARCHAR(100)` | Foreign Key | References `garages.id` |
| `customerCode` | `VARCHAR(50)` | Nullable | Human-readable ID (e.g. `CUST-001`) |
| `name` | `VARCHAR(255)` | NOT NULL | Full name of subscriber |
| `fatherName`, `motherName` | `VARCHAR(255)` | Nullable | Parental identity records |
| `mobileNumber` | `VARCHAR(50)` | NOT NULL | Primary mobile number |
| `phoneNumbers` | `JSON` | Nullable | Array of `ContactPhone` value objects |
| `nidNumber` | `VARCHAR(100)` | NOT NULL | National ID card number |
| `address` | `TEXT` | NOT NULL | Shop, bay, or residence address |
| `previousUnit` | `DECIMAL(10,2)`| NOT NULL, Default `0.00` | Initial baseline meter reading |
| `advanceMoney` | `DECIMAL(10,2)`| NOT NULL, Default `0.00` | Security deposit baseline held (৳) |
| `presentDues` | `DECIMAL(10,2)`| NOT NULL, Default `0.00` | Current unpaid billing balance (৳) |
| `documents` | `JSON` | Nullable | Array of `AttachedDocument` value objects |

#### 3. `Guarantor`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `companyId` | `VARCHAR(100)` | Foreign Key | References `companies.id` |
| `customerId` | `VARCHAR(100)` | Foreign Key | References `customers.id` |
| `name` | `VARCHAR(255)` | NOT NULL | Guarantor full name |
| `relationship` | `VARCHAR(100)` | Nullable | Relationship (Father, Brother, Partner) |
| `mobileNumber` | `VARCHAR(50)` | NOT NULL | Primary phone number |
| `phoneNumbers` | `JSON` | Nullable | Array of `ContactPhone` value objects |
| `nidNumber` | `VARCHAR(100)` | NOT NULL | National ID card number |
| `fatherName`, `motherName` | `VARCHAR(255)` | Nullable | Parental records |
| `address` | `TEXT` | NOT NULL | Residential or commercial address |
| `documents` | `JSON` | Nullable | Array of `AttachedDocument` value objects |

#### 4. `Employee`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `companyId` | `VARCHAR(100)` | Foreign Key | References `companies.id` |
| `name` | `VARCHAR(255)` | NOT NULL | Employee full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Staff login email |
| `password` | `VARCHAR(255)` | NOT NULL | Salted Bcrypt hash |
| `phoneNumber`| `VARCHAR(50)` | NOT NULL | Primary phone number |
| `phoneNumbers` | `JSON` | Nullable | Array of `ContactPhone` value objects |
| `role` | `VARCHAR(50)` | NOT NULL | `SUPER_ADMIN` or `GENERAL` |
| `nidNumber` | `VARCHAR(100)` | NOT NULL | National ID card number |
| `address` | `TEXT` | NOT NULL | Residential address |
| `canCreate`, `canEdit`, `canDelete`, `canView` | `BOOLEAN` | Default `false` | Granular permission capabilities |
| `garageIds` | `JSON` | Nullable | Allowed facility UUIDs (null = unrestricted) |
| `documents` | `JSON` | Nullable | Array of `AttachedDocument` value objects |

#### 5. `ElectricBill`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `companyId` | `VARCHAR(100)` | Foreign Key | References `companies.id` |
| `garageId` | `VARCHAR(100)` | Foreign Key | References `garages.id` |
| `customerId` | `VARCHAR(100)` | Foreign Key | References `customers.id` |
| `date` | `DATE` | NOT NULL | Statement date |
| `previousUnit` | `DECIMAL(10,2)`| NOT NULL | Starting meter reading |
| `currentUnit` | `DECIMAL(10,2)`| NOT NULL | Ending meter reading |
| `totalUnit` | `DECIMAL(10,2)`| NOT NULL | Consumed units (`current - previous`) |
| `unitRate` | `DECIMAL(10,2)`| NOT NULL | Tariff rate applied per unit (৳) |
| `electricBill` | `DECIMAL(10,2)`| NOT NULL | Calculated energy charge (`totalUnit * rate`) |
| `previousDues` | `DECIMAL(10,2)`| NOT NULL | Unpaid balance carried forward |
| `rentBill` | `DECIMAL(10,2)`| NOT NULL, Default `0.00` | Shop/bay space rent charges |
| `loan` | `DECIMAL(10,2)`| NOT NULL, Default `0.00` | Machine or financing installment |
| `totalBill` | `DECIMAL(10,2)`| NOT NULL | Total gross invoice amount |
| `clearMoney` | `DECIMAL(10,2)`| NOT NULL | Payment amount deposited |
| `presentDues` | `DECIMAL(10,2)`| NOT NULL | Net remaining balance carried to ledger |
| `status` | `VARCHAR(50)` | Default `'UNPAID'` | `'PAID'`, `'PARTIAL'`, `'UNPAID'` |

#### 6. `CompanyApprovalToken` (`company_approval_tokens`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | Primary Key | UUID identifier |
| `companyId` | `VARCHAR(100)` | Foreign Key, CASCADE | References `companies.id` |
| `token` | `VARCHAR(255)` | NOT NULL, UNIQUE | 64-character hexadecimal cryptographic verification token |
| `expiresAt` | `DATETIME` | NOT NULL | Expiry timestamp (configured via `APPROVAL_TOKEN_EXPIRY_HOURS`, default 48h) |
| `isUsed` | `BOOLEAN` | NOT NULL, Default `false` | Single-use invalidation flag |
| `createdAt` | `DATETIME` | NOT NULL | Generation timestamp |

---

## 3. Authentication, Authorization & Security Policies

### 3.1 Authentication Pipeline (`JwtAuthGuard` & `JwtStrategy`)
The application implements dual authentication handling:
1. **Web Browser MVC**: JWT tokens are automatically extracted from secure, `HttpOnly` browser cookies named `jwt`.
2. **REST API Clients**: Tokens are read from the standard HTTP header `Authorization: Bearer <token>`.

#### JWT Payload Structure:
```json
{
  "sub": "emp-uuid-12345",
  "email": "technician@apexauto.com",
  "name": "Mohammad Rahim",
  "role": "GENERAL",
  "companyId": "comp-uuid-98765",
  "garageIds": ["gar-01", "gar-02"],
  "canCreate": true,
  "canEdit": true,
  "canDelete": false,
  "canView": true,
  "iat": 1727100000,
  "exp": 1727704800
}
```

### 3.2 Authorization Guards
- **`RolesGuard` (`@Roles('SUPER_ADMIN')`)**:
  Restricts system configuration, company-wide settings, user permission provisioning, and employee deletion strictly to Super Administrators.
- **`PermissionsGuard` (`@RequirePermissions('canCreate' | 'canEdit' | 'canDelete' | 'canView')`)**:
  Enforces granular capabilities for general staff. If an employee has `role === 'GENERAL'` and lacks `canCreate`, attempts to post to `/customers` or `/bills/new` are denied with `403 Forbidden`.
- **Branch-Level Access Isolation**:
  Employees with an assigned `garageIds` array cannot view, edit, or generate bills for customers outside their allowed facilities. Super Admins bypass facility restrictions.

### 3.3 Company Registration Status & Access Lifecycle
When an employee or Super Admin attempts authentication via `LoginHandler`:
1. The company tenant record is resolved by `companyId`.
2. **Pending Registration Gate**: If `company.registrationStatus === 'PENDING'` or `!company.isActive`, authentication is denied immediately with `403 Forbidden`:
   > *"Your company registration is pending approval from the administrator. Please wait for confirmation. / আপনার কোম্পানির নিবন্ধন এখনও অনুমোদনের অপেক্ষায় রয়েছে।"*
3. **Rejected Registration Gate**: If `company.registrationStatus === 'REJECTED'`, login is blocked with `403 Forbidden`:
   > *"Your company registration was not approved. / আপনার কোম্পানির নিবন্ধন অনুমোদন করা হয়নি।"*
4. Only companies with `registrationStatus === 'ACTIVE'` and `isActive === true` can issue JWT tokens and proceed to the dashboard.

---

## 4. Step-by-Step Core Business Logic

### 4.1 Electricity Consumption & Billing Calculation Engine
Implemented in [`BillingCalculationService`](file:///d:/GitHub/EGMS_NestJs/src/application/services/billing-calculation.service.ts):

```
                       [ Inputs ]
               ┌────────────────────────┐
               │ Current Meter Reading  │
               │ Previous Meter Reading │
               │ Tariff Rate per Unit   │
               │ Bay Rent + Loan Amount │
               │ Previous Outstanding   │
               │ Customer Advance Money │
               └───────────┬────────────┘
                           │
                           ▼
         Step 1: Consumed Units Calculation
         ConsumedUnits = max(0, CurrentUnit - PreviousUnit)
                           │
                           ▼
         Step 2: Energy Charges Computation
         ElectricCharges = ConsumedUnits * UnitRate
                           │
                           ▼
         Step 3: Gross Invoiced Amount
         GrossBill = ElectricCharges + Rent + Loan + PreviousDues
                           │
                           ▼
         Step 4: Payment Reconciliation & Ledger Sync
         NetDues = GrossBill - ClearMoney
         Update Customer: presentDues = NetDues, previousUnit = CurrentUnit
```

1. **Step 1: Consumption Validation**: Verifies `currentUnit >= previousUnit`. If an anomaly is detected (e.g. meter replacement), previous units are reconciled against customer baseline units.
2. **Step 2: Energy Rate Lookup**: Defaults to `customer.company.electricityRate` unless an override rate is specified on the invoice.
3. **Step 3: Component Aggregation**: Sums electric charges, workshop rent, installment loans, and existing customer arrears.
4. **Step 4: Deposit & Cash Reconciliation**: Deducts cash deposited (`clearMoney`). If an advance deduction is authorized, it offsets dues against `customer.advanceMoney`.
5. **Step 5: Customer Ledger Update**: Mutates `customer.presentDues` to the resulting balance and updates `customer.previousUnit` to `currentUnit` for subsequent cycles.

---

### 4.2 Multi-Phone Number (`ContactPhone`) Subsystem
Defined in [`ContactPhone`](file:///d:/GitHub/EGMS_NestJs/src/domain/common/contact-phone.interface.ts) and [`parsePhoneNumbersInput`](file:///d:/GitHub/EGMS_NestJs/src/application/dtos/contact-phone.dto.ts):

1. **Data Model**:
   ```typescript
   interface ContactPhone {
     number: string;
     type: 'PERSONAL' | 'WHATSAPP' | 'EMERGENCY' | 'WORK' | 'ALTERNATIVE';
     isPrimary: boolean;
   }
   ```
2. **Step-by-Step Handling**:
   - **Step 1: Ingestion**: Phone numbers arrive either as individual inputs (`mobileNumber`), array forms, or encoded JSON strings from client repeaters (`phoneNumbersJson`).
   - **Step 2: Normalization**: Whitespace and special formatting characters are cleaned.
   - **Step 3: Duplicate Filtering**: Identical phone numbers within the same entity are filtered out to prevent redundant storage.
   - **Step 4: Primary Assignment**: Exactly one number is marked `isPrimary: true`. If no primary flag is selected, the first entered phone defaults to primary.
   - **Step 5: Entity Synchronization**: Both `customer.mobileNumber` (primary string) and `customer.phoneNumbers` (complete JSON array) are persisted for maximum compatibility.

---

### 4.3 Progressive Under-5MB Compression & File Storage Subsystem
Implemented in [`FileService`](file:///d:/GitHub/EGMS_NestJs/src/infrastructure/services/file.service.ts), strictly adhering to `FileService.cs` patterns:

```
                            [ Uploaded File ]
                                    │
                       Is file an Image (JPG, PNG, WEBP)?
                                    │
                     ┌──────────────┴──────────────┐
                    YES                            NO
                     │                             │
                     ▼                             ▼
        [ Progressive Compression ]    [ Document Size Check ]
        Loop quality: 90% down to 10%  Validate: size <= 5MB
        Does buffer exceed 5MB?        Do NOT alter binary (PDF/DOC)
                     │                             │
           ┌─────────┴─────────┐                   ▼
       <= 5MB                > 5MB             Write to Disk
          │                    │
          ▼                    ▼
     Write to Disk       Scale Dimensions
                         by 20% steps
                               │
                               ▼
                         Write to Disk
```

#### Step-by-Step Compression Execution:
1. **Path Traversal Defense**: The target path is verified against `public/uploads/<folderName>/`. Any relative path escaping the base storage folder is rejected with `BadRequestException`.
2. **UUID Naming**: Files are assigned a random v4 UUID (e.g. `d3b07384-d113-4632-b9cf-2b0e2d3e4d5a.png`).
3. **Image Step-Down Compression**:
   - If the file is an image (`image/jpeg`, `image/png`, `image/webp`), it is processed via `sharp`.
   - Quality begins at `90%`. If size > 5,242,880 bytes (5MB), quality decreases in decrements of `10%` (`80%`, `70%`, ..., `10%`).
   - If at `10%` quality the file still exceeds 5MB, its pixel dimensions (`width`, `height`) are scaled down by `20%` iteratively until the output buffer satisfies `<= 5MB`.
4. **Non-Image Binary Integrity**:
   - Documents (`application/pdf`, Excel `.xlsx`, Word `.docx`) bypass image manipulation to prevent file corruption.
   - Enforces a strict hard cap of 5MB. Any document exceeding 5MB is rejected with an explicit error.
5. **Metadata Persistence**:
   - Writes the file to disk and records an `AttachedDocument` record:
     ```typescript
     {
       id: "doc-uuid",
       originalName: "NID_Card_Scan.pdf",
       fileName: "7a8b9c...pdf",
       filePath: "uploads/customers/7a8b9c...pdf",
       fileType: "application/pdf",
       size: 1420500,
       tag: "NID",
       uploadedAt: "2026-09-23T16:30:00.000Z"
     }
     ```

---

### 4.4 Tenant Isolation & Soft Deletion Lifecycle
- **Tenant Scoping**: All queries against `Customer`, `Garage`, `Employee`, `ElectricBill`, and `AuditLog` automatically inject `WHERE companyId = :companyId`. Users can never access entities belonging to other tenants.
- **Soft Deletion**: Entities inherit `AuditableEntity`. Deleting a customer or employee updates `isDeleted = true` and records `deletedBy = "{userId}|{userRole}"` and `deletedDate = new Date()`. Soft-deleted entities are automatically excluded from directory queries.

---

### 4.5 Company Registration & Admin Email Approval Workflow

To ensure security, identity verification, and administrative governance over multi-tenant provisioning, all new company registrations pass through an email-based administrator approval gate:

```
[ New Registrant ]
       │
       ▼ Submits Registration Form
  POST /register
       │
       ├──► 1. Creates Company Entity (isActive = false, registrationStatus = 'PENDING')
       ├──► 2. Provisions Default Garage & Super Admin Employee Account
       ├──► 3. Generates 64-character Cryptographic Token (crypto.randomBytes(32))
       ├──► 4. Persists CompanyApprovalToken in MySQL (configurable expiry, default 48h)
       ├──► 5. Dispatches Golden-Themed HTML Email with Action Links to ADMIN_APPROVAL_EMAIL
       │
       ▼ Renders views/auth/register-pending.hbs (Informs registrant to await admin review)
[ Registrant Browser ]

                           [ Platform Admin Email Inbox ]
                                        │
                       Receives Approval Notification Email
                                        │
                      ┌─────────────────┴─────────────────┐
                      │                                   │
              Clicks "Approve"                    Clicks "Reject"
                      │                                   │
                      ▼                                   ▼
          GET /company/approve?token=...       GET /company/reject?token=...
                      │                                   │
                      ├─► Validates Token                 ├─► Validates Token
                      ├─► Company: isActive = true        ├─► Hard-deletes Company
                      │   registrationStatus = 'ACTIVE'   │   (Cascades: Garage,
                      ├─► Marks token as isUsed           │   Employee, Tokens)
                      ├─► Sends Welcome Email to Tenant   ├─► Marks token as isUsed
                      ├─► Logs Audit: APPROVE             ├─► Logs Audit: REJECT
                      ▼                                   ▼
           Renders approval-result.hbs         Renders approval-result.hbs
            (Company is Now Active)             (Registration Purged)
```

#### Detailed Workflow Steps:
1. **Registration Ingestion (`POST /register`)**:
   - Validates input fields using `RegisterCompanyDto`.
   - `RegisterCompanyHandler` checks for email duplicates across `Company` and `Employee` repositories.
   - Saves `Company` entity with `isActive: false` and `registrationStatus: 'PENDING'`.
   - Provisions default `Garage` branch and creates initial Super Admin `Employee` account.
2. **Cryptographic Token Issuance**:
   - Generates a cryptographically secure 64-character hex token: `crypto.randomBytes(32).toString('hex')`.
   - Calculates expiry date (`Date.now() + APPROVAL_TOKEN_EXPIRY_HOURS * 3600 * 1000`, default 48h).
   - Inserts record into `company_approval_tokens`.
3. **Admin Notification Email Dispatch**:
   - `EmailService.sendCompanyApprovalRequestEmail()` sends an HTML email to `ADMIN_APPROVAL_EMAIL` (default: `kfahim2280@gmail.com`).
   - The email contains:
     - Company Name, Representative Name, Email, Phone, Address, Initial Garage Name.
     - Registration timestamp and token expiration countdown.
     - Two distinct action buttons:
       - **✅ Approve Company**: `${APP_URL}/company/approve?token=${token}`
       - **❌ Reject & Delete**: `${APP_URL}/company/reject?token=${token}`
4. **Registrant Waiting Screen**:
   - Instead of auto-logging the user in, the controller renders `views/auth/register-pending.hbs`.
   - The view displays a bilingual confirmation (English / বাংলা) informing the user that their registration has been submitted and is awaiting administrator verification.
5. **Admin Decision Execution**:
   - **On Approval (`GET /company/approve`)**:
     - `ApproveCompanyHandler` locates the token and checks `isValid()` (must not be used and must not be expired).
     - Updates company status: `isActive = true`, `registrationStatus = 'ACTIVE'`.
     - Marks token `isUsed = true`.
     - Sends an automated welcome email with login instructions to the company Super Admin.
     - Creates audit log entry (`ADMIN_APPROVE_COMPANY`).
     - Renders `views/auth/approval-result.hbs` indicating successful activation.
   - **On Rejection (`GET /company/reject`)**:
     - `RejectCompanyHandler` locates the token and validates it.
     - Hard-deletes the company record (`companyRepository.delete(companyId)`).
     - Due to database foreign key cascade constraints (`onDelete: 'CASCADE'`), associated garages, employees, and tokens are completely purged.
     - Creates audit log entry (`ADMIN_REJECT_COMPANY`).
     - Renders `views/auth/approval-result.hbs` indicating the registration was rejected and purged.

---

## 5. Complete API & MVC Endpoint Reference

### 5.1 Authentication & Tenant Onboarding

#### `POST /login`
Authenticates a Super Admin or Staff Employee.
- **Headers / Content-Type**: `application/x-www-form-urlencoded` or `application/json`
- **Request Body**:
  ```json
  {
    "email": "admin@apexauto.com",
    "password": "Admin@123"
  }
  ```
- **Responses**:
  - `302 Found`: Redirects to `/` on success. Sets `Set-Cookie: jwt=<token>; HttpOnly; Path=/; Max-Age=604800`.
  - `401 Unauthorized`: Re-renders login view with credential error message.
  - `403 Forbidden`: Company is in `PENDING` (awaiting approval) or `REJECTED` status.

#### `POST /register`
Registers a new tenant Company and creates the primary Super Admin profile in `PENDING` status.
- **Request Body**:
  ```json
  {
    "companyName": "Metro Electric Fleet Ltd.",
    "name": "Tariqul Islam",
    "email": "tariq@metrofleet.com",
    "password": "SecurePassword@2026",
    "phoneNumber": "01711000000",
    "address": "45 Mohakhali Commercial Area, Dhaka",
    "initialGarageName": "Mohakhali Workshop 01"
  }
  ```
- **Responses**:
  - `200 OK`: Renders `views/auth/register-pending.hbs` displaying company details and notifying the registrant that approval is pending. Triggers admin approval request email.
  - `400 Bad Request`: Validation failure or email already taken.

#### `GET /company/approve`
One-click admin verification link from approval notification email.
- **Query Parameters**:
  - `token` (string, required): 64-character hexadecimal cryptographic verification token.
- **Behavior**: Validates token, activates company (`isActive = true`, `registrationStatus = 'ACTIVE'`), marks token as used, sends welcome email to company Super Admin, records audit log.
- **Responses**:
  - `200 OK`: Renders `views/auth/approval-result.hbs` with `approved: true` and activation confirmation.
  - `400 Bad Request`: Token is invalid, expired, or previously used.

#### `GET /company/reject`
One-click admin rejection link from approval notification email.
- **Query Parameters**:
  - `token` (string, required): 64-character hexadecimal cryptographic verification token.
- **Behavior**: Validates token, marks token as used, hard-deletes company record (cascading to garage, employee, tokens), records audit log.
- **Responses**:
  - `200 OK`: Renders `views/auth/approval-result.hbs` with `approved: false` and purge confirmation.
  - `400 Bad Request`: Token is invalid, expired, or previously used.

#### `GET /logout`
Clears the session cookie.
- **Responses**:
  - `302 Found`: Clears `jwt` cookie and redirects to `/login`.

---

### 5.2 Executive Dashboard & Analytics

#### `GET /`
Renders the primary executive operational overview.
- **Authorization**: `JwtAuthGuard`
- **Query Parameters**:
  - `garageId` (optional): Filter metrics by specific garage branch.
  - `fromDate`, `toDate` (optional): Date range for billing aggregations.
  - `preset` (optional): `today`, `thisMonth`, `lastMonth`, `thisYear`, `allTime`.
- **Response**: HTML view with metrics:
  - Total Advance Deposits held
  - Total Outstanding Dues across all customers
  - Net Ledger Balance (`Advance - Dues`)
  - Active vs Inactive subscribers count
  - Managed garages and staff counts

---

### 5.3 Customers Management

#### `GET /customers`
Renders paginated directory of customers.
- **Authorization**: `JwtAuthGuard`
- **Query Parameters**: `search`, `garageId`, `fromDate`, `toDate`, `preset`, `page`
- **Response**: HTML table and grid view of customers with balances and primary phone badges.

#### `POST /customers`
Creates a new customer profile with initial baseline readings and optional attachments.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canCreate')`
- **Content-Type**: `multipart/form-data`
- **Request Fields**:
  - `garageId` (string, required): Facility UUID
  - `customerCode` (string, optional): Unique ID (e.g. `CUST-001`)
  - `name` (string, required): Full customer name
  - `mobileNumber` (string, required): Primary phone number
  - `phoneNumbersJson` (string, optional): Encoded `ContactPhone[]`
  - `nidNumber` (string, required): National ID card
  - `fatherName`, `motherName` (string, optional)
  - `address` (string, required): Physical premises address
  - `previousUnit` (decimal, required): Initial baseline meter reading
  - `advanceMoney` (decimal, required): Security deposit
  - `documentType` (string, optional): Attachment category
  - `files` (binary files, optional): Up to 10 files (under 5MB each)
- **Response**:
  - `302 Found`: Redirects to `/customers?success=Customer+registered+successfully`.

#### `GET /customers/:id`
Customer Profile 360-degree view.
- **Response**: Customer identity card, multi-phone numbers roster, Guarantors list, attached documents gallery with download/preview buttons, and complete electricity billing history ledger.

#### `POST /customers/:id/edit`
Updates customer details, contact phones, address, and appends new files.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canEdit')`
- **Content-Type**: `multipart/form-data`

#### `POST /customers/:id/delete`
Soft-deletes a customer record.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canDelete')`

#### `GET /customers/check-code?code=CUST-001&exclude=optional-id`
JSON check for customer code uniqueness.
- **Response**:
  ```json
  { "available": true }
  ```

---

### 5.4 Guarantors Management

#### `POST /customers/:id/guarantors`
Adds an authorized guarantor to a customer profile.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canCreate')`
- **Content-Type**: `multipart/form-data`
- **Request Fields**: `name`, `relationship`, `mobileNumber`, `phoneNumbersJson`, `nidNumber`, `fatherName`, `motherName`, `address`, `documentType`, `files`

#### `POST /customers/:id/guarantors/:guarantorId`
Updates guarantor profile, multi-phone collection, and appends documents.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canEdit')`

#### `POST /customers/:id/guarantors/:guarantorId/delete`
Removes guarantor relationship.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canDelete')`

---

### 5.5 Employees & Access Control Management

#### `GET /employees`
Lists company personnel and authorized technicians.
- **Authorization**: `JwtAuthGuard`, `RolesGuard('SUPER_ADMIN')`

#### `POST /employees`
Registers a new company employee.
- **Authorization**: `JwtAuthGuard`, `RolesGuard('SUPER_ADMIN')`
- **Content-Type**: `multipart/form-data`
- **Request Fields**: `name`, `email`, `password`, `nidNumber`, `phoneNumber`, `phoneNumbersJson`, `address`, `documentType`, `files`

#### `POST /employees/:id/permissions`
Configures fine-grained access control permissions for a staff member.
- **Authorization**: `JwtAuthGuard`, `RolesGuard('SUPER_ADMIN')`
- **Request Body**:
  ```json
  {
    "role": "GENERAL",
    "isActive": true,
    "canCreate": true,
    "canEdit": true,
    "canDelete": false,
    "canView": true,
    "garageIds": ["gar-uuid-1", "gar-uuid-2"]
  }
  ```

---

### 5.6 Garages & Facilities Management

#### `GET /garages`
Lists physical garage locations, bay capacities, assigned customers, and collected revenues.

#### `POST /garages`
Registers a new physical garage workshop.
- **Authorization**: `JwtAuthGuard`, `RolesGuard('SUPER_ADMIN')`
- **Request Body**:
  ```json
  {
    "garageName": "Mirpur Bay 04 - Electric Terminal",
    "address": "Plot 12, Road 5, Mirpur-10, Dhaka"
  }
  ```

---

### 5.7 Electric Bills & Invoicing Ledger

#### `GET /bills`
Complete electric billing invoice ledger. Supports garage filtering and date presets.

#### `GET /bills/api/preview`
Real-time dynamic JSON calculation endpoint for billing preview before submission.
- **Query Parameters**: `customerId`, `currentUnit`, `previousUnit`, `unitRate`, `rentBill`, `loan`, `clearMoney`
- **Response**:
  ```json
  {
    "totalUnit": 120.50,
    "electricBill": 1446.00,
    "previousDues": 500.00,
    "rentBill": 2000.00,
    "loan": 0.00,
    "totalBill": 3946.00,
    "clearMoney": 3500.00,
    "presentDues": 446.00
  }
  ```

#### `POST /bills`
Generates and commits a customer monthly electric bill statement.
- **Authorization**: `JwtAuthGuard`, `PermissionsGuard('canCreate')`
- **Request Body**:
  ```json
  {
    "customerId": "cust-uuid-123",
    "garageId": "gar-uuid-456",
    "date": "2026-09-01",
    "previousUnit": 450.00,
    "currentUnit": 570.50,
    "unitRate": 12.00,
    "rentBill": 2500.00,
    "loan": 0.00,
    "clearMoney": 3946.00,
    "note": "September 2026 Billing"
  }
  ```

#### `GET /bills/:id`
Renders a printable invoice and payment receipt.

---

### 5.8 File Management, Streaming & Preview

#### `GET /files/download`
Streams file with original human-readable name as an attachment.
- **Query Parameters**:
  - `path`: Relative path (e.g. `uploads/customers/a1b2c3d4.pdf`)
  - `name`: Human-readable download filename (e.g. `Trade_License.pdf`)
- **Headers Returned**:
  ```http
  Content-Disposition: attachment; filename="Trade_License.pdf"
  Content-Type: application/pdf
  ```

#### `GET /files/preview`
Streams images or PDF documents inline for immediate browser tab viewing.
- **Query Parameters**: `path`, `name`
- **Headers Returned**:
  ```http
  Content-Disposition: inline; filename="Trade_License.pdf"
  Content-Type: application/pdf
  ```

#### `POST /customers/:id/documents`
Direct multi-file upload modal handler for existing customers.
- **Content-Type**: `multipart/form-data`
- **Body**: `type` (`NID`, `AGREEMENT`, `PASSPORT`, `ELECTRICITY_BILL`, `PHOTO`, `OTHER`), `files` (array)

#### `POST /customers/:id/documents/:docId/delete`
Permanently deletes the physical file from disk and updates the customer document array.

---

### 5.9 Security Audit Logs & Compliance

#### `GET /audit-logs`
Administrative activity trail filterable by action (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`), entity type (`CUSTOMER`, `EMPLOYEE`, `BILL`), actor, and date range.

#### `GET /audit-logs/export-csv`
Exports system audit history to a formatted CSV spreadsheet for administrative compliance.

---

## 6. UI Architecture & Handlebars Helper Pipeline

The UI is built using responsive vanilla CSS and **Express Handlebars (`hbs`)** with modular partials:

### Partials Directory (`views/partials/`)
- **`document-list.hbs`**: Displays attached documents with icons (`📕`, `🖼️`, `📊`, `📄`), category badges, size formatting, upload dates, and action buttons (Download, Preview, Delete).
- **`file-uploader.hbs`**: Drag-and-drop file upload zone with client-side file selection, preview badges, auto-compress indicators, and removal controls.
- **`phone-repeater.hbs`**: Dynamic multi-phone input table supporting multiple phone types and primary selection.

### Dedicated Authentication & Workflow Views (`views/auth/`)
- **`login.hbs`**: Responsive glassmorphic login interface with bilingual toggle and 1-click demo credential autofill.
- **`register.hbs`**: Company tenant self-registration form with contact details and initial workshop provisioning.
- **`register-pending.hbs`**: Bilingual confirmation screen displayed post-registration informing the tenant that their registration is undergoing administrative review.
- **`approval-result.hbs`**: Administrative decision landing page for `GET /company/approve` and `GET /company/reject` displaying live status badges, verified company details, and next action links.

### Custom Handlebars Helpers Registered in `main.ts`:
| Helper | Usage | Description |
|---|---|---|
| `t` | `{{t 'customers.title'}}` | Translates key based on active session language (`en` or `bn`). |
| `bnNum` | `{{bnNum customer.advanceMoney}}` | Converts numerals to Bengali digits when `lang === 'bn'`. |
| `tDate` | `{{tDate bill.date}}` | Formats date according to active language conventions. |
| `formatFileSize` | `{{formatFileSize doc.size}}` | Converts raw bytes to human-readable `KB`, `MB`, `GB`. |
| `fileIcon` | `{{fileIcon doc.originalName}}` | Inspects MIME/extension and renders appropriate emoji icon. |
| `concat` | `{{concat "/customers/" id "/edit"}}` | Concatenates dynamic strings for nested routes. |
| `eq`, `ne`, `gt`, `gte` | `{{#if (eq role 'SUPER_ADMIN')}}` | Relational logical operators. |
| `and`, `or`, `not` | `{{#if (or isSuperAdmin canEdit)}}` | Boolean logic helpers. |

---

## 7. Installation, Environment & Verification

### 7.1 Environment Setup (`.env`)
```env
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=egms_db
DB_SYNCHRONIZE=true
ALLOW_SEED=false

# JWT Security
JWT_SECRET=super_secret_jwt_egms_key_2026_enterprise_secure!
JWT_EXPIRES_IN=7d

# Email / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="EGMS Portal <your_email@gmail.com>"

# Company Registration Approval Workflow
ADMIN_APPROVAL_EMAIL=kfahim2280@gmail.com
APPROVAL_TOKEN_EXPIRY_HOURS=48
```

### 7.2 Running the Application
```bash
# Install NPM dependencies
npm install

# Compile TypeScript to verify zero build errors
npm run build

# Run unit tests
npm test

# Launch development server with hot-reload
npm run start:dev
```

### 7.3 Default Seeded Demo Credentials
- **Company Super Admin**: `admin@apexauto.com` / `Admin@123`
- **Company General Staff**: `john.doe@apexauto.com` / `Employee@123`
