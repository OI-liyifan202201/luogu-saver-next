# Censorship System Specification

## 1. Scope

This specification defines backend content safety review behavior for articles and pastes.

The censorship system stores LLM-produced review records. It exposes the latest public-safe result for one target through `/censorship/query/:type/:id`.

## 2. Entity

Table name: `censorship`.

| Column                 | Type        | Constraints | Description                          |
| ---------------------- | ----------- | ----------- | ------------------------------------ |
| `id`                   | INT         | PRIMARY KEY | Auto-generated review row ID         |
| `type`                 | VARCHAR     | NOT NULL    | `article` or `paste`                 |
| `target_id`            | VARCHAR(8)  | NOT NULL    | Reviewed article ID or paste ID      |
| `rating`               | INT         | NOT NULL    | LLM risk score                       |
| `category`             | VARCHAR(50) | NOT NULL    | LLM primary category                 |
| `reason`               | TEXT        | NOT NULL    | Internal review explanation          |
| `user_display_message` | TEXT        | NOT NULL    | Sanitized message for public display |
| `created_at`           | DATETIME    | NOT NULL    | Review creation timestamp            |

Indexes:

1. `idx_censor_results_type_target_id` on (`type`, `target_id`).
2. `idx_censor_results_type_target_id_created_at` on (`type`, `target_id`, `created_at`).
3. `idx_censor_results_created_at` on (`created_at`).
4. `idx_censor_results_rating` on (`rating`).

## 3. Target Enum

`CensorTarget` SHALL contain:

| Value     | Meaning        |
| --------- | -------------- |
| `article` | Article review |
| `paste`   | Paste review   |

## 4. Service Layer

### 4.1 `createCensorship(data, manager?)`

The method SHALL create an unsaved `Censorship` entity using the provided `EntityManager` when `manager` exists; otherwise it SHALL use the default repository.

### 4.2 `saveCensorship(censorship, manager?)`

The method SHALL save the review row using the provided `EntityManager` when `manager` exists; otherwise it SHALL use the default repository.

### 4.3 `getCensorshipsByTypeAndId(type, targetId, manager?)`

The method SHALL return all rows where `type` and `target_id` match, ordered by `created_at DESC`.

The method returns an empty array when no row matches.

## 5. LLM Task `llm:censor`

Input source:

1. The handler SHALL read direct father task results using `job.getChildrenValues()`.
2. If any father result has `skipNextStep=true`, the handler SHALL return `skipNextStep=true` with data `{ rating: 0, category: 'Safe', reason: 'Skipped due to upstream decision', userDisplayMessage: 'Content is safe.' }`.
3. Otherwise the handler SHALL read the first upstream `data.text` string.
4. If no upstream text exists, the handler SHALL throw.

LLM call:

1. The handler SHALL call `llm.chat(messages, 'censor')`.
2. The prompt SHALL require a JSON object response.
3. The handler SHALL parse `result.content` with `JSON.parse`.
4. If parsing fails, the handler SHALL throw.

Parsed output mapping:

| LLM field              | Task result field         |
| ---------------------- | ------------------------- |
| `Rating`               | `data.rating`             |
| `Category`             | `data.category`           |
| `Reason`               | `data.reason`             |
| `User_Display_Message` | `data.userDisplayMessage` |

The handler does not validate `Rating` range, field types, category values, or message sanitization after JSON parsing.

## 6. Update Task `update:censor`

Preconditions:

1. `payload.metadata.censorTarget` MUST exist.
2. `payload.metadata.censorTarget` MUST be `article` or `paste`.
3. The direct father result set MUST contain `data.rating` as a number unless a father has `skipNextStep=true`.

Behavior:

1. If a father has `skipNextStep=true`, return `{ skipNextStep: true, data: {} }` and do not write a censorship row.
2. If `censorTarget='article'`, load the article by `payload.targetId` without cache. If absent, throw `UnrecoverableError`.
3. If `censorTarget='paste'`, load the paste by `payload.targetId`. If absent, throw `UnrecoverableError`.
4. Create one `censorship` row with `type`, `targetId`, `rating`, `category`, `reason`, and `userDisplayMessage` from the upstream result.
5. Save the row.
6. Return `{ skipNextStep: false, data: {} }`.

Each successful update creates a new row. Previous review rows are not updated or deleted.

## 7. API Endpoint

### 7.1 GET `/censorship/query/:type/:id`

Input:

1. `type` MUST be one of `article` or `paste`.
2. `id` is passed to the service as `targetId` without format validation.

Behavior:

1. If `type` is invalid, the route sets HTTP status `400` and response body `{ error: 'Invalid type' }` directly.
2. If the service returns `null`, the route returns code `404` through `ctx.fail`.
3. The service currently returns an empty array, not `null`, when no row matches.
4. If the returned array is empty, the route attempts to destructure `censorships[0]`; response helper middleware catches the resulting exception and returns code `500`.
5. If at least one row exists, the route selects the first row, which is the newest by `created_at DESC`.
6. The response SHALL omit `id`, `targetId`, `type`, and `reason`.
7. The response SHALL include public fields such as `rating`, `category`, `userDisplayMessage`, and `createdAt`.

The public endpoint SHALL NOT return the internal `reason` field.

## 8. File Locations

- Entity: `packages/backend/src/entities/censorship.ts`
- Service: `packages/backend/src/services/censorship.service.ts`
- Router: `packages/backend/src/routers/censorship.router.ts`
- LLM handler: `packages/backend/src/workers/handlers/task/llm/censor.handler.ts`
- Update handler: `packages/backend/src/workers/handlers/task/update/update-censor-result.ts`
