/**
 * Generic repository port interface
 */
export abstract class IRepository<T, ID = string> {
  abstract findById(id: ID): Promise<T | null>;
  abstract save(entity: T): Promise<T>;
  abstract delete(id: ID): Promise<void>;
}
