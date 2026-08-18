# API v1

Базовый путь: `/api/v1`. Полный машиночитаемый контракт: `openapi/portnoy-v1.yaml`.

## Envelope

Успех: `{ "data": ... }`. Коллекции могут содержать `meta`. Ошибка: `{ "error": { "code", "message", "details?" } }`.

Коды стабильны и пригодны для UI. Внутренние SQL/stack/secrets никогда не входят в response. HTTP semantics: 201 create, 204 delete, 401 no session, 403 role denied, 404 absent, 409 conflict/in-use, 422 validation, 500 unexpected, 503 readiness.

## Ресурсы

- `GET/POST /fabrics`
- `GET/PATCH/DELETE /fabrics/{fabricId}`
- `GET/POST /configurations`
- `PATCH/DELETE /configurations/{configurationId}`
- `GET /health` — liveness без проверки БД.
- `GET /readiness` — проверяет выбранный adapter/БД.

## Auth и роли

Cookie-based Supabase session обновляет `src/proxy.ts`. Route handler повторно получает verified user. RLS остаётся последним обязательным барьером.

- `employee`: чтение каталога, свои конфигурации.
- `tailor`: чтение/изменение тканей, рабочие конфигурации.
- `admin`: полный Stage 1 доступ, включая delete при отсутствии FK-конфликта.

## Изменение контракта

Добавление optional поля совместимо. Удаление/переименование/смена типа требует `/api/v2`. Обновляйте OpenAPI, integration tests и этот документ в одном change set.
