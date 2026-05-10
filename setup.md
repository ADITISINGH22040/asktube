# NestJS Backend Repository Setup Guide

A comprehensive guide to set up a minimal NestJS backend with Sequelize, PostgreSQL, and Docker. This guide creates a simple Users CRUD API following production-ready patterns.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Step 1: Initialize Project](#step-1-initialize-project)
4. [Step 2: Configuration Files](#step-2-configuration-files)
5. [Step 3: Docker Setup](#step-3-docker-setup)
6. [Step 4: Source Code Structure](#step-4-source-code-structure)
7. [Step 5: Database Configuration](#step-5-database-configuration)
8. [Step 6: Users Module (CRUD)](#step-6-users-module-crud)
9. [Step 7: App Module and Entry Point](#step-7-app-module-and-entry-point)
10. [Step 8: Migrations](#step-8-migrations)
11. [Step 9: Testing Setup](#step-9-testing-setup)
12. [Step 10: Running the Application](#step-10-running-the-application)
13. [API Reference](#api-reference)

---

## Prerequisites

- Node.js >= 20
- npm >= 9
- Docker and Docker Compose
- Git

---

## Project Structure

```
my-service/
├── src/
│   ├── config/
│   │   ├── app.conf.ts          # Config factories (httpConfig, dbConfig)
│   │   └── env.conf.ts          # DATABASE_URL parsing utility
│   ├── common/
│   │   ├── models/
│   │   │   ├── index.ts         # Barrel export for all models
│   │   │   └── user.model.ts    # User Sequelize model
│   │   ├── db/
│   │   │   ├── attributes.ts    # DB constants (DATABASE_URL, DATABASE_SCHEMA)
│   │   │   └── transaction-helper.ts  # Transaction wrapper utility
│   │   └── errors/
│   │       └── custom.error.ts  # Base custom error class
│   └── modules/
│       ├── app/
│       │   └── app.module.ts    # Root application module
│       ├── database/
│       │   └── database.module.ts  # Sequelize database module
│       ├── health/
│       │   ├── health.module.ts
│       │   └── health.controller.ts
│       └── users/
│           ├── users.module.ts
│           ├── users.controller.ts
│           ├── users.service.ts
│           ├── users.repository.ts
│           ├── types/
│           │   └── users.dtos.ts
│           └── errors/
│               └── user-not-found.error.ts
├── migrations/
│   └── dummy.ts                 # Migration template
├── tests/
│   ├── jest/
│   │   ├── globalSetup.ts
│   │   ├── globalTeardown.ts
│   │   └── setupEnvVars.ts
│   └── setup.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .dockerignore
├── .env.example
├── .env                         # Local environment (gitignored)
├── Dockerfile
└── docker-compose.yml
```

---

## Step 1: Initialize Project

### 1.1 Create project directory

```bash
mkdir my-service && cd my-service
git init
```

### 1.2 Create package.json

```json
{
  "name": "my-service",
  "version": "1.0.0",
  "description": "NestJS backend service with Sequelize and PostgreSQL",
  "private": true,
  "author": "Your Name",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "rm -rf dist && nest build",
    "format": "prettier --write \"{src,tests,migrations}/**/*.{ts,js,json}\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/src/main",
    "check-types": "tsc --noemit",
    "lint": "eslint \"{src,tests,migrations}/**/*.ts\" && npm run check-types",
    "test": "jest --forceExit --coverage --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:unit": "npm run test -- --selectProjects unit",
    "test:integration": "npm run test -- --selectProjects integration",
    "migrations": "npx sequelize-cli db:migrate",
    "migrations:undo": "npx sequelize-cli db:migrate:undo",
    "migrations:create": "cp migrations/dummy.ts migrations/`date '+%Y%m%d%H%M%S'`-${npm_config_name:-migration}.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.9",
    "@nestjs/config": "^3.2.2",
    "@nestjs/core": "^10.3.9",
    "@nestjs/platform-express": "^10.4.20",
    "@nestjs/sequelize": "^10.0.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.3",
    "dotenv": "^16.4.5",
    "pg": "^8.13.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "sequelize": "^6.37.7",
    "sequelize-typescript": "^2.1.6"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.14",
    "@nestjs/schematics": "^10.1.1",
    "@nestjs/testing": "^10.3.9",
    "@tsconfig/node20": "^20.1.4",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.14.0",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "jest": "^29.7.0",
    "prettier": "^3.3.2",
    "sequelize-cli": "^6.6.2",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.4",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.5"
  }
}
```

### 1.3 Install dependencies

```bash
npm install
```

---

## Step 2: Configuration Files

### 2.1 tsconfig.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "baseUrl": "./",
    "incremental": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "typeRoots": ["node_modules/@types"],
    "allowJs": true,
    "strictPropertyInitialization": false,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*", "migrations/**/*", "tests/**/*"]
}
```

### 2.2 tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["tests", "**/*spec.ts"]
}
```

### 2.3 nest-cli.json

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "watchAssets": true
  }
}
```

### 2.4 .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

### 2.5 .prettierrc

```json
{
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "bracketSpacing": false,
  "arrowParens": "always"
}
```

### 2.6 jest.config.js

```javascript
const common = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1'
  },

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },

  globalSetup: './tests/jest/globalSetup.ts',
  globalTeardown: './tests/jest/globalTeardown.ts',

  clearMocks: true,
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  setupFiles: ['./tests/jest/setupEnvVars.ts'],
  transformIgnorePatterns: ['/node_modules/', 'dist/']
};

const unit = {
  ...common,
  displayName: 'unit',
  testMatch: ['**/*.spec.[jt]s']
};

const integration = {
  ...common,
  displayName: 'integration',
  testMatch: ['**/*.e2e-spec.[jt]s']
};

module.exports = {
  maxWorkers: 4,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  testTimeout: 20000,
  forceExit: true,
  detectOpenHandles: true,
  testEnvironment: 'node',
  projects: [integration, unit]
};
```

### 2.7 .env.example

```bash
# Application
NODE_ENV=development
PORT=3000

# Database URL with schema as query parameter
DATABASE_URL="postgresql://user:password@127.0.0.1:5432/my_service_db?schema=public"

# Test database
TEST_DATABASE_URL="postgresql://user:password@127.0.0.1:5432/my_service_db?schema=test"

# Database pool size
DATABASE_POOL_SIZE=5
```

### 2.8 .gitignore

```
# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage
*.lcov

# Dependencies
node_modules/

# TypeScript
*.tsbuildinfo
dist

# dotenv
.env
.env.test

# IDE
.idea
.vscode/launch.json
*.DS_Store

# Test reports
results/
```

---

## Step 3: Docker Setup

### 3.1 docker-compose.yml

```yaml
version: '3'
name: my-service
services:
  postgres:
    image: postgres:15
    ports:
      - 5432:5432
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=my_service_db

volumes:
  postgres-data:
```

### 3.2 Dockerfile

```dockerfile
FROM node:20-slim AS buildContainer

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

WORKDIR /install

COPY package*.json tsconfig.json ./

RUN npm ci --no-progress

COPY . .

ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM node:20-slim AS final

ENV NODE_ENV=production

WORKDIR /usr/src/app

USER node

COPY --from=buildContainer --chown=node:node /install/dist ./
COPY --from=buildContainer --chown=node:node /install/node_modules ./node_modules

CMD ["node", "src/main.js"]
```

### 3.3 .dockerignore

```
.vscode
.idea
/node_modules

.eslintrc.js
.eslintignore
.editorconfig
.prettierrc

jest.config.js

Dockerfile
docker-compose.yml
```

---

## Step 4: Source Code Structure

### 4.1 src/config/env.conf.ts

```typescript
import 'dotenv/config';

export function parseDbUrl(urlString: string | undefined): { url: string; schema: string } {
  if (!urlString) {
    throw new Error('DATABASE_URL is required');
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err);
    throw err;
  }

  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  return { url: url.href, schema };
}
```

### 4.2 src/config/app.conf.ts

```typescript
export interface HttpConfig {
  port: number;
}

export interface DatabaseConfig {
  url: string;
  schema: string;
  poolSize: number;
}

export function httpConfig(): HttpConfig {
  return {
    port: Number(process.env.PORT) || 3000
  };
}

export function databaseConfig(): DatabaseConfig {
  const dbUrl = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_DATABASE_URL 
    : process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL or TEST_DATABASE_URL is required');
  }

  const url = new URL(dbUrl);
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  return {
    url: url.href,
    schema,
    poolSize: Number(process.env.DATABASE_POOL_SIZE) || 5
  };
}
```

### 4.3 src/common/db/attributes.ts

```typescript
import 'dotenv/config';

function getDbUrl(): string | undefined {
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
}

export const DATABASE_URL = getDbUrl();

export const DATABASE_SCHEMA = DATABASE_URL
  ? new URL(DATABASE_URL).searchParams.get('schema') ?? 'public'
  : 'public';
```

### 4.4 src/common/db/transaction-helper.ts

```typescript
import { Sequelize, Transaction } from 'sequelize';

export async function withTransaction<T>(
  sequelize: Sequelize,
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 4.5 src/common/errors/custom.error.ts

```typescript
export abstract class CustomHttpError extends Error {
  statusCode: number = 500;
  message: string = 'Internal Server Error';
  errorData?: any;

  protected constructor() {
    super();
  }
}
```

### 4.6 src/common/models/user.model.ts

```typescript
import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  modelName: 'User',
  underscored: true,
  timestamps: true
})
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    comment: 'Primary key - UUID'
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
    comment: 'User full name'
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    field: 'email',
    comment: 'User email address'
  })
  declare email: string;

  @Column({
    type: DataType.DATE(3),
    allowNull: true,
    field: 'deleted_at',
    comment: 'Soft delete timestamp'
  })
  declare deletedAt: Date | null;

  @Column({
    type: DataType.DATE(3),
    allowNull: false,
    field: 'created_at',
    comment: 'Record creation timestamp'
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE(3),
    allowNull: false,
    field: 'updated_at',
    comment: 'Record last update timestamp'
  })
  declare updatedAt: Date;
}
```

### 4.7 src/common/models/index.ts

```typescript
export { User } from './user.model';
```

---

## Step 5: Database Configuration

### 5.1 src/modules/database/database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as models from '../../common/models';
import { DatabaseConfig } from '../../config/app.conf';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService): SequelizeModuleOptions => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database');
        const modelsArray = Object.values(models);

        return {
          uri: dbConfig.url,
          dialect: 'postgres',
          autoLoadModels: true,
          synchronize: false,
          models: modelsArray,
          pool: {
            max: dbConfig.poolSize,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          logging: process.env.NODE_ENV === 'development' ? console.log : false
        };
      },
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {
  constructor(private readonly sequelize: Sequelize) {}
}
```

---

## Step 6: Users Module (CRUD)

### 6.1 src/modules/users/types/users.dtos.ts

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersFilters {
  limit: number;
  offset: number;
  search?: string;
}

export interface ListUsersResponse {
  users: UserResponseDto[];
  pageInfo: {
    totalRows: number;
    itemsPerPage: number;
    offset: number;
  };
}
```

### 6.2 src/modules/users/errors/user-not-found.error.ts

```typescript
import { CustomHttpError } from 'src/common/errors/custom.error';

export class UserNotFoundError extends CustomHttpError {
  constructor(userId?: string) {
    super();
    this.message = userId ? `User with ID ${userId} not found` : 'User not found';
    this.statusCode = 404;
  }
}
```

### 6.3 src/modules/users/errors/user-already-exists.error.ts

```typescript
import { CustomHttpError } from 'src/common/errors/custom.error';

export class UserAlreadyExistsError extends CustomHttpError {
  constructor(email: string) {
    super();
    this.message = `User with email ${email} already exists`;
    this.statusCode = 409;
  }
}
```

### 6.4 src/modules/users/users.repository.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Optional } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { withTransaction } from 'src/common/db/transaction-helper';
import { User } from 'src/common/models/user.model';
import { ListUsersFilters } from './types/users.dtos';

@Injectable()
export class UsersRepository {
  private readonly attributes: string[] = [
    'id',
    'name',
    'email',
    'deletedAt',
    'createdAt',
    'updatedAt'
  ];

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize
  ) {}

  async findAll(filters: ListUsersFilters): Promise<{ users: User[]; totalCount: number }> {
    return withTransaction<{ users: User[]; totalCount: number }>(
      this.sequelize,
      async (transaction) => {
        const whereClause: any = {
          deletedAt: null,
          ...(filters.search && {
            [Op.or]: [
              { name: { [Op.iLike]: `%${filters.search}%` } },
              { email: { [Op.iLike]: `%${filters.search}%` } }
            ]
          })
        };

        const users = await this.userModel.findAll({
          where: whereClause,
          attributes: this.attributes,
          limit: filters.limit,
          offset: filters.offset,
          order: [['createdAt', 'DESC']],
          transaction
        });

        const totalCount = await this.userModel.count({
          where: whereClause,
          transaction
        });

        return { users, totalCount };
      }
    );
  }

  async create(values: Optional<User, any>): Promise<User> {
    return this.userModel.create(values, { raw: true });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { id, deletedAt: null },
      attributes: this.attributes
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email, deletedAt: null },
      attributes: this.attributes
    });
  }

  async updateById(id: string, data: Partial<User>): Promise<User | null> {
    return withTransaction<User | null>(this.sequelize, async (transaction) => {
      const user = await this.userModel.findOne({
        where: { id, deletedAt: null },
        transaction
      });

      if (!user) {
        return null;
      }

      const updatedUser = await user.update(data, { transaction, returning: true });
      return updatedUser;
    });
  }

  async softDelete(id: string): Promise<boolean> {
    return withTransaction<boolean>(this.sequelize, async (transaction) => {
      const [affectedRows] = await this.userModel.update(
        { deletedAt: new Date() },
        { where: { id, deletedAt: null }, transaction }
      );
      return affectedRows > 0;
    });
  }
}
```

### 6.5 src/modules/users/users.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/common/models/user.model';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';
import { UserNotFoundError } from './errors/user-not-found.error';
import {
  CreateUserDto,
  ListUsersFilters,
  ListUsersResponse,
  UpdateUserDto,
  UserResponseDto
} from './types/users.dtos';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async listUsers(filters: ListUsersFilters): Promise<ListUsersResponse> {
    const response = await this.usersRepository.findAll(filters);

    if (!response?.users?.length) {
      return {
        users: [],
        pageInfo: {
          totalRows: 0,
          itemsPerPage: filters.limit,
          offset: filters.offset
        }
      };
    }

    const users = response.users.map((user) => this.toResponseDto(user));

    return {
      users,
      pageInfo: {
        totalRows: response.totalCount,
        itemsPerPage: filters.limit,
        offset: filters.offset
      }
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.create({
        id: uuidv4(),
        name: dto.name,
        email: dto.email,
        deletedAt: null
      });

      return this.toResponseDto(user);
    } catch (error: any) {
      if (error instanceof UniqueConstraintError) {
        throw new UserAlreadyExistsError(dto.email);
      }
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return this.toResponseDto(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.updateById(id, dto);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return this.toResponseDto(user);
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.usersRepository.softDelete(id);

    if (!deleted) {
      throw new UserNotFoundError(id);
    }
  }

  private toResponseDto(user: User): UserResponseDto {
    const json = user.toJSON ? user.toJSON() : user;
    return {
      id: json.id,
      name: json.name,
      email: json.email,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };
  }
}
```

### 6.6 src/modules/users/users.controller.ts

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateUserDto, ListUsersResponse, UpdateUserDto, UserResponseDto } from './types/users.dtos';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  async listUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string
  ): Promise<ListUsersResponse> {
    return this.usersService.listUsers({
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
      search
    });
  }

  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
```

### 6.7 src/modules/users/users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/common/models/user.model';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

---

## Step 7: App Module and Entry Point

### 7.1 src/modules/health/health.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

### 7.2 src/modules/health/health.module.ts

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController]
})
export class HealthModule {}
```

### 7.3 src/modules/app/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, httpConfig } from '../../config/app.conf';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../health/health.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({ http: httpConfig() }),
        () => ({ database: databaseConfig() })
      ]
    }),
    DatabaseModule,
    HealthModule,
    UsersModule
  ]
})
export class AppModule {}
```

### 7.4 src/main.ts

```typescript
import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpConfig } from './config/app.conf';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.disable('etag');
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const httpConfig = configService.getOrThrow<HttpConfig>('http');

  await app.listen(httpConfig.port, () => {
    console.log(`Application listening on port ${httpConfig.port}`);
  });
}

bootstrap();
```

---

## Step 8: Migrations

### 8.1 migrations/dummy.ts (Template)

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Add your migration here
  });
};

const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Add your rollback here
  });
};

export { up, down };
```

### 8.2 migrations/20240101000000-create-users-table.ts

Create your first migration for the users table:

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          comment: 'Primary key - UUID'
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: 'User full name'
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          comment: 'User email address'
        },
        deleted_at: {
          type: DataTypes.DATE(3),
          allowNull: true,
          comment: 'Soft delete timestamp'
        },
        created_at: {
          type: DataTypes.DATE(3),
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Record creation timestamp'
        },
        updated_at: {
          type: DataTypes.DATE(3),
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Record last update timestamp'
        }
      },
      { transaction }
    );

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique_idx',
      unique: true,
      where: { deleted_at: null },
      transaction
    });
  });
};

const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('users', { transaction });
  });
};

export { up, down };
```

### 8.3 .sequelizerc

Create this file at the project root for Sequelize CLI configuration:

```javascript
const path = require('path');

module.exports = {
  config: path.resolve('dist', 'config', 'database.js'),
  'migrations-path': path.resolve('dist', 'migrations'),
  'seeders-path': path.resolve('dist', 'seeders')
};
```

### 8.4 src/config/database.ts (for Sequelize CLI)

```typescript
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

const url = new URL(dbUrl);
url.searchParams.delete('schema');

module.exports = {
  development: {
    url: url.href,
    dialect: 'postgres'
  },
  test: {
    url: process.env.TEST_DATABASE_URL?.replace(/\?schema=.*/, '') || url.href,
    dialect: 'postgres'
  },
  production: {
    url: url.href,
    dialect: 'postgres'
  }
};
```

---

## Step 9: Testing Setup

### 9.1 tests/jest/setupEnvVars.ts

```typescript
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

process.env.NODE_ENV = 'test';
```

### 9.2 tests/jest/globalSetup.ts

```typescript
export default async function globalSetup() {
  console.log('\nGlobal test setup started...');
}
```

### 9.3 tests/jest/globalTeardown.ts

```typescript
export default async function globalTeardown() {
  console.log('\nGlobal test teardown completed.');
}
```

### 9.4 tests/setup.ts

```typescript
import 'reflect-metadata';

jest.setTimeout(30000);

beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});
```

### 9.5 Example Unit Test: src/modules/users/users.service.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/common/models/user.model';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: function () {
      return this;
    }
  } as unknown as User;

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UserNotFoundError when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow(
        UserNotFoundError
      );
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      repository.create.mockResolvedValue(mockUser);

      const result = await service.createUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      repository.softDelete.mockResolvedValue(true);

      await expect(service.deleteUser(mockUser.id)).resolves.not.toThrow();
    });

    it('should throw UserNotFoundError when user not found', async () => {
      repository.softDelete.mockResolvedValue(false);

      await expect(service.deleteUser('non-existent-id')).rejects.toThrow(
        UserNotFoundError
      );
    });
  });
});
```

---

## Step 10: Running the Application

### 10.1 Start PostgreSQL

```bash
docker-compose up -d
```

### 10.2 Create .env file

```bash
cp .env.example .env
# Edit .env with your local settings if needed
```

### 10.3 Build and run migrations

```bash
npm run build
npm run migrations
```

### 10.4 Start the application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 10.5 Run tests

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

---

## API Reference

### Health Check

```
GET /health

Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

### Users

#### Create User

```
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

Response (201):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### List Users

```
GET /users?limit=20&offset=0&search=john

Response (200):
{
  "users": [...],
  "pageInfo": {
    "totalRows": 100,
    "itemsPerPage": 20,
    "offset": 0
  }
}
```

#### Get User by ID

```
GET /users/:id

Response (200):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update User

```
PATCH /users/:id
Content-Type: application/json

{
  "name": "Jane Doe"
}

Response (200):
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.001Z"
}
```

#### Delete User

```
DELETE /users/:id

Response (204): No Content
```

---

## Quick Setup Commands

Run these commands in order to set up the project from scratch:

```bash
# 1. Create project directory
mkdir my-service && cd my-service
git init

# 2. Create all files as documented above

# 3. Install dependencies
npm install

# 4. Start PostgreSQL
docker-compose up -d

# 5. Create .env
cp .env.example .env

# 6. Build and run migrations
npm run build
npm run migrations

# 7. Start development server
npm run start:dev

# 8. Test the API
curl http://localhost:3000/health
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

---

## Directory Creation Commands

```bash
# Create all directories
mkdir -p src/config
mkdir -p src/common/models
mkdir -p src/common/db
mkdir -p src/common/errors
mkdir -p src/modules/app
mkdir -p src/modules/database
mkdir -p src/modules/health
mkdir -p src/modules/users/types
mkdir -p src/modules/users/errors
mkdir -p migrations
mkdir -p tests/jest
```

---

## Notes

1. **Database Schema**: This guide uses the `public` schema. Modify `DATABASE_URL` query parameter if you need a different schema.

2. **Soft Deletes**: Users are soft-deleted using the `deletedAt` column. All queries filter out soft-deleted records.

3. **Validation**: Uses `class-validator` for DTO validation. The `ValidationPipe` is configured globally.

4. **Transactions**: Repository methods use the `withTransaction` helper for write operations.

5. **Error Handling**: Custom errors extend `CustomHttpError`. Add a global exception filter for production use.

6. **Migrations**: Use the migration template pattern. Always wrap changes in transactions.

7. **Testing**: Unit tests mock the repository layer. Integration tests should use a separate test database.