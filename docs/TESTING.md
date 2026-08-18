# Стратегия тестирования

## Пирамида

- Unit: схемы, фильтрация, diff, import planning, use cases, error/env contracts, mappers.
- Integration: route handlers + auth/demo adapter + HTTP envelope.
- Database: pgTAP для tables, indexes, triggers, seed и exact RLS policies.
- E2E: production build в Chromium desktop и WebKit iPad.

## Команды

```bash
pnpm test
pnpm test:coverage
pnpm test:integration
pnpm db:test
pnpm build
pnpm test:e2e
pnpm verify
```

Coverage gate: 80% branches/functions/lines/statements. Include patterns отражают application и shared business layers; их нельзя сужать ради зелёного отчёта.

## Обязательные сценарии E2E

Неверный вход; успешный вход; поиск; создание и архив ткани; CSV import preview/result; конфигуратор save/reload; duplicate; compare; health/readiness; desktop + iPad/WebKit.

## Правило бага

Сначала тест, который воспроизводит дефект и падает по ожидаемой причине. Затем минимальное исправление и тот же тест GREEN. После refactor — полный relevant suite.

## Supabase evidence

Integration tests с demo adapter не заменяют pgTAP/RLS. Перед staging обязательны `db:reset`, `db:test` и один browser flow под каждой ролью без service key.
