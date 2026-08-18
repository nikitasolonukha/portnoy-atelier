# Миграции и восстановление

Supabase migrations forward-only. Применённые файлы не редактируются.

## Порядок

1. Создать `supabase migration new <name>`.
2. Добавить additive SQL, RLS, indexes, grants, triggers.
3. Сначала расширить `supabase/tests/database_test.sql`.
4. Выполнить `pnpm db:reset`, `pnpm db:test`, `pnpm db:types`.
5. Проверить backward compatibility старого приложения с новой схемой.
6. Применить staging, снять evidence, затем production.

## Rollback

Безопасный стандарт — rollback приложения на предыдущий deployment при сохранении additive schema. Для ошибочной schema создаётся новая forward-fix migration. Drop/rename выполняется только после двух релизов: сначала перестать читать поле, затем удалить отдельной миграцией после backup и проверки usage.

Перед destructive change: backup, оценка lock time, dry-run на копии, owner, maintenance window и проверенный recovery query.

## Текущие migrations

- `202608180001_stage_one.sql`: базовые сущности, RLS, Storage, seed groups.
- `202608180002_harden_stage_one.sql`: constraints, search indexes, user/audit/update triggers, DB validation конфигураций, grants и import idempotency metadata.
- `202608180003_separate_fabric_from_option_groups.sql`: удаляет legacy `settings.fabric` и группу `fabric`; ткань остаётся только ссылкой `configurations.fabric_id`.
- `202608190001_complete_import_ledger.sql`: добавляет итоговые `skipped/failed` счётчики, безопасную стратегию `skip`, own-update RLS и audit trigger завершённого импорта.
