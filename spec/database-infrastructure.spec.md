# Database and Infrastructure Specification

## 1. Scope

This specification defines backend database, Redis, cache, repository helper, and shared infrastructure behavior implemented under `packages/backend/src`.

## 2. TypeORM Data Source

The backend SHALL create one TypeORM `DataSource` named `AppDataSource`.

Connection options:

| Option           | Value                                         |
| ---------------- | --------------------------------------------- |
| `type`           | `mariadb`                                     |
| `host`           | `config.db.host`                              |
| `port`           | `config.db.port`                              |
| `username`       | `config.db.user`                              |
| `password`       | `config.db.password`                          |
| `database`       | `config.db.database`                          |
| `synchronize`    | `true`                                        |
| `logging`        | `false`                                       |
| `entities`       | `path.join(__dirname, '/entities/*.{ts,js}')` |
| `namingStrategy` | `new SnakeNamingStrategy()`                   |
| `subscribers`    | `[]`                                          |
| `migrations`     | `[]`                                          |

The backend currently uses TypeORM schema synchronization. No tracked migration array is configured in this data source.

## 3. Base Entity Transactions

`BaseEntity.transaction(runInTransaction)` SHALL call `this.getRepository().manager.transaction(runInTransaction)` and return the callback result.

## 4. Chroma Data Source

The backend SHALL create one `ChromaClient` named `ChromaDataSource` at module load time.

Client options:

| Option     | Value                |
| ---------- | -------------------- |
| `ssl`      | `config.chroma.ssl`  |
| `host`     | `config.chroma.host` |
| `port`     | `config.chroma.port` |
| `tenant`   | `default_tenant`     |
| `database` | `default_database`   |

The client is constructed even when `config.chroma.enable=false`. Feature services decide whether to read or write Chroma based on `config.chroma.enable`.

## 5. Redis Client

The backend SHALL create one ioredis client named `redisClient`.

Client options:

| Option      | Value                          |
| ----------- | ------------------------------ |
| `host`      | `config.redis.host`            |
| `port`      | `config.redis.port`            |
| `password`  | `config.redis.password`        |
| `keyPrefix` | `config.redis.keyPrefix + ':'` |

When `config.redis.keyPrefix` is the empty string, the effective ioredis key prefix is `:`. A direct Redis write using logical key `example` creates or reads physical key `:example`, not physical key `example`.

The client SHALL log an info message on `connect`.

The client SHALL log an error message with field `err` on `error`.

## 6. Cacheable Decorator

`Cacheable(ttlSeconds, keyGenerator, EntityClass?)` SHALL wrap an async method.

Behavior:

1. If any method argument is an `EntityManager`, call the original method and bypass Redis read and write.
2. Compute `cacheKey = keyGenerator(...args)`.
3. Attempt `redisClient.get(cacheKey)`.
4. If a cached string exists, parse it as JSON.
5. If `EntityClass` exists, return `plainToInstance(EntityClass, parsedResult)`.
6. If `EntityClass` is absent, return the parsed result.
7. If Redis read or JSON parse throws, log the error and continue to the original method.
8. Call the original method.
9. If the original result is truthy, write it as JSON with `EX ttlSeconds`.
10. Redis write failures are not awaited by the caller and do not change the method return value.

Falsy original results are not cached.

## 7. CacheEvict Decorator

`CacheEvict(keyGenerator)` SHALL wrap an async method.

Behavior:

1. Call the original method first.
2. Compute `rawKeys = keyGenerator(...args)`.
3. If `rawKeys` is a string, delete that one key.
4. If `rawKeys` is an array, delete every key in the array with one Redis `del` call.
5. If key deletion succeeds, log deleted keys at debug level.
6. If key deletion throws, log the error and still return the original method result.

## 8. Repository Helper

`getServiceRepository(entity, manager?)` SHALL return `manager.getRepository(entity)` when `manager` exists; otherwise it SHALL return `entity.getRepository()`.

`createServiceEntity(entity, data, manager?)` SHALL create an entity through `getServiceRepository`.

`findOneServiceEntity(entity, options, manager?)` SHALL call `findOne(options)` through `getServiceRepository`.

`findServiceEntities(entity, options, manager?)` SHALL call `find(options)` through `getServiceRepository`.

`saveServiceEntity(entity, value, manager?)` SHALL call `save(value)` through `getServiceRepository`.

## 9. Duplicate Key Helpers

`isDuplicateKeyError(error)` SHALL return true when any of these conditions are true:

1. `error.code === 'ER_DUP_ENTRY'`.
2. `error.errno === 1062`.
3. `error.driverError.code === 'ER_DUP_ENTRY'`.
4. `error.driverError.errno === 1062`.

`retryOnDuplicateKey(operation, attempts=3)` SHALL:

1. Normalize `maxAttempts = max(1, attempts)`.
2. Call `operation()` at most `maxAttempts` times.
3. Retry only when the thrown error satisfies `isDuplicateKeyError(error)` and the current attempt is not the last attempt.
4. Rethrow the last error when the error is not a duplicate-key error or no attempts remain.

## 10. Error Reason Normalization

`normalizeErrorReason(input)` SHALL:

1. Use `input.message` when `input` is an `Error`.
2. Otherwise use `String(input ?? '')`.
3. Replace every whitespace sequence with one ASCII space.
4. Trim leading and trailing whitespace.
5. Use `Unknown error` when the result is empty.
6. Return the result unchanged when its length is at most 80 characters.
7. Return the first 77 characters followed by `...` when its length is greater than 80 characters.

## 11. Hashed Content Helper

`saveHashedContent(options)` SHALL:

1. Compute SHA-256 hex hash over `options.content`.
2. Load an existing entity by `options.id` with pessimistic write lock.
3. Use `options.isUnchanged(entity, hash)` when provided; otherwise compare `entity.contentHash === hash`.
4. If `forceUpdate` is not true and an existing entity is unchanged, return `{ skipped: true, entity }` without saving.
5. Merge `options.defaults` only for newly created rows.
6. Merge `options.incomingData`, `id`, `content`, and `contentHash` into the entity.
7. Save the entity and return `{ skipped: false, entity }`.

## 12. File Locations

- TypeORM and Chroma: `packages/backend/src/data-source.ts`
- Redis client: `packages/backend/src/lib/redis.ts`
- Cache decorators: `packages/backend/src/decorators/cacheable.ts`, `packages/backend/src/decorators/cache-evict.ts`
- Repository helper: `packages/backend/src/services/helpers/repository.helper.ts`
- Hashed content helper: `packages/backend/src/services/helpers/hashed-content.helper.ts`
- DB error helpers: `packages/backend/src/utils/db-errors.ts`
- Error reason helper: `packages/backend/src/utils/error-reason.ts`
