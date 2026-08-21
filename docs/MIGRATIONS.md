# Миграции и восстановление

Supabase migrations forward-only. Применённые файлы не редактируются.

## Порядок

1. Создать `supabase migration new <name>`.
2. Добавить additive SQL, RLS, indexes, grants, triggers.
3. Сначала расширить `supabase/tests/database_test.sql` или добавить отдельный pgTAP regression test.
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
- `202608190002_grant_service_role_fixture_operations.sql`: выдаёт только узкие права, необходимые локальному E2E fixture setup/cleanup; user flows продолжают работать с обычным JWT и RLS.
- `202608190003_fix_audit_trigger_table_branching.sql`: устраняет обращение общего audit-trigger к полям другой таблицы и безопасно разделяет fabric/configuration events.
- `202608190004_harden_active_profile_rls.sql`: централизует проверку активного профиля и запрещает деактивированным admin/tailor/employee прямой доступ к business tables и private Storage; rollback выполняется только новой forward-fix migration.
- `202608210001_atomic_fabric_photo_reorder.sql`: добавляет `reorder_fabric_photos(uuid, uuid[])` для атомарного contiguous `sort_order` фотографий с conflict на stale/partial set; SECURITY INVOKER + RLS; rollback — новая forward-fix migration, удаляющая функцию после того как API перестанет её вызывать.
- `202608210002_fix_configuration_option_labels.sql`: исправляет mojibake в `configuration_options.name/description` (битый client encoding при seed на remote); seed переведён на `on conflict do update`; rollback — restore из backup при необходимости.
