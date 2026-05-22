# Markdown System Specification

## 1. Scope

This specification defines backend Markdown rendering behavior in `packages/backend/src/lib/markdown.ts`.

## 2. Directive Containers

Supported block container directive names are:

- `info`
- `warning`
- `success`
- `error`

For a supported directive `:::name`, the renderer SHALL output one HTML container with:

1. Class `md-block`.
2. Class equal to `name`.
3. One title child with class `md-block-title`.
4. One body child with class `md-block-body`.

## 3. Directive Title Resolution

For a supported directive `:::name`, the rendered title text SHALL be resolved by this precedence order:

1. If directive attribute `title` exists, use `title`.
2. Else if directive label `[label]` exists, use `label`.
3. Else use `name.toUpperCase()`.

The directive label node SHALL NOT be rendered inside `md-block-body`.

Example input:

```md
- aaa
  :::success[sb]
  a
  :::
- bbb
```

Expected postconditions:

1. The `success` block title text is `sb`.
2. The `success` block body contains text `a`.
3. The `success` block body does not contain text `sb`.

## 4. Open State

If directive attribute `open` exists, `md-block-body` SHALL be visible initially.

If directive attribute `open` does not exist, `md-block-body` SHALL have style `display:none`.
