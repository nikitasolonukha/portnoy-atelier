# Стратегия тестирования

## Пирамида

- Unit: схемы, фильтрация, diff, import planning, use cases, error/env contracts, mappers.
- Integration: route handlers + auth/demo adapter + HTTP envelope.
- Database: pgTAP для tables, indexes, triggers, seed и exact RLS policies.
- Demo E2E: production standalone build в Chromium desktop/iPad portrait/iPad landscape/mobile.
- Supabase E2E: локальный production build с настоящими Auth JWT, RLS, Postgres и private Storage; service role используется только для fixture setup/cleanup.

## Команды

```bash
pnpm test
pnpm test:coverage
pnpm test:integration
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm build
pnpm test:e2e
pnpm test:e2e:supabase
pnpm verify
```

Coverage gate: 80% branches/functions/lines/statements. Include patterns отражают application и shared business layers; их нельзя сужать ради зелёного отчёта.

## Обязательные сценарии E2E

Неверный вход; успешный вход; поиск; создание и архив ткани; XLS/XLSX/CSV import preview/result; конфигуратор save/reload/update/duplicate/compare; health/readiness; desktop, iPad portrait/landscape и mobile.

Supabase release gate дополнительно проверяет обычный browser login, UI/API-матрицу admin/tailor/employee, прямое поведение RLS под пользовательскими JWT, загрузку и замену private Storage assets, reload/direct URL, импорт, отсутствие дубля при повторном update и logout.

## Правило бага

Сначала тест, который воспроизводит дефект и падает по ожидаемой причине. Затем минимальное исправление и тот же тест GREEN. После refactor — полный relevant suite.

## Supabase evidence

Integration tests с demo adapter не заменяют pgTAP/RLS. Перед staging обязательны `pnpm db:reset`, `pnpm db:test`, `pnpm db:types` и `pnpm test:e2e:supabase`. Сценарии пользователя никогда не получают service-role key.
