# Архитектура

## Цели

Production foundation, которую можно развивать без переписывания Stage 1: явные boundaries, заменяемые adapters, серверная авторизация, DB invariants, проверяемые контракты и автономный demo mode.

## Слои

- `src/app`: routing/composition. Pages являются Server Components по умолчанию; `/api/v1` — thin HTTP adapters.
- `src/interface/http`: преобразует исключения/validation в стабильный API contract.
- `src/application`: use cases и repository ports. Не импортирует Next/Supabase/React.
- `src/infrastructure`: Supabase/demo implementations, auth actor, repository composition.
- `src/schemas`: raw boundary validation и parsed output types.
- `src/features`: UI orchestration; workspace store вызывает `/api/v1` в Supabase mode.
- `supabase`: forward-only schema, RLS, Storage, seed, pgTAP.

## Request lifecycle

`browser → proxy session refresh → route verified actor/role → Zod → application service → repository port → Supabase adapter → PostgreSQL RLS/constraint/trigger → mapper → safe envelope`.

Auth и RLS проверяют разные уровни. UI permission hiding не является authorization.

## Режимы

`demo`: deterministic adapter и seed для разработки/демо; browser cache в localStorage. `supabase`: UI bootstrap получает fabrics/configurations из API; mutations идут через route/use-case/repository; session и RLS обязательны. Серверный и публичный mode должны совпадать.

## Business invariants

Article уникален без учёта регистра; settings — JSON object и содержит только активные option группы/keys; используемая ткань защищена FK; writes audit; assets private; roles admin/tailor/employee enforced route+RLS.

## Error model

Expected problems — `ApiProblem(code,message,status,details)`. Unknown errors превращаются в `internal_error` без stack/SQL. Structured logger редактирует secret-bearing keys.

## Extension points

CRM/measurements/orders/WhatsApp/AI добавляются новыми bounded features и tables, не прямыми полями в UI store. Outbox/jobs появляются до внешних side effects. 3D остаётся отдельным будущим adapter и не проникает в core settings.