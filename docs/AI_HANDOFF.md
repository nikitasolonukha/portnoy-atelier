# AI handoff protocol

Любой новый агент начинает так:

1. Прочитать `AGENTS.md`, `docs/ONBOARDING.md`, `docs/PROJECT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`.
2. Проверить `git status`, package scripts, последние migrations и текущие тесты.
3. Выбрать project skill: `portnoy-feature`, `portnoy-database` или `portnoy-release`.
4. Сформулировать acceptance criteria, affected layers, risks и verification plan.
5. Не менять код до RED test для нового поведения.
6. Работать маленьким вертикальным срезом и обновлять документацию в том же change set.
7. Завершить `pnpm verify`; для user flow — E2E; для DB — reset/pgTAP/types.
8. В handoff указать: что изменено, какие команды прошли, что не проверено внешне, migrations/env/deploy actions.

Источники истины: migrations для БД, OpenAPI для HTTP, schemas для input, application services для бизнес-правил, TASKS для прогресса. Conversation history не является источником истины.

## Git handoff

Перед изменениями выполнить `git status -sb`, `git fetch --prune origin` и создать короткую ветку от актуального `origin/main`. Публиковать через PR после зелёного CI. В конце передать branch, commit/PR URL, проверки и rollback SHA/tag. Полный протокол: `docs/GIT_WORKFLOW.md`. Токены и `.env.local` никогда не переносятся через Git или handoff-текст.
