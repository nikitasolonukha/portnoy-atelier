# Permission matrix

Матрица ниже является общим контрактом UI, route handlers и PostgreSQL RLS. Все права требуют активного `profiles.is_active = true`; деактивация немедленно закрывает business tables и private Storage даже при ещё действующем JWT.

| Action | Admin | Tailor | Employee |
|---|---:|---:|---:|
| Read fabrics and assets | Yes | Yes | Yes |
| Create fabric | Yes | Yes | No |
| Edit / archive fabric | Yes | Yes | No |
| Delete unused fabric | Yes | No | No |
| Import fabrics | Yes | Yes | No |
| Read import ledger | All | Own | No |
| Read configurations | All | All | Own |
| Create configuration | Yes, own identity | Yes, own identity | Yes, own identity |
| Edit / delete own configuration | Yes | Yes | Yes |
| Edit / delete another user's configuration | Yes | No | No |
| Read active option catalog | Yes | Yes | Yes |
| Manage groups/options through DB/API policy | Yes | No | No |

Обычный configurator всегда фильтрует `is_active = true`, включая admin. Отдельного management UI для groups/options в Stage 1 нет. Tailor видит чужие configurations только для чтения; mutation controls скрыты/disabled до начала редактирования. UI не заменяет API checks и RLS.