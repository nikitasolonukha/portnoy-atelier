# API v1

Базовый путь: `/api/v1`. Полный контракт: `openapi/portnoy-v1.yaml`.

## Envelope

Успех: `{ "data": ... }`. Ошибка: `{ "error": { "code", "message", "details?" } }`. Внутренние SQL/stack/secrets не возвращаются. HTTP semantics: 201 create, 204 delete, 401 no session, 403 role denied, 404 absent, 409 conflict/in-use, 422 validation, 500 unexpected, 503 readiness.

## Fabrics pagination

`GET /fabrics` принимает `page` (default 1), `limit` (default 100, max 200), `q` и `status`. Ответ содержит:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 100, "total": 0, "hasMore": false }
}
```

Repository использует стабильную сортировку `updated_at DESC, id DESC`, exact count и bounded range. Текущий Stage 1 workspace контролируемо запрашивает все страницы по 200; hard limit не обходится огромным `limit`. Catalog, dashboard, import planning и configurator selector поэтому видят один полный набор. Для существенно большего production dataset следующий совместимый шаг — server-side UI pagination/search поверх уже существующего API-контракта.

## Resources

- `GET/POST /fabrics`
- `GET/PATCH/DELETE /fabrics/{fabricId}`
- `POST /fabrics/{fabricId}/assets`
- `DELETE /fabrics/{fabricId}/assets/{assetId}`
- `PATCH /fabrics/{fabricId}/assets` — atomic photo reorder (`reorder_fabric_photos`); `409 photo_order_conflict` when the client photo set is stale; `403` for employee
- `POST /fabric-imports` — optional mapped `imageUrl` downloads a public https image into Storage (Supabase mode only; demo keeps URL/path assets locally). Route `maxDuration` is 60s for multi-row photo downloads.
- `GET/POST /configurations`
- `GET/PATCH/DELETE /configurations/{configurationId}`
- `GET /configuration-groups`
- `GET /health` and `GET /readiness`

Cookie-based Supabase session обновляется proxy; handler повторно получает verified actor. Фактические роли описаны в `docs/PERMISSIONS.md`. RLS остаётся последним обязательным барьером.