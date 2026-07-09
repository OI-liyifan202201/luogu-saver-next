# LLM System Specification

## 1. Scope

This specification defines the OpenAI-compatible LLM adapter implemented by `packages/backend/src/lib/llm.ts`.

Task handlers and workflow templates define their own prompts and data contracts in their owning subsystem specs.

## 2. Scenario Enum

The adapter SHALL support these scenario names:

1. `chat`.
2. `summary`.
3. `answer`.
4. `embedding`.
5. `rerank`.
6. `censor`.

## 3. Client Cache

The adapter SHALL cache OpenAI-compatible clients by provider ID.

When `getClient(providerId)` is called:

1. If a client exists in the in-memory map, return it.
2. Otherwise find `config.llm.providers[*]` where `id === providerId`.
3. If no provider exists, throw `Error('LLM Provider with ID {providerId} not found')`.
4. Construct `new OpenAI({ baseURL: provider.apiUrl, apiKey: provider.token })`.
5. Store and return the client.

## 4. Scenario Resolution

`getContext(scenario)` SHALL resolve `{ providerId, modelId, modelParams }`.

### 4.1 Chat Scenario

`chat` SHALL use `config.llm.scenarios.chat.use`.

Model parameters:

| API field           | Config field                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `temperature`       | `llm.scenarios.chat.temperature`                                    |
| `max_tokens`        | `llm.scenarios.chat.maxTokens`                                      |
| `top_p`             | `llm.scenarios.chat.topP`                                           |
| `frequency_penalty` | `llm.scenarios.chat.frequencyPenalty`                               |
| `presence_penalty`  | `llm.scenarios.chat.presencePenalty`                                |
| `stop`              | `llm.scenarios.chat.stopSequences` when non-empty; otherwise absent |

### 4.2 Summary Scenario

`summary` SHALL use `config.llm.scenarios.summary.use`.

Model parameters SHALL be `temperature`, `max_tokens`, and `top_p` from the summary scenario config.

### 4.3 Answer Scenario

`answer` SHALL use `config.llm.scenarios.answer.use` when it is truthy. Otherwise it SHALL use `config.llm.scenarios.chat.use`.

Model parameters SHALL be `temperature`, `max_tokens`, and `top_p` from the answer scenario config.

### 4.4 Embedding Scenario

`embedding` SHALL use `config.llm.scenarios.embedding.use` and no chat model parameters.

### 4.5 Rerank Scenario

`rerank` SHALL use `config.llm.scenarios.rerank.use` or the empty string.

`hasRerank()` SHALL return `Boolean(config.llm.scenarios.rerank?.use)`.

### 4.6 Censor Scenario

`censor` SHALL use `config.llm.scenarios.censor.use` and no explicit model parameters.

### 4.7 Provider and Model Parsing

After selecting `use`:

1. If `use` is empty, throw `Error('No provider configured for scenario: {scenario}')`.
2. If `use` contains `:`, split at the first segment: provider ID is the substring before the first colon, and model ID is the remaining substring after joining later segments with `:`.
3. If `use` does not contain `:`, provider ID is `use` and model ID is absent.
4. Find provider by provider ID. If absent, throw `Error('LLM Provider with ID {providerId} not found. Configured use: {use}')`.
5. If model ID is absent and `provider.models` is non-empty, use `provider.models[0].id`.
6. If model ID is absent and `provider.models` is empty, throw `Error('LLM Provider {providerId} has no models configured')`.

## 5. Chat Completion

`llm.chat(messages, scenario='chat', options={})` SHALL:

1. Resolve context for the scenario.
2. Get the provider client.
3. Write a debug log with `providerId`, `modelId`, `scenario`, and `toolCount`.
4. Call `client.chat.completions.create` with `model`, `messages`, scenario model parameters, and optional tool fields.
5. If `options.tools` exists, pass `tools=options.tools` and `tool_choice=options.toolChoice || 'auto'`.
6. Return `{ content, usage, raw }`, where `content = response.choices[0]?.message?.content`.

On failure, the method SHALL normalize the error reason, log `{ reason, providerId, modelId, scenario }`, and throw `Error(reason)`.

## 6. Embeddings

`llm.embedding(input)` SHALL:

1. Resolve context for `embedding`.
2. Get the provider client.
3. Write a debug log with `providerId` and `modelId`.
4. Call `client.embeddings.create({ model, input })`.
5. Return `{ embedding: response.data[0].embedding, usage: response.usage, raw: response }`.

On failure, the method SHALL normalize the error reason, log `{ reason, providerId, modelId }`, and throw `Error(reason)`.

## 7. Rerank

`llm.rerank(query, documents, topN=documents.length)` SHALL:

1. Resolve context for `rerank`.
2. Get the provider client.
3. Write a debug log with `providerId`, `modelId`, and document count.
4. Call `client.post('/rerank', { body })`.
5. The request body SHALL include `model`, `query`, `documents`, `top_n`, `return_documents=false`, `temperature=config.llm.scenarios.rerank.temperature`, and `top_p=config.llm.scenarios.rerank.topP`.
6. Normalize `payload.results` with Section 8.
7. Return `{ results, raw: payload }`.

On failure, the method SHALL normalize the error reason, log `{ reason, providerId, modelId }`, and throw `Error(reason)`.

## 8. Rerank Result Normalization

`normalizeRerankResults(results)` SHALL:

1. Return `[]` if `results` is not an array.
2. For each item, compute `index = Number(item.index)`.
3. Compute `relevanceScore = Number(item.relevance_score ?? item.relevanceScore ?? 0)`.
4. Keep only items where `index` is an integer and `relevanceScore` is finite.
5. Return objects `{ index, relevanceScore }` in input order after filtering.

## 9. Logging and Privacy

LLM failure logs SHALL follow `logging-system.spec.md`.

The adapter SHALL log normalized reasons, provider IDs, model IDs, scenario names, and counts. It SHALL NOT log prompt text, article bodies, paste bodies, raw provider response bodies, or embedding vectors.

## 10. File Locations

- LLM adapter: `packages/backend/src/lib/llm.ts`
- Config schema: `packages/backend/src/config/schemas/llm.ts`
- Error normalization: `packages/backend/src/utils/error-reason.ts`
