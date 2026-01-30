# VW NestJS Proof of Concept

A modular service built with NestJS demonstrating clean architecture patterns for complex business logic. This PoC contains, **9 domain entities** and **30+ REST endpoints** across 3 business subdomains.

> **Disclaimer**: This is a Proof of Concept. Infrastructural concerns such as transaction management, authentication, and production-grade error handling are intentional  ly simplified. Do not use this as a "perfect reference" for production code.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation & Running

```bash
# Install dependencies
npm install

# Start in development mode (with hot reload)
npm run start:dev

# Or start in production mode
npm run build
npm run start:prod
```

### Testing

```bash
# Run unit tests
npm run test
```

### Access Points

| Resource | URL |
|----------|-----|
| API Base | `http://localhost:3000` |
| Swagger Documentation | `http://localhost:3000/docs` |

---

## Business Domain Overview

> The business domain for this PoC was inspired by the **DOE user story map**.

### User Journey

This service handles the **shopping and ordering flow** for a B2B e-commerce platform:

1. **Browse & Add to Basket**  
   A user adds individual items or pre-configured bundles (discounted product packages) to their basket.

2. **Policy Validation**  
   On basket change, the system validates the basket against business policies (e.g., maximum items, minimum order value) and calculates final pricing with applicable discounts.

3. **Checkout & Quote**  
   When the user proceeds to checkout, the system captures a snapshot of the basket and pricing, creating an immutable "quote" that locks in the prices.

4. **Order Creation & Fulfillment**  
   The quote is converted into an order. The order then progresses through a fulfillment workflow: payment processing → delivery initiation → completion (or rollback on failure).

### Subdomains

| Subdomain | Responsibility |
|-----------|----------------|
| **Basket** | Shopping cart management, checkout orchestration |
| **Policy** | Business rules, pricing calculations, bundle management |
| **Order** | Quote creation, order lifecycle, fulfillment saga |

> **Note**: Delivery, Payment, and Item catalog services are external to this PoC and are represented by mock adapters.

---

## Project Structure

This service follows a **modular architecture** designed to be easily separatable into smaller microservices.

```
src/
├── _common/           # Shared utilities, base classes, infrastructure
├── basket/            # Basket subdomain
│   ├── adapters/      # Controllers (inbound) & service adapters (outbound)
│   ├── application/   # Use cases, ports (interfaces)
│   ├── domain/        # Entities, repository interfaces
│   ├── infra/         # NestJS module definition
│   └── repository/    # Repository implementations
├── policy/            # Policy subdomain (same structure)
├── order/             # Order subdomain (same structure)
└── app.module.ts      # Root module
```

### Splitting into Microservices

Each subdomain (`basket`, `policy`, `order`) is **completely isolated**. Communication between subdomains happens exclusively through **ports** (abstract interfaces) and **adapters** (concrete implementations).

**To extract a subdomain into a separate microservice:**

1. Copy the subdomain folder to a new service
2. Replace the in-process adapters with HTTP clients or event emitters
3. No changes needed to the business logic or use cases

For example, the `basket` subdomain communicates with `policy` through `PolicyServicePort`. Currently, `PolicyServiceAdapter` calls the policy use cases directly. In a microservices setup, you'd simply replace it with an HTTP adapter—the rest of the code remains unchanged.

---

## Technical Deep Dive

### Hexagonal Architecture (Ports & Adapters)

> **What is Hexagonal Architecture?**  
> A design pattern where business logic sits at the center, isolated from external concerns (databases, APIs, UI). The core defines "ports" (interfaces) for what it needs, and "adapters" implement those interfaces for specific technologies.

**Example: Policy Service Port**

```typescript
// Port: defines WHAT the basket needs from policy (abstract contract)
export abstract class PolicyServicePort {
  abstract calculateBasketPricing(basket: BasketSnapshot): Promise<BasketPricingResult>;
  abstract getBasketPolicyChecks(basket: BasketSnapshot): Promise<BasketPolicyCheckName[]>;
}
```

```typescript
// Adapter: implements HOW to fulfill the contract (calls policy use cases)
@Injectable()
export class PolicyServiceAdapter implements PolicyServicePort {
  constructor(
    private readonly pricePolicyUseCases: PricePolicyUseCases,
    private readonly basketPolicyUseCases: BasketPolicyUseCases,
  ) {}

  async calculateBasketPricing(basket: BasketSnapshot): Promise<BasketPricingResult> {
    return this.pricePolicyUseCases.calculateBasketPricing(basket);
  }
}
```

### NestJS Modules & Dependency Injection

> **What is Dependency Injection (DI)?**  
> Instead of classes creating their own dependencies, they receive them from the outside. This makes code testable (you can inject mocks) and loosely coupled (easy to swap implementations).

**NestJS modules** group related functionality and manage DI configuration:

```typescript
@Module({
  imports: [PolicyModule, OrderModule],  // Import other modules
  controllers: [BasketController],        // HTTP endpoints
  providers: [
    BasketUseCases,                        // Business logic
    {
      provide: IBasketRepository.name,     // Token (interface name)
      useClass: BasketRepositoryImplementation,  // Concrete class
    },
  ],
  exports: [BasketUseCases],              // Make available to other modules
})
export class BasketModule {}
```

**Using injected dependencies:**

```typescript
@Injectable()
export class BasketUseCases {
  constructor(
    @Inject(IBasketRepository.name)        // Inject by token
    private readonly basketRepository: IBasketRepository,
    @Inject(PolicyServicePort.name)
    private readonly policyService: PolicyServicePort,
  ) {}
}
```

### Specification Pattern

> **What is the Specification Pattern?**  
> Encapsulates business rules as composable, reusable objects. Each specification answers one question: "Does this entity satisfy this rule?"

```typescript
// Individual specifications
export class MaxItemsPerBasketSpecification extends Specification<BasketContext> {
  isSatisfiedBy(context: BasketContext): boolean {
    return context.basket.getTotalItemCount() <= 50;
  }
}

// Registry maps policy names to specifications
export const BasketSpecificationRegistry = {
  [BasketPolicyCheckName.MAX_ITEMS_PER_BASKET]: () => new MaxItemsPerBasketSpecification(),
  [BasketPolicyCheckName.MIN_ORDER_VALUE]: () => new MinOrderValueSpecification(),
};
```

---

## Why NestJS for Complex Logic?

| Aspect | Benefit |
|--------|---------|
| **First-class DI** | Clean separation of concerns, easy testing, swappable implementations |
| **Module System** | Natural boundaries between subdomains, explicit dependencies |
| **Decorator-based** | Declarative controllers, validation, and documentation |
| **TypeScript** | Strong typing catches errors at compile time |
| **Ecosystem** | Ecosystem is rich and much more supported than SAP CAP |

For services with complex business logic, such as multiple subdomains, intricate validation rules, and multi-step workflows, NestJS provides the architectural scaffolding to keep code organized and maintainable as it grows.

---

## API Endpoints Summary

### Baskets (`/baskets`)
- `GET /:userId` — Get user's basket
- `POST /:userId/items` — Add item
- `PUT /:userId/items/:itemId` — Update item quantity
- `DELETE /:userId/items/:itemId` — Remove item
- `POST /:userId/bundles` — Add bundle
- `PUT /:userId/bundles/:bundleId` — Update bundle quantity
- `DELETE /:userId/bundles/:bundleId` — Remove bundle
- `DELETE /:userId` — Clear basket
- `GET /:userId/pricing` — Get pricing breakdown
- `GET /:userId/validate` — Validate basket
- `GET /:userId/checkout/preview` — Preview checkout
- `POST /:userId/checkout` — Execute checkout

### Bundles (`/bundles`)
- `POST /` — Create bundle
- `GET /` — List all bundles
- `GET /active` — List active bundles
- `GET /:bundleId` — Get bundle details
- `PUT /:bundleId` — Update bundle
- `DELETE /:bundleId` — Delete bundle
- `POST /:bundleId/items` — Add item to bundle
- `PUT /:bundleId/items/:itemId` — Update item in bundle
- `DELETE /:bundleId/items/:itemId` — Remove item from bundle

### Orders (`/orders`)
- `GET /:orderId` — Get order
- `GET /user/:userId` — Get user's orders
- `POST /from-quote/:quoteId` — Create order from quote
- `POST /:orderId/execute-saga` — Execute fulfillment saga
- `POST /:orderId/payment` — Execute payment step
- `POST /:orderId/delivery` — Execute delivery step
- `GET /quotes/:quoteId` — Get quote details

