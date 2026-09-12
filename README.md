# Company, Garage & Employee Management System - NestJS MVC

A production-grade enterprise application built with **NestJS 11**, **Clean Architecture** (Hexagonal/Ports & Adapters), **CQRS** (Command Query Responsibility Segregation), **AutoMapper**, **JWT Authentication & RBAC**, and **MySQL 8.0**. Features both a modern **Express Handlebars MVC** web portal with responsive layouts and a robust **RESTful JSON API**.

Designed adhering to enterprise Clean Architecture standards seen in high-scale .NET and Node enterprise applications (such as your HIS Microservice and HRFlamesAPI patterns).

---

## 🏛️ Domain Model & Entities

### 1. Company (`companies` Table)
Represents the business/tenant entity with **`SUPER_ADMIN`** role auto-assigned upon registration:
- **`id`**: Unique Identifier (UUID `varchar(100)`)
- **`name`**: Owner / Primary Contact Person Name
- **`companyName`**: Business / Organization Name
- **`email`**: Unique Email address (used for Super Admin authentication)
- **`password`**: Secure `bcryptjs` hash
- **`phoneNumber`**: Contact phone number
- **`role`**: `SUPER_ADMIN` (auto-assigned)
- **`address`**: Company headquarters / commercial address
- **`createdAt`**, **`updatedAt`**: Timestamps

### 2. Garage (`garages` Table)
Represents physical workshop locations and facilities owned by a Company:
- **`id`**: Unique Identifier (UUID `varchar(100)`)
- **`companyId`**: Foreign Key linking to `companies.id` (`ON DELETE CASCADE`)
- **`garageName`**: Name of the workshop/garage facility
- **`address`**: Physical facility address
- **`createdAt`**, **`updatedAt`**: Timestamps

### 3. Employee (`employees` Table)
Represents personnel and technicians connected to a Company:
- **`id`**: Unique Identifier (UUID `varchar(100)`)
- **`companyId`**: Foreign Key linking to `companies.id` (`ON DELETE CASCADE`)
- **`name`**: Employee Full Name
- **`address`**: Residential Address
- **`email`**: Unique Email address (used for Employee authentication)
- **`password`**: Secure `bcryptjs` hash
- **`phoneNumber`**: Employee phone number
- **`role`**: `GENERAL` (Default role)
- **`nidNumber`**: National ID Number (Unique index)
- **`createdAt`**, **`updatedAt`**: Timestamps

---

## 🏗️ Architecture Overview

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 PRESENTATION LAYER (MVC)                │
                  │   - MVC Controllers: DashboardController, AuthController,│
                  │     GarageController, EmployeeController                │
                  │   - Session & Auth: HttpOnly Secure JWT Cookies         │
                  │   - View Engine: Express Handlebars (hbs)               │
                  └───────────────────────────┬─────────────────────────────┘

                                              │ (dispatches Commands & Queries)
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                 APPLICATION LAYER                       │
                  │   - CQRS Commands: RegisterCompany, CreateGarage,       │
                  │     CreateEmployee, Login                               │
                  │   - CQRS Queries: GetCompanyById, GetGaragesByCompany,  │
                  │     GetEmployeesByCompany, GetDashboardStats            │
                  │   - AutoMapper Profiles: CompanyProfile, GarageProfile, │
                  │     EmployeeProfile                                     │
                  └───────────────────────────┬─────────────────────────────┘
                                              │ (orchestrates)
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                   DOMAIN LAYER                          │
                  │   - Pure Entities: Company, Garage, Employee            │
                  │   - Ports: ICompanyRepository, IGarageRepository,        │
                  │     IEmployeeRepository                                 │
                  └───────────────────────────▲─────────────────────────────┘
                                              │ (implements ports)
                  ┌───────────────────────────┴─────────────────────────────┐
                  │                INFRASTRUCTURE LAYER                     │
                  │   - TypeORM MySQL Repositories (with Auto-Seeder)       │
                  │   - Passport JWT Strategy, Guards, & Decorators         │
                  │   - Logging Interceptor & Unified Exception Filter      │
                  └─────────────────────────────────────────────────────────┘
```

## 📦 Base Architecture Patterns (Modeled after InventoryAndPOSAPI)

### 1. `AuditableEntity` (Domain Base) & `BaseAuditableOrmEntity` (TypeORM Base)
Every persistent entity inherits standard audit stamps and lifecycle properties:
- **`isActive`**: Active/inactive flag (`boolean`, default: `true`).
- **`isDeleted`**: Soft deletion flag (`boolean`, default: `false`).
- **`createdBy`**: Creator stamp in `"{id}|{role}"` format (e.g., `comp-apex-001|SUPER_ADMIN` or `SYSTEM|SEEDER`).
- **`editByName`**: Modifier stamp in `"{id}|{role}"` format.
- **`deletedBy`**: Deleter stamp upon soft deletion.
- **`createdDate`**: Timestamp of record creation.
- **`modifiedDate`**: Timestamp of record modification.
- **`deletedDate`**: Timestamp when soft-deleted.

### 2. `IGenericRepository<T>` & `GenericTypeOrmRepository<TDomain, TOrm>`
Provides standardized, reusable repository capabilities with automatic soft-deletion filtering:
- `getAllAsync(options?: QueryOptions): Promise<T[]>`
- `getByIdAsync(id: string, relations?: string[]): Promise<T | null>`
- `getFirstOrDefaultAsync(filter: Record<string, any>, relations?: string[]): Promise<T | null>`
- `addAsync(entity: T): Promise<T>`
- `updateAsync(entity: T): Promise<T>`
- `deleteAsync(id: string): Promise<boolean>`
- `softDeleteAsync(id: string, deletedByStamp?: string): Promise<boolean>`
- `existsAsync(filter: Record<string, any>): Promise<boolean>`
- `countAsync(filter?: Record<string, any>): Promise<number>`
- `getPagedAsync(page: number, pageSize: number, options?: QueryOptions): Promise<PagedResult<T>>`
- Compatibility aliases: `findById`, `findAll`, `save`, `count`, `delete`

---

## ⚙️ Environment Configuration (`.env`)


```env
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=pandaKnight009
DB_DATABASE=egms_db

# JWT Authentication
JWT_SECRET=super_secret_jwt_egms_key_2026_enterprise_secure!
JWT_EXPIRES_IN=7d
```

---

## 👥 Default Demo Accounts (Auto-Seeded into MySQL)

On application startup, the sequential seeder initializes the database with demo accounts:

| Entity | Role | Email | Password | Details |
|---|---|---|---|---|
| **Company** | `SUPER_ADMIN` | `admin@apexauto.com` | `Admin@123` | **Apex Auto Solutions Ltd.** &bull; Alexander Vance |
| **Garage** | &mdash; | &mdash; | &mdash; | **Apex Central Workshop & Diagnostic Garage** (Bay 12) |
| **Employee** | `GENERAL` | `john.doe@apexauto.com` | `Employee@123` | **Johnathan Doe** &bull; NID: `1992837465012` |

---

## 🌐 Application Endpoints

### 🖥️ Web MVC Portal (Browser)
| URL | Description |
|---|---|
| `http://localhost:3000/` | Dashboard displaying Company details, KPI stats, Garages, and Employees |
| `http://localhost:3000/garages` | Garages directory |
| `http://localhost:3000/garages/new` | Register a new garage facility (`SUPER_ADMIN` only) |
| `http://localhost:3000/employees` | Employee roster directory |
| `http://localhost:3000/employees/new` | Add new employee with NID number (`SUPER_ADMIN` only) |
| `http://localhost:3000/login` | Sign In view (supports 1-click demo login buttons) |
| `http://localhost:3000/register` | Register new Company (auto-creates Super Admin & optional garage) |
| `http://localhost:3000/logout` | Clears cookie session |


---


## 🚀 Running the Project

```bash
# 1. Build TypeScript code
npm run build

# 2. Run unit tests
npm test

# 3. Start development server in watch mode
npm run start:dev
```