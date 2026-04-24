# Schema Validation System

This directory contains OOP-compliant validation schemas for request validation.

## Structure

- `base.schema.ts` - Base abstract class for all validation schemas
- `registration.schema.ts` - Validation schema for registration endpoints
- `campaign.schema.ts` - Validation schema for campaign endpoints
- `platform.schema.ts` - Validation schema for platform endpoints
- `index.ts` - Central export file for all schemas

## Usage

### 1. Creating a New Schema

```typescript
import Joi from 'joi';
import { BaseSchema } from './base.schema';

export class MySchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      field1: Joi.string().required(),
      field2: Joi.number().optional(),
      // ... other fields
    });
  }
}

// Export singleton instance
export const mySchema = new MySchema();
```

### 2. Using Validation in Controllers

```typescript
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { mySchema } from '../schemas/my.schema';

export default class MyController {
  // Static method to get validation middleware
  public static validateMyRequest = ValidationMiddleware.validate(mySchema);

  public async myMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Your controller logic here
  }
}
```

### 3. Using in Routes

```typescript
import { Router } from 'express';
import MyController from '../controllers/my.controller';

class MyRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes(): void {
    this.router.post(
      '/my-endpoint',
      MyController.validateMyRequest,
      MyController.prototype.myMethod.bind(new MyController())
    );
  }
}

export default new MyRoutes().router;
```

## Benefits

1. **OOP Compliant**: Uses inheritance and polymorphism
2. **Reusable**: Schema classes can be extended and reused
3. **Type Safe**: Full TypeScript support
4. **Centralized**: All validation logic in one place
5. **Maintainable**: Easy to update and extend validation rules

## Available Schemas

- `RegistrationSchema` - For webinar registration validation
- `CampaignSchema` - For campaign creation/update validation
- `PlatformSchema` - For platform creation/update validation 