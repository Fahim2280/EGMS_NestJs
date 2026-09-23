# Electric Garage & Customer Management System (EGMS) - NestJS

A production-grade enterprise multi-tenant portal built with **NestJS 11**, **Clean Architecture** (Hexagonal/Ports & Adapters), **CQRS** (Command Query Responsibility Segregation), **AutoMapper**, **JWT Authentication & Granular RBAC**, and **MySQL 8.0**. Features a modern dark-glassmorphic **Express Handlebars (HBS) MVC** web interface, responsive mobile views, comprehensive bilingual localization (**English** & **বাংলা**), multi-phone management, and a robust **File Storage, Auto-Compression & Secure Download System** modeled after enterprise .NET patterns.

---

## 🌟 Key Highlights & Capabilities

- 🏢 **Multi-Tenant Company & Garage Architecture**: Centralized management of company branches, physical garage workshops, and staff assignments.
- ⚡ **Electric Billing & Meter Calculation Engine**: Automatic computation of consumed meter units, energy tariff charges, rent, loan installments, previous arrears, advance deposit offsets, and printable billing invoices/receipts.
- 📞 **Multi-Phone Numbers System**: Employees, customers, and guarantors can register multiple phone numbers with categorization (`Personal`, `WhatsApp`, `Emergency`, `Work`, `Alternative`), dedicated primary number tagging, one-click WhatsApp chat, and click-to-call.
- 📁 **File Upload, Progressive Compression (<5MB) & Download**: Modeled directly after enterprise .NET `FileService.cs`:
  - Organized directories under `public/uploads/{customers|employees|guarantors}/`.
  - Automated UUID naming and path traversal protection.
  - **Progressive Under-5MB Compression**: Images (`.jpg`, `.png`, `.webp`) are compressed using progressive quality step-downs (90% down to 10%) and proportional dimensional scaling to ensure file sizes are kept strictly under 5MB.
  - **Non-Image Binary Protection**: PDFs, Excel spreadsheets, and Word documents are protected from lossy image transcoders and strictly validated against the 5MB size limit.
  - **Secure Downloads & Previews**: Download attachments with original human-readable filenames (`Content-Disposition: attachment`) and preview documents/images directly in browser tabs (`Content-Disposition: inline`).
- 🌐 **Full Bilingual Support (EN / BN)**: Seamless on-the-fly language switching between English and Bengali (`বাংলা`) with localized dates, numerals, and currencies (৳).
- 🛡️ **Role-Based Access Control (RBAC) & Granular Permissions**: Distinct `SUPER_ADMIN` and `GENERAL` staff roles with fine-grained capability checks (`canView`, `canCreate`, `canEdit`, `canDelete`) and garage facility access restrictions.
- 📋 **Audit Log Trail**: Complete tracking of system operations, authentication events, modifications, and deletions with actor identification, client IP, and user-agent stamps.

---

## 🏛️ Domain Model & Entities

```
   ┌─────────────────────────────────────────────────────────────┐
   │                          COMPANY                            │
   │  - Super Admin Tenant Credentials                           │
   │  - Electricity Rate (৳/unit), Commercial Profile            │
   └───────┬───────────────────────────────┬─────────────────────┘
           │ 1:N                           │ 1:N
           ▼                               ▼
   ┌───────────────┐              ┌──────────────────────────────┐
   │    GARAGE     │              │           EMPLOYEE           │
   │ - Facilities  │              │ - Role: SUPER_ADMIN / GENERAL│
   │ - Service Bays│              │ - Permissions & Garage Scopes│
   └───────┬───────┘              │ - Multiple Contact Phones    │
           │ 1:N                  │ - Attached Documents         │
           ▼                      └──────────────────────────────┘
   ┌──────────────────────────────┐
   │           CUSTOMER           │
   │ - Baseline Meter & Advance ৳ │
   │ - Present Dues               │
   │ - Multiple Contact Phones    │
   │ - Attached Documents         │
   └───────┬───────────────┬──────┘
           │ 1:N           │ 1:N
           ▼               ▼
   ┌───────────────┐ ┌────────────┐
   │   GUARANTOR   │ │ELECTRICBILL│
   │ - Relationship│ │ - Readings │
   │ - Multi-Phones│ │ - Charges  │
   │ - Documents   │ │ - Receipts │
   └───────────────┘ └────────────┘
```

### 1. Company (`companies`)
- **`id`**: Unique Identifier (UUID)
- **`companyName`**: Business / Organization Name
- **`name`**: Managing Director / Owner Full Name
- **`email`**: Unique Super Admin login email
- **`password`**: Secure `bcryptjs` hash
- **`phoneNumber`**: Corporate contact phone
- **`electricityRate`**: Default electricity tariff per unit (৳)
- **`role`**: `SUPER_ADMIN`
- **`address`**: Commercial headquarters address

### 2. Garage (`garages`)
- **`id`**: Unique Identifier (UUID)
- **`companyId`**: Foreign key to `companies.id`
- **`garageName`**: Workshop or charging station facility name
- **`address`**: Physical workshop address

### 3. Customer (`customers`)
- **`id`**, **`customerCode`**: System ID and human-readable identifier (e.g., `CUST-001`)
- **`companyId`**, **`garageId`**: Associated company and assigned garage branch
- **`name`**, **`fatherName`**, **`motherName`**, **`nidNumber`**: Identity information
- **`mobileNumber`**, **`phoneNumbers`**: Primary phone + JSON collection of `ContactPhone[]`
- **`address`**: Residential or shop facility address
- **`previousUnit`**: Initial baseline electricity meter reading
- **`advanceMoney`**: Security deposit balance (৳)
- **`presentDues`**: Cumulative outstanding bill dues (৳)
- **`documents`**: JSON collection of `AttachedDocument[]`

### 4. Guarantor (`guarantors`)
- **`id`**, **`companyId`**, **`customerId`**: Relationship links
- **`name`**, **`relationship`**, **`nidNumber`**, **`fatherName`**, **`motherName`**, **`address`**
- **`mobileNumber`**, **`phoneNumbers`**: Primary phone + JSON collection of `ContactPhone[]`
- **`documents`**: Attached ID and contract files (`AttachedDocument[]`)

### 5. Employee (`employees`)
- **`id`**, **`companyId`**: Tenant relationship
- **`name`**, **`email`**, **`password`**, **`nidNumber`**, **`address`**
- **`phoneNumber`**, **`phoneNumbers`**: Primary phone + JSON collection of `ContactPhone[]`
- **`role`**: `SUPER_ADMIN` or `GENERAL`
- **`isActive`**, **`canCreate`**, **`canEdit`**, **`canDelete`**, **`canView`**: Permission switches
- **`garageIds`**: Array of accessible garage facility IDs
- **`documents`**: Attached employment files (`AttachedDocument[]`)

### 6. Electric Bill (`electric_bills`)
- **`id`**, **`companyId`**, **`garageId`**, **`customerId`**
- **`date`**: Billing statement date
- **`previousUnit`**, **`currentUnit`**, **`totalUnit`**: Consumed electricity units
- **`unitRate`**, **`electricBill`**: Energy consumption charge (৳)
- **`previousDues`**, **`rentBill`**, **`loan`**: Secondary charges (৳)
- **`totalBill`**, **`clearMoney`**, **`presentDues`**: Payment and remaining dues
- **`note`**, **`status`**: Statement remarks and billing status

### 7. Audit Log (`audit_logs`)
- Complete historical record of administrative actions, entity mutations, logins, and deletions with timestamps, actor IDs, IP addresses, and user agents.

---

## 🏗️ Architecture & Technical Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  - MVC Controllers: Dashboard, Auth, Customer, Employee, Garage,       │
│    ElectricBill, File, AuditLog                                        │
│  - Session & Authentication: HttpOnly Secure JWT Cookies               │
│  - Multer File Interceptors & Streaming Responses                      │
│  - View Engine: Express Handlebars (hbs) with custom helpers & layout  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Commands & Queries)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                               │
│  - CQRS Commands: CreateCustomer, UpdateCustomer, CreateEmployee,      │
│    UpdateEmployee, CreateGuarantor, GenerateMonthlyBills, etc.         │
│  - CQRS Queries: GetCustomerById, GetEmployeesByCompany,               │
│    GetGuarantorsByCustomer, GetExecutiveDashboard, etc.                │
│  - Services: BillingCalculationService, AuditLogService, FileService   │
│  - AutoMapper Profiles: CustomerProfile, EmployeeProfile, etc.         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Orchestration & Rules)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                  │
│  - Pure Domain Entities: Customer, Employee, Guarantor, ElectricBill   │
│  - Interfaces & Types: AttachedDocument, ContactPhone, AuditableEntity │
│  - Repository Ports: ICustomerRepository, IGuarantorRepository, etc.   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ (Implements Ports)
┌───────────────────────────────────┴────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                              │
│  - TypeORM MySQL Persistence with automatic schema sync                │
│  - File Service: Sharp-powered progressive compression & FS management │
│  - Passport JWT Strategy, RolesGuard, PermissionsGuard                 │
│  - Internationalization Dictionary (i18n): English & Bengali           │
└────────────────────────────────────────────────────────────────────────┘
```

- **Runtime & Framework**: Node.js, NestJS 11 (Express platform)
- **Database & ORM**: MySQL 8.0, TypeORM
- **Image Processing**: `sharp` (High-performance native image compression engine)
- **Templating**: Express Handlebars (`hbs`) with custom layout engine
- **Authentication**: Passport.js, `@nestjs/jwt`, `bcryptjs`
- **Patterns**: CQRS (`@nestjs/cqrs`), AutoMapper (`@automapper/nestjs`)

---

## 📞 Multi-Phone Number Subsystem

Customers, Employees, and Guarantors can hold any number of phone numbers:
- **Phone Types**: `PERSONAL`, `WHATSAPP`, `EMERGENCY`, `WORK`, `ALTERNATIVE`
- **Validation**: At least one primary phone number is mandatory. Duplicate numbers are rejected on both client and server layers.
- **Client Features**:
  - Direct click-to-call links (`tel:+880...`).
  - One-click WhatsApp web/app launch (`https://wa.me/88...`).
  - Copy-to-clipboard buttons.
  - Interactive dynamic phone repeater partial (`views/partials/phone-repeater.hbs`).

---

## 📁 File Management & Auto-Compression Subsystem

Modeled directly after `HIS-AppointmentServicesAPI.Infrastructure.Services.FileService.cs`:

### Upload & Storage
- Uploads are directed to `public/uploads/{customers|employees|guarantors}/`.
- File names are sanitized into `<UUID>.<ext>` to eliminate file collision and protect against malicious file paths.
- Base path traversal defense validates that all physical paths reside strictly within the designated storage root.

### Progressive Under-5MB Image Compression Algorithm
- When image files (`.jpg`, `.jpeg`, `.png`, `.webp`) are uploaded, `FileService` evaluates the binary size:
  - If the file exceeds 5MB (or can be optimized), it enters a progressive quality reduction loop:
    `90%` &rarr; `80%` &rarr; `70%` &rarr; `60%` &rarr; `50%` &rarr; `40%` &rarr; `30%` &rarr; `20%` &rarr; `10%`.
  - If at `10%` quality the file still exceeds 5MB, `FileService` proportionally scales the image dimensions down until it is strictly beneath the 5MB boundary.
- Non-image files (PDFs, spreadsheets, DOCX) bypass lossy image codecs to prevent data corruption and are strictly validated against the 5MB maximum limit.

### Endpoints
| HTTP Method | Route | Description |
|---|---|---|
| `GET` | `/files/download?path=...&name=...` | Secure download setting `Content-Disposition: attachment; filename="<originalName>"` |
| `GET` | `/files/preview?path=...&name=...` | Inline browser preview setting `Content-Disposition: inline` (PDF & images) |
| `POST` | `/customers/:id/documents` | Quick-upload files to an existing customer |
| `POST` | `/customers/:id/documents/:docId/delete` | Remove customer document attachment |
| `POST` | `/customers/:id/guarantors/:guarantorId/documents` | Quick-upload files to a specific guarantor |
| `POST` | `/customers/:id/guarantors/:guarantorId/documents/:docId/delete` | Remove guarantor document attachment |
| `POST` | `/employees/:id/documents` | Quick-upload files to an existing employee |
| `POST` | `/employees/:id/documents/:docId/delete` | Remove employee document attachment |

---

## ⚙️ Configuration (`.env`)

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=egms_db

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_2026_enterprise_secure!
JWT_EXPIRES_IN=7d
```

---

## 👥 Default Demo Accounts (Auto-Seeded into MySQL)

On initial application boot, the database seeder initializes sample accounts:

| Account Type | Role | Email | Password | Description |
|---|---|---|---|---|
| **Company Admin** | `SUPER_ADMIN` | `admin@apexauto.com` | `Admin@123` | **Apex Auto Solutions Ltd.** &bull; Alexander Vance |
| **Staff Member** | `GENERAL` | `john.doe@apexauto.com` | `Employee@123` | **Johnathan Doe** &bull; NID: `1992837465012` |

---

## 🌐 Web Portal Navigation

| Route | Description |
|---|---|
| `http://localhost:3000/` | Executive Dashboard with billing metrics, KPI cards, and customer ledgers |
| `http://localhost:3000/customers` | Customer directory with search, garage filtering, and date presets |
| `http://localhost:3000/customers/new` | Customer onboarding form with initial meter reading and file upload |
| `http://localhost:3000/customers/:id` | Customer details profile with guarantor roster, documents, and bill statements |
| `http://localhost:3000/customers/:id/edit` | Edit customer profile, addresses, meter baseline, and documents |
| `http://localhost:3000/bills` | Electric bill ledger with monthly totals and receipt downloads |
| `http://localhost:3000/bills/new` | Generate electricity invoice with real-time preview calculations |
| `http://localhost:3000/garages` | Facility directory with garage-specific revenue and subscriber counts |
| `http://localhost:3000/employees` | Employee staff roster |
| `http://localhost:3000/employees/permissions` | Granular permission manager (`canCreate`, `canEdit`, `canDelete`, garage branches) |
| `http://localhost:3000/audit-logs` | Comprehensive security and activity audit log |
| `http://localhost:3000/login` | Portal login view with 1-click demo buttons |
| `http://localhost:3000/register` | Tenant self-registration view |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Run unit tests
npm test

# 4. Start the application in development mode
npm run start:dev

# 5. Start the production build
npm run start:prod
```

---

## 🧪 Testing

```bash
# Run all unit tests with Jest
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:cov
```