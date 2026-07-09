# Verification System Specification

## 1. Scope

This specification defines Luogu ownership verification behavior implemented by `packages/backend/src/services/verification.service.ts`.

The public legacy token route that starts verification is specified in `authentication.spec.md`.

## 2. Configuration

The verification system SHALL read:

| Field                                      | Meaning                  |
| ------------------------------------------ | ------------------------ |
| `config.verification.luogu.codeLength`     | Verification code length |
| `config.verification.luogu.codeExpireTime` | Redis TTL in seconds     |

## 3. Verification Code Preparation

`VerificationService.prepareForLuogu(uid)` SHALL call the private Luogu preparation flow.

The preparation flow SHALL:

1. Generate `code` using `getRandomString(config.verification.luogu.codeLength)`.
2. Store the code in Redis key `verification:luogu:{uid}`.
3. Set Redis expiration to `config.verification.luogu.codeExpireTime` seconds.
4. Return `{ code, expireAt }`, where `expireAt = Date.now() + codeExpireTime * 1000`.

The service logs the generated `code` with the `uid` at debug level.

## 4. Verification Code Consumption

The private Luogu verification flow SHALL:

1. Read Redis key `verification:luogu:{uid}`.
2. If the stored value exactly equals the supplied `code`, delete the Redis key and return `true`.
3. Otherwise return `false` and leave the Redis key unchanged.

## 5. Paste-Based Luogu Ownership Verification

`VerificationService.verifyByLuogu(uid, pasteId)` SHALL:

1. Fetch `https://www.luogu.com/paste/{pasteId}` with `C3vkMode.MODERN` through the shared Luogu fetch utility.
2. Read `resp.currentData.paste.user.uid`.
3. If that UID is not equal to the supplied `uid`, throw `Error('Verification failed: Paste does not belong to the user')`.
4. Read `resp.currentData.paste.data`.
5. Compare that paste content with the stored Redis verification code by calling the private verification flow.
6. Return the boolean verification result.

The method does not validate `uid` type, `pasteId` format, or the response shape before property access.

## 6. Random String Helper

`getRandomString(length)` SHALL:

1. Use the alphabet `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.
2. Generate exactly `length` characters.
3. Select each character with `Math.random()`.

The helper is not cryptographically secure.

## 7. File Locations

- Verification service: `packages/backend/src/services/verification.service.ts`
- Token route: `packages/backend/src/routers/token.router.ts`
- Random string helper: `packages/backend/src/utils/string.ts`
- Luogu fetch utility: `packages/backend/src/utils/fetch.ts`
