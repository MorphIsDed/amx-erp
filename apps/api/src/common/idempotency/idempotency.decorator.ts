import { IdempotencyService } from './idempotency.service';

/**
 * Decorator to make an event handler or method idempotent.
 * Requires the class to have an `idempotencyService` property.
 *
 * @param keyExtractor A function that extracts the unique key from the method arguments.
 */
export function Idempotent(keyExtractor: (...args: any[]) => string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Expect the class to have the service injected
      const idempotencyService: IdempotencyService = this.idempotencyService;

      if (!idempotencyService) {
        console.warn(
          `[Idempotency] IdempotencyService not injected in ${target.constructor.name}. Skipping idempotency check.`,
        );
        return originalMethod.apply(this, args);
      }

      const key = keyExtractor(...args);

      if (!key) {
        return originalMethod.apply(this, args);
      }

      const isIdempotent = await idempotencyService.isIdempotent(key);
      if (!isIdempotent) {
        console.log(
          `[Idempotency] Skipping duplicate execution for key: ${key}`,
        );
        return; // Skip execution
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
