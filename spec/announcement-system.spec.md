# Announcement System Specification

## 1. Scope

This specification defines backend announcement management behavior implemented under `packages/backend`.

The announcement system stores one site-wide HTML announcement. The public frontend reads the active announcement and renders its HTML.

## 2. Announcement Entity

Table name: `announcement`

| Column       | Type       | Constraints | Description             |
| ------------ | ---------- | ----------- | ----------------------- |
| `id`         | INT        | PRIMARY KEY | Announcement identifier |
| `title`      | VARCHAR    | NOT NULL    | Display title           |
| `content`    | MEDIUMTEXT | NOT NULL    | Raw HTML content        |
| `enabled`    | TINYINT    | DEFAULT 1   | Public visibility flag  |
| `created_at` | DATETIME   | NOT NULL    | Creation timestamp      |
| `updated_at` | DATETIME   | NOT NULL    | Last update timestamp   |

There SHALL be at most one logical site announcement. Its `id` SHALL be `1`.

## 3. Service Layer

### 3.1 `getPublicAnnouncement()`

Postconditions:

1. If row `id=1` does not exist, return `null`.
2. If row `id=1` has `enabled=false`, return `null`.
3. If row `id=1` has `enabled=true`, return `{ id, title, content, enabled, updatedAt }`.

### 3.2 `getAdminAnnouncement()`

Postconditions:

1. If row `id=1` exists, return it.
2. If row `id=1` does not exist, return an unsaved default object with `id=1`, `title="公告"`, `content=""`, and `enabled=true`.

### 3.3 `updateAnnouncement(input)`

Input shape:

```json
{
    "title": "公告",
    "content": "<p>HTML</p>",
    "enabled": true
}
```

Preconditions:

1. `title` SHALL be converted to string and trimmed.
2. `content` SHALL be converted to string.
3. `enabled` SHALL be converted to boolean.

Postconditions:

1. If trimmed `title` is empty, persist `title="公告"`.
2. Persist row `id=1` with normalized fields.
3. Return the persisted row.

## 4. API Endpoints

### 4.1 GET `/announcement/current`

Permission: public.

Response data shape when no announcement is public:

```json
null
```

Response data shape when an announcement is public:

```json
{
    "id": 1,
    "title": "公告",
    "content": "<p>HTML</p>",
    "enabled": true,
    "updatedAt": "<datetime>"
}
```

### 4.2 GET `/admin/announcement`

Permission: `MANAGE_ANNOUNCEMENTS`.

Response data shape:

```json
{
    "id": 1,
    "title": "公告",
    "content": "<p>HTML</p>",
    "enabled": true,
    "createdAt": "<datetime>",
    "updatedAt": "<datetime>"
}
```

If the row does not exist, `createdAt` and `updatedAt` MAY be absent.

### 4.3 PUT `/admin/announcement`

Permission: `MANAGE_ANNOUNCEMENTS`.

Request body shape is the same as `updateAnnouncement(input)`.

Postconditions:

1. Persist the normalized announcement.
2. Return the persisted row.

## 5. Permissions

The permission bitmask SHALL include `MANAGE_ANNOUNCEMENTS = 1 << 5`.

`ROLE_ADMIN = -1` SHALL satisfy the `MANAGE_ANNOUNCEMENTS` permission check.
