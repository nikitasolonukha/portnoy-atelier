# 1. Назначение этапа

Первый этап должен дать не набор мокапов, а самостоятельный рабочий модуль приложения, который можно открыть на iPad, пройти от авторизации до создания конфигурации костюма и показать заказчику как законченный результат.

Основной пользовательский сценарий:

`Вход → Каталог тканей → Выбор ткани → Конфигуратор → Настройка костюма → 3D-просмотр → Сохранение → Создание второго варианта → Сравнение`

После демонстрации первого этапа заказчик должен видеть:

* единый визуальный стиль будущего приложения;
* реальную авторизацию;
* реальную БД;
* настоящий каталог тканей;
* добавление и редактирование данных;
* импорт Excel/CSV;
* загрузку фотографий и текстур;
* рабочую механику конфигуратора;
* технически рабочий 3D-viewer;
* сохранение вариантов;
* сравнение вариантов;
* корректную работу на iPad.

# 2. Что входит в Stage 1

## 2.1. Фундамент приложения

В рамках Stage 1 необходимо сразу создать:

* проект;
* структуру директорий;
* систему маршрутизации;
* дизайн-систему;
* подключение базы данных;
* авторизацию;
* основу ролей и прав;
* storage;
* миграции;
* обработку ошибок;
* журнал базовых действий;
* staging deployment;
* основу тестирования.

Это делается сразу, чтобы CRM, WhatsApp и AI в следующих этапах добавлялись в существующую архитектуру, а не заставляли переписывать первый этап.

## 2.2. Каталог тканей

Реализовать:

* просмотр каталога;
* поиск;
* фильтры;
* сортировку;
* карточки тканей;
* детальную карточку ткани;
* добавление;
* редактирование;
* архивирование;
* удаление;
* загрузку фото;
* загрузку texture image;
* Excel/CSV import;
* валидацию импортируемых данных;
* выбор ткани для конфигуратора.

## 2.3. Конфигуратор

Реализовать data-driven конфигуратор со следующими группами:

1. ткань;
2. пиджак;
3. лацканы;
4. пуговицы;
5. карманы;
6. брюки;
7. жилет.

Набор конкретных вариантов внутри каждой группы не должен быть жёстко зашит в компоненты.

Каждый вариант хранится как запись в БД.

Это позволит потом изменить:

* название;
* изображение;
* порядок;
* активность;
* 3D mapping;

без переписывания UI.

## 2.4. 3D

На первом этапе требуется:

* WebGL canvas;
* загрузка GLB/GLTF;
* вращение модели;
* pinch/zoom;
* reset camera;
* применение texture/material;
* переключение видимости mesh/вариантов, если модель это позволяет;
* синхронизация состояния конфигуратора и сцены.

Так как финальная модель костюма сейчас отсутствует, первый этап использует техническую демонстрационную модель.

Финальное моделирование костюма с нуля не является задачей Stage 1.

Архитектура должна позволять заменить demo GLB на готовый production asset без переписывания приложения.

# 3. Что НЕ входит в первый этап

Не реализовывать сейчас:

* CRM клиентов;
* фотографии клиентов;
* форму мерок;
* историю мерок;
* заказы;
* производственные статусы;
* WhatsApp API;
* AI-провайдеров;
* AI-визуализацию человека;
* PDF-досье;
* очередь AI;
* расходы AI;
* production backup automation.

Не создавать заглушки, которые выглядят как уже работающие функции.

Если будущие разделы показываются в sidebar, они должны быть либо скрыты, либо явно отмечены как недоступные.

# 4. Технический стек

## Frontend и full-stack

* Next.js 16.2.x Active LTS
* App Router
* React
* TypeScript
* strict mode
* Tailwind CSS v4
* shadcn/ui
* Base UI primitives
* Lucide React
* Motion for React

## Формы и validation

* React Hook Form
* Zod 4

Вся входящая информация валидируется схемами Zod.

Схемы не дублировать отдельно для frontend и backend без необходимости.

## Таблицы

* TanStack Table

Используется для:

* таблицы тканей;
* import preview;
* сохранённых конфигураций.

## Состояние frontend

Server state не дублируется глобально.

Zustand использовать только там, где состояние действительно клиентское:

* текущая несохранённая конфигурация;
* состояние configurator UI;
* выбранные сравниваемые конфигурации.

## Backend / database

Supabase:

* PostgreSQL;
* Auth;
* Storage;
* RLS;
* server-side client.

## 3D

* three;
* @react-three/fiber;
* @react-three/drei.

## Excel / CSV

* SheetJS CE.

Поддерживаем:

* `.xlsx`;
* `.xls`;
* `.csv`.

## Тестирование

* Playwright;
* Zod/schema tests;
* при необходимости Vitest для pure functions.

## Deployment

* Vercel;
* отдельная staging environment;
* production environment создаётся позже.

## Package manager

* pnpm.

# 5. Архитектурные правила

## 5.1. Server-first

По умолчанию использовать Server Components.

Client Component создавать только если нужен:

* local state;
* browser API;
* drag/drop;
* WebGL;
* animation;
* interactive form.

Не делать всё приложение `"use client"`.

## 5.2. Бизнес-логику не размещать внутри UI

Не писать запросы к базе прямо в случайных кнопках.

Слой разделить примерно так:

```text
app/
features/
lib/
db/
components/
types/
schemas/
```

## 5.3. Никаких hardcoded business options

Нельзя писать:

```ts
const LAPELS = ["notch", "peak"]
```

как конечную архитектуру.

Группы и варианты конфигурации должны читаться из БД.

## 5.4. Ошибка не должна ломать экран целиком

Каждая основная async-функция имеет:

* pending state;
* success state;
* error state;
* retry там, где это имеет смысл.

# 6. Предлагаемая структура проекта

```text
src/
  app/
    (auth)/
      login/
        page.tsx

    (app)/
      layout.tsx

      dashboard/
        page.tsx

      fabrics/
        page.tsx
        new/
          page.tsx
        [fabricId]/
          page.tsx
          edit/
            page.tsx

      configurator/
        page.tsx
        [configurationId]/
          page.tsx

      configurations/
        page.tsx
        compare/
          page.tsx

  components/
    ui/
    layout/
    feedback/

  features/
    auth/
    fabrics/
    fabric-import/
    configurator/
    three-viewer/
    configurations/

  lib/
    supabase/
    permissions/
    errors/
    utils/

  schemas/
    fabric.ts
    configuration.ts
    import.ts

  types/

supabase/
  migrations/
  seed.sql

docs/
  PROJECT_SPEC.md
  ARCHITECTURE.md
  DESIGN_SYSTEM.md
  DATABASE.md
  DECISIONS.md
  DEMO_SCRIPT.md

CLAUDE.md
AGENTS.md
```

# 7. База данных Stage 1

## 7.1. profiles

Назначение: данные пользователя приложения поверх Supabase Auth.

Поля:

```text
id uuid PK → auth.users.id
full_name text
role enum
is_active boolean
created_at timestamptz
updated_at timestamptz
```

Role:

```text
admin
tailor
employee
```

Клиентская роль на этом этапе отсутствует.

## 7.2. fabrics

```text
id uuid PK

article text UNIQUE
name text

manufacturer text nullable
collection text nullable

composition text nullable

main_color text nullable
pattern text nullable

weight_gsm integer nullable
width_cm numeric nullable

price_per_meter numeric nullable
currency text nullable

description text nullable

is_active boolean default true

created_by uuid
updated_by uuid

created_at timestamptz
updated_at timestamptz
```

Обязательные для первой версии поля:

* article;
* name.

Остальные допускают `null`.

Причина: заказчик пока не предоставил структуру своей базы тканей.

## 7.3. fabric_assets

```text
id uuid PK

fabric_id uuid FK

type enum:
photo
texture

storage_path text
original_filename text
mime_type text
sort_order integer

created_at timestamptz
```

Для каждой ткани:

* максимум одна основная texture;
* фотографий может быть несколько.

## 7.4. configuration_groups

```text
id uuid PK

key text UNIQUE
name text
sort_order integer
is_active boolean
```

Seed:

```text
fabric
jacket
lapel
buttons
pockets
trousers
vest
```

## 7.5. configuration_options

```text
id uuid PK

group_id uuid FK

key text
name text
description text nullable

preview_image_path text nullable

model_key text nullable
material_key text nullable

sort_order integer
is_active boolean

metadata jsonb

created_at
updated_at
```

`model_key` связывает option с конкретным mesh/object name в будущем GLB.

## 7.6. configurations

```text
id uuid PK

name text

created_by uuid

fabric_id uuid nullable

settings jsonb

model_version text nullable

created_at timestamptz
updated_at timestamptz
```

Пример `settings`:

```json
{
  "jacket": "single_breasted",
  "lapel": "notch",
  "buttons": "two",
  "pockets": "flap",
  "trousers": "classic",
  "vest": "none"
}
```

Значения фактически должны ссылаться на option IDs/keys.

## 7.7. audit_log

Stage 1 записывает минимум:

```text
id
actor_id
action
entity_type
entity_id
metadata jsonb
created_at
```

События:

```text
fabric_created
fabric_updated
fabric_archived
fabric_deleted
fabric_imported
configuration_created
configuration_updated
configuration_deleted
```

## 7.8. fabric_imports

```text
id
filename
status

total_rows
valid_rows
invalid_rows
created_rows
updated_rows

created_by
created_at
finished_at
```

# 8. Индексы

Создать минимум:

```text
fabrics(article)
fabrics(name)
fabrics(is_active)
fabrics(manufacturer)
fabrics(main_color)
fabrics(pattern)

configurations(created_by)
configurations(updated_at)

configuration_options(group_id, sort_order)

audit_log(entity_type, entity_id)
audit_log(created_at)
```

# 9. RLS и права доступа

Все business tables защищены RLS.

Frontend не получает service role key.

## Admin

Может:

* видеть все ткани;
* создавать;
* редактировать;
* импортировать;
* архивировать;
* удалять;
* управлять конфигурациями;
* управлять configuration options.

## Tailor

На Stage 1:

* видеть ткани;
* использовать фильтры;
* открывать ткань;
* создавать конфигурации;
* редактировать свои конфигурации;
* сравнивать.

Не может:

* удалять ткани;
* управлять users;
* менять configuration option catalog.

## Employee

На Stage 1:

* видеть ткани;
* открывать ткани;
* создавать конфигурации;
* сохранять конфигурации;
* сравнивать.

Административный CRUD тканей можно оставить только admin до уточнения заказчиком.

# 10. Storage

Создать private buckets:

```text
fabric-photos
fabric-textures
model-assets
```

Доступ только авторизованным сотрудникам.

Использовать signed URLs или authenticated download.

## Path convention

Фото:

```text
fabrics/{fabricId}/photos/{uuid}.{ext}
```

Texture:

```text
fabrics/{fabricId}/texture/{uuid}.{ext}
```

3D:

```text
models/demo/{version}/model.glb
```

# 11. Поддерживаемые файлы

## Фото ткани

Разрешить:

* JPEG;
* PNG;
* WebP.

Лимит:

10 MB на файл.

## Texture

Разрешить:

* JPEG;
* PNG;
* WebP.

Лимит:

15 MB.

UI должен отдельно объяснять:

`Фото` — изображение ткани для карточки.

`Текстура` — изображение, которое может использоваться в 3D.

# 12. Общий дизайн

Продукт — premium internal atelier tool.

Не использовать внешний вид типичного:

* bootstrap admin;
* generic SaaS dashboard;
* cyberpunk;
* glassmorphism everywhere;
* перегруженного AI-интерфейса.

Направление:

* спокойное;
* дорогое;
* минималистичное;
* много воздуха;
* крупные изображения материалов;
* высокая визуальная иерархия;
* понятные рабочие действия.

# 13. Временная цветовая система

До получения brand guide использовать CSS tokens.

```text
--background: #F6F3EE
--surface: #FFFFFF
--surface-muted: #F0ECE6

--text: #1C1B19
--text-muted: #74706A

--border: #DED8CF

--accent: #806650
--accent-hover: #6A5240
--accent-soft: #EEE7DF

--success: #35644D
--warning: #956F2F
--danger: #9C4141
```

Это не окончательные фирменные цвета.

Все цвета должны заменяться централизованно.

# 14. Typography

Основной font:

`Geist Sans` либо `Inter`.

Использовать:

```text
12–13 px — secondary metadata
14 px — interface text
16 px — controls / important text
20–24 px — section titles
28–32 px — page title при необходимости
```

Никаких огромных marketing headings внутри CRM.

# 15. Размеры и responsive

Основная контрольная точка:

`iPad landscape 1024×768`.

Также проверить:

* iPad portrait;
* desktop 1440 px;
* mobile 390 px.

Touch targets:

не меньше примерно 44×44 для основных интерактивных элементов.

# 16. App Shell

## Desktop / iPad landscape

Слева постоянный sidebar.

Ширина:

220–240 px.

Основная область занимает оставшуюся ширину.

## Sidebar

Элементы:

### Логотип / название

Нажатие:

→ `/dashboard`

### Обзор

Icon: Home.

Нажатие:

→ dashboard.

### Ткани

Icon: Layers / SwatchBook.

Нажатие:

→ каталог.

### Конфигурации

Icon: SlidersHorizontal.

Нажатие:

→ сохранённые конфигурации.

### Нижняя часть

Avatar + имя пользователя.

Нажатие:

открывает menu:

* Профиль;
* Выйти.

На Stage 1 `Профиль` может быть read-only.

## Mobile

Sidebar превращается в Sheet/Drawer.

Кнопка hamburger в верхнем bar.

# 17. Экран Login

Route:

```text
/login
```

## Layout

Desktop/iPad:

две зоны.

Слева:

* название приложения;
* небольшой визуальный блок/texture;
* короткая подпись.

Справа:

login card.

На мобильном:

только login card.

## Поля

### Email

Input.

Validation:

* required;
* valid email.

### Пароль

Password input.

Справа кнопка-eye:

показать/скрыть пароль.

## Кнопка «Войти»

До submit:

enabled только при заполненных required fields.

При submit:

* текст можно заменить spinner;
* повторный клик блокируется.

Success:

→ `/dashboard`.

Ошибка:

inline alert:

`Неверный email или пароль`.

## Состояние expired session

Автоматический redirect:

→ `/login`.

После login желательно вернуть пользователя на страницу, которую он пытался открыть.

# 18. Dashboard Stage 1

Route:

```text
/dashboard
```

Нужен как стартовый экран, но не превращать его в полноценную аналитику.

## Header

```text
Добрый день, {Имя}
```

Под ним:

`Каталог тканей и конфигурации ателье`

## Quick actions

Три кнопки:

### «Добавить ткань»

→ `/fabrics/new`

### «Импортировать»

→ открывает Import Wizard.

### «Новая конфигурация»

→ `/configurator`

## Summary cards

### Тканей

Количество active fabrics.

### Конфигураций

Количество сохранённых configs.

### Последнее обновление

Дата последнего изменения ткани/config.

Не делать фиктивные финансовые KPI.

## Последние конфигурации

Показывать 4–6 последних.

Каждая:

* название;
* ткань;
* дата;
* автор.

Нажатие:

→ configurator этой конфигурации.

# 19. Каталог тканей

Route:

```text
/fabrics
```

Это главный экран Stage 1.

## Top Header

Слева:

`Ткани`

Подзаголовок:

`{N} материалов`

Справа:

### «Импорт»

Secondary button.

Открывает Import Wizard.

### «Добавить ткань»

Primary button.

→ `/fabrics/new`.

Видит admin.

# 20. Search bar

Placeholder:

`Поиск по названию или артикулу`

Search работает по:

* article;
* name;
* manufacturer.

Debounce:

примерно 250–350 ms.

Кнопка `×`:

очищает search.

# 21. Filters

Кнопка:

`Фильтры`

При нажатии:

desktop/iPad:

Popover или side panel.

Mobile:

bottom Sheet.

Фильтры:

### Производитель

Multi-select.

### Цвет

Multi-select.

### Рисунок

Например:

* однотонный;
* клетка;
* полоска;
* фактура;
* другое.

### Активность

* активные;
* архивные;
* все.

### Состав

Text/select по существующим значениям.

## «Применить»

Применяет фильтры.

## «Сбросить»

Удаляет текущие filter values.

## Active filter chips

Над каталогом:

```text
[Синий ×]
[Клетка ×]
[Vitale Barberis ×]
```

Нажатие × убирает конкретный фильтр.

# 22. Sorting

Dropdown:

`Сортировка`

Варианты:

* Сначала новые;
* Сначала старые;
* По названию А–Я;
* По названию Я–А;
* По артикулу.

# 23. Grid / Table Toggle

Две icon buttons:

### Grid

По умолчанию на iPad.

### Table

Удобно для больших каталогов и desktop.

Выбранный вид сохранять локально для пользователя.

# 24. Fabric Card

Карточка содержит:

* основное фото;
* название;
* артикул;
* manufacturer;
* цвет;
* pattern;
* состав коротко;
* badge `Архив`, если archived.

## Hover

Только desktop.

Лёгкий lift/outline.

На touch hover не использовать.

## Нажатие на карточку

→ `/fabrics/{id}`.

## Button `⋯`

Menu:

* Открыть;
* Редактировать;
* Использовать в конфигураторе;
* Архивировать;
* Удалить.

Последние три/два доступны по permissions.

# 25. Empty catalog

Если тканей нет:

показывать Empty State:

```text
Каталог пока пуст

Добавьте первую ткань вручную
или импортируйте список из Excel.
```

Кнопки:

`Добавить ткань`

`Импортировать Excel / CSV`

# 26. Search empty state

Если поиск ничего не дал:

```text
Ничего не найдено
```

Показывать текущий search/filter.

Кнопка:

`Сбросить фильтры`.

# 27. Создание ткани

Route:

```text
/fabrics/new
```

Page form, а не маленький modal.

## Header

← Back

`Новая ткань`

## Section «Основное»

### Артикул

Required.

Проверять uniqueness.

### Название

Required.

### Производитель

Optional.

### Коллекция

Optional.

### Состав

Optional.

### Цвет

Optional.

### Рисунок

Select.

### Плотность

Optional numeric GSM.

### Ширина

Optional cm.

### Цена за метр

Optional numeric.

### Валюта

Optional.

### Описание

Textarea.

# 28. Upload фотографии

Большой drop zone.

Текст:

`Перетащите фотографии сюда или выберите файлы`

Поддерживается multi-upload.

После загрузки:

thumbnail list.

На каждой thumbnail:

### drag handle

Меняет порядок.

### star

Назначает главное фото.

### trash

Удаляет.

# 29. Upload texture

Отдельный блок.

Только один current texture.

Показывать preview.

Кнопки:

`Выбрать текстуру`

после загрузки:

`Заменить`

`Удалить`

Helper:

`Текстура будет использоваться для визуализации материала в 3D при наличии корректной UV-развёртки модели.`

# 30. Bottom actions формы

Sticky footer на iPad.

### «Отмена»

Если изменений нет:

→ назад.

Если есть:

AlertDialog:

`Есть несохранённые изменения.`

Кнопки:

* Остаться;
* Выйти без сохранения.

### «Сохранить»

Создаёт ткань.

Success:

toast:

`Ткань добавлена`

→ detail page.

### «Сохранить и открыть в конфигураторе»

Создаёт ткань.

→ `/configurator?fabric={id}`.

# 31. Detail Fabric Page

Route:

```text
/fabrics/{fabricId}
```

## Header

← Ткани

Название.

Article под названием.

Справа:

`Редактировать`

`Открыть в конфигураторе`

`⋯`

## Layout iPad landscape

Слева:

gallery.

Справа:

fabric properties.

## Texture preview

Отдельная увеличенная зона.

Можно открыть fullscreen/lightbox.

## Button «Редактировать»

→ edit page.

## Button «Открыть в конфигураторе»

Создаёт draft config с этой тканью.

# 32. Edit Fabric

Используется та же форма, что Create.

Не делать две отдельные реализации формы.

При сохранении:

* updated_at;
* updated_by;
* audit entry.

# 33. Delete Fabric

Hard delete только если ткань нигде не используется.

Если используется в configuration:

не удалять физически.

Показывать:

`Ткань используется в сохранённых конфигурациях. Её можно архивировать.`

## Архивировать

`is_active = false`.

Архивная ткань остаётся доступна старым configuration.

# 34. Excel / CSV Import Wizard

Это важный demo feature.

Не делать «загрузил файл — молча что-то импортировалось».

Нужен wizard.

## Step 1. Файл

Большой drop zone.

Formats:

`.xlsx .xls .csv`

После выбора показать:

* filename;
* size;
* листы workbook при наличии.

Кнопка:

`Продолжить`.

# 35. Step 2. Сопоставление колонок

Поскольку формат Excel заказчика неизвестен, сделать mapping UI.

Слева:

column из файла.

Справа:

Select internal field.

Пример:

```text
Артикул        → article
Название       → name
Фабрика        → manufacturer
Состав         → composition
Цвет           → main_color
```

## Auto mapping

Пытаться распознать:

```text
артикул
sku
article

название
name

производитель
brand
mill

цвет
color

состав
composition
```

Пользователь может исправить mapping.

Обязательные:

* article;
* name.

# 36. Step 3. Preview и validation

Table первых строк.

Колонки:

* status;
* article;
* name;
* mapped fields;
* ошибка.

Status:

green:

`Готово`

red:

`Ошибка`

yellow:

`Дубликат`

## Ошибки

Примеры:

* отсутствует article;
* отсутствует name;
* invalid number;
* duplicate article внутри файла.

# 37. Duplicate strategy

Перед запуском предложить:

### Обновить существующие

Если article уже существует, обновить mapped fields.

### Пропустить существующие

Existing fabric не менять.

По умолчанию:

`Обновить существующие`.

# 38. Step 4. Import

Кнопка:

`Импортировать {N} тканей`

Во время:

Progress UI.

После:

```text
Импорт завершён

Создано: 24
Обновлено: 6
Пропущено: 2
Ошибок: 1
```

Кнопки:

`Перейти в каталог`

`Посмотреть ошибки`

# 39. Конфигуратор

Route:

```text
/configurator
```

или

```text
/configurator/{configurationId}
```

Основная ориентация:

iPad landscape.

# 40. Layout конфигуратора

Примерно:

```text
┌──────────────────────────────────────────────┐
│ Top Bar                                      │
├────────────────────────┬─────────────────────┤
│                        │                     │
│                        │  Options panel      │
│       3D Viewer        │                     │
│                        │                     │
│                        │                     │
├────────────────────────┴─────────────────────┤
│ optional status                              │
└──────────────────────────────────────────────┘
```

Viewer:

55–65%.

Options:

35–45%.

# 41. Configurator Top Bar

Слева:

### ←

Вернуться.

При unsaved changes:

confirmation.

### Название конфигурации

Editable inline.

Default:

`Новая конфигурация`

Справа:

### «Сбросить»

Возвращает все options к default.

Если есть changes:

confirmation.

### «Сравнить»

Если config сохранён:

открывает drawer выбора второй конфигурации.

Если current ещё не сохранён:

сначала предложить сохранить.

### «Сохранить»

Primary.

# 42. Fabric selector

Первая группа:

`Ткань`.

Показывать выбранную ткань:

* thumbnail;
* name;
* article;
* composition.

Кнопка:

`Изменить ткань`

Открывает fabric selection sheet.

# 43. Fabric selection sheet

Search.

Filters.

Grid тканей.

Нажатие на ткань:

выделяет её.

Кнопка:

`Выбрать`

закрывает Sheet и обновляет config.

Double click на desktop необязателен.

На touch только обычный tap.

# 44. Группы конфигурации

Accordion / vertical navigation:

```text
Ткань
Пиджак
Лацканы
Пуговицы
Карманы
Брюки
Жилет
```

У каждой группы:

* title;
* selected option text;
* completed state.

# 45. Option Tile

Каждый вариант — визуальная tile.

Содержит:

* small preview;
* name;
* description при необходимости.

Selected:

* accent border;
* check marker.

Tap:

сразу выбирает option.

Никакой отдельной кнопки `Применить`.

# 46. Demo options

Для технической демонстрации можно seed сделать следующим.

## Пиджак

* Однобортный;
* Двубортный.

## Лацкан

* Классический;
* Острый;
* Шалевый.

## Пуговицы

* 1;
* 2;
* 3.

## Карманы

* С клапаном;
* Прорезные;
* Накладные.

## Брюки

* Классические;
* С боковыми регуляторами.

## Жилет

* Без жилета;
* Однобортный;
* Двубортный.

Важно:

это demo seed data.

Финальный список согласовывается заказчиком.

# 47. Configurator state

Изменение option должно:

1. обновить UI;
2. обновить Zustand draft;
3. отправить изменение в 3D layer;
4. установить `dirty = true`.

Не делать POST в БД на каждый tap.

Запись происходит по Save.

# 48. 3D Viewer

Компонент:

```text
SuitViewer
```

Получает:

```ts
{
  fabric,
  settings,
  modelVersion
}
```

Viewer не должен знать о формах и БД.

# 49. Camera

Default:

front 3/4 view.

## Mouse

drag:

rotate.

scroll:

zoom.

## Touch

one finger drag:

rotate.

pinch:

zoom.

## Ограничения

Не позволять пользователю:

* улететь внутрь модели;
* перевернуть камеру вверх ногами;
* отдалиться бесконечно.

# 50. Viewer buttons

Внутри canvas overlay.

## Reset camera

Icon:

RotateCcw / Focus.

Tooltip:

`Вернуть исходный вид`

Нажатие:

камера мягко возвращается на default position.

## Fullscreen

Icon:

Maximize.

Нажатие:

Viewer занимает экран.

В fullscreen:

button:

`Закрыть`.

# 51. Loading 3D

Пока GLB грузится:

Skeleton / loader.

Текст после ~1 секунды:

`Загружаем 3D-модель…`

Не показывать пустой чёрный canvas.

# 52. 3D Error

Если asset не загрузился:

```text
Не удалось загрузить 3D-модель
```

Кнопка:

`Повторить`

Пользователь всё равно может работать с configuration settings.

# 53. Texture application

При выборе fabric:

получить texture URL.

Если model material поддерживает map:

обновить texture.

Настроить:

* repeat;
* wrapping;
* color space;
* anisotropy;
* orientation;

в зависимости от модели.

Texture transformation не hardcode по fabric.

Хранить metadata.

# 54. Model mapping

configuration option может иметь:

```json
{
  "model_key": "jacket_lapel_peak"
}
```

Three layer ищет соответствующий mesh.

Пример:

* выбран `notch`;
* mesh `lapel_notch` visible;
* `lapel_peak` hidden;
* `lapel_shawl` hidden.

В demo model может поддерживаться только часть вариантов.

Это явно зафиксировать как ограничение temporary model.

# 55. Сохранение configuration

Button:

`Сохранить`

Если новая:

создаёт row.

Если существующая:

update.

Toast:

`Конфигурация сохранена`

После save:

`dirty = false`.

# 56. Save failure

Не очищать draft.

Показать:

`Не удалось сохранить конфигурацию`

Button:

`Повторить`

Пользователь не должен терять выбор.

# 57. Unsaved changes protection

Если `dirty = true` и пользователь:

* нажал back;
* сменил route;
* закрыл edit screen;

показать:

```text
Сохранить изменения?
```

Actions:

`Сохранить`

`Не сохранять`

`Отмена`

# 58. Saved Configurations

Route:

```text
/configurations
```

## Header

`Конфигурации`

Button:

`Новая конфигурация`

## Search

По name.

## Table / cards

Поля:

* название;
* fabric;
* author;
* updated date.

Actions:

* Открыть;
* Дублировать;
* Сравнить;
* Удалить.

# 59. Duplicate configuration

Button:

`Дублировать`

Создаёт новый row:

```text
{Old Name} — копия
```

Redirect:

→ новый configurator.

# 60. Compare selector

Пользователь нажимает:

`Сравнить`

Открывается drawer.

Показываются сохранённые configs.

Можно выбрать одну вторую конфигурацию.

После выбора:

`Сравнить`.

# 61. Compare Page

Route:

```text
/configurations/compare?a={id}&b={id}
```

Layout:

две колонки.

## Header каждой

* name;
* fabric;
* date.

## Preview

Если технически возможно:

два viewer или один viewer с toggle.

Для первой версии предпочтительно:

один общий viewer + кнопки A/B,

чтобы не держать одновременно два WebGL heavy canvas на iPad.

## Differences

Таблица:

```text
Параметр     Вариант A       Вариант B

Ткань        Navy 001        Grey 041
Пиджак       Однобортный     Двубортный
Лацкан       Классический    Острый
Пуговицы     2               2
Карманы      С клапаном      Прорезные
Брюки        Классические    Классические
Жилет        Нет             Однобортный
```

Изменившиеся rows визуально выделять.

# 62. Compare buttons

### «Открыть A»

→ configurator A.

### «Открыть B»

→ configurator B.

### «Заменить вариант»

Открывает selector.

# 63. Toast system

Success examples:

```text
Ткань добавлена
Изменения сохранены
Импорт завершён
Конфигурация сохранена
```

Error:

```text
Не удалось сохранить
Не удалось загрузить файл
Не удалось импортировать данные
```

Не использовать toast как единственное место для критичной ошибки формы.

# 64. Dialog rules

AlertDialog только для destructive / important confirmation.

Например:

* удаление;
* discard changes;
* reset config.

Не спрашивать подтверждение после каждого обычного действия.

# 65. Loading states

Каждый data-heavy экран имеет Skeleton.

Обязательно:

* dashboard;
* fabric catalog;
* fabric detail;
* configurations.

Button async state:

spinner + disabled.

# 66. Error states

Создать reusable:

```text
ErrorState
EmptyState
LoadingState
PermissionDenied
```

# 67. Network loss

Если request упал:

не удалять локальные данные формы/config draft.

Показывать retry.

Не пытаться сделать полноценный offline-first PWA на Stage 1.

# 68. Accessibility

* semantic buttons;
* label у каждого input;
* `aria-label` у icon-only buttons;
* visible focus;
* keyboard usable на desktop;
* достаточный contrast;
* не полагаться только на цвет;
* support `prefers-reduced-motion`.

# 69. Animation rules

Motion использовать только как polish.

## Разрешено

* page fade/translate 6–10 px;
* modal/sheet transition;
* selected option indicator;
* card hover;
* skeleton;
* smooth camera reset;
* layout transition;
* small button feedback.

## Не использовать

* scroll-jacking;
* parallax внутри CRM;
* 3D floating navbar;
* text reveal на каждом заголовке;
* постоянные background animation;
* cursor effects.

Timing:

примерно 150–220 ms для UI.

# 70. 3D animation

3D должна выглядеть живо, но не мешать работе.

При первой загрузке можно сделать:

* лёгкое появление;
* небольшой автоматический turn 5–10°;

после первого user interaction автоматическое движение прекращается.

# 71. Performance

3D route загружать lazy.

Не тащить Three.js bundle на login/catalog, если пользователь не открыл configurator.

Использовать:

* dynamic imports;
* asset preload только перед configurator;
* compressed images;
* optimized GLB;
* reused materials/textures.

# 72. Browser targets

Обязательно проверять:

* актуальный Safari iPadOS;
* Safari desktop;
* Chrome;
* Edge;
* Mobile Safari;
* Chrome Android.

Главный QA приоритет:

iPad Safari.

# 73. Security

* никакого Supabase service key в client bundle;
* RLS на business tables;
* private storage;
* validate input server-side;
* random UUID filenames;
* не доверять MIME только по filename;
* ограничить file size;
* permission check на server actions;
* production secrets только env.

# 74. Seed Data для demo

Подготовить demo seed.

## Пользователь

```text
Admin Demo
```

## Ткани

Не менее 10–12 demo fabrics.

Должны быть представлены:

* однотонная синяя;
* однотонная серая;
* чёрная;
* бежевая;
* клетка;
* полоска;
* фактурная.

## Configuration options

Все demo варианты из раздела выше.

## Configurations

Создать минимум две сохранённые configurations для демонстрации Compare.

# 75. Demo Import File

Отдельно подготовить:

```text
demo-fabrics.xlsx
```

Пример 10–15 rows.

Колонки:

```text
Артикул
Название
Производитель
Состав
Цвет
Рисунок
Плотность
Цена
```

Некоторые названия columns намеренно можно сделать не 1:1 с database keys, чтобы показать mapping wizard.

# 76. Первый demo сценарий

Перед показом очистить лишний developer data.

Оставить аккуратный seed.

## Сценарий 1

Login.

Показать dashboard.

## Сценарий 2

Открыть ткани.

Показать:

* grid;
* search;
* filters.

## Сценарий 3

Создать одну ткань вручную.

Загрузить:

* фото;
* texture.

Сохранить.

## Сценарий 4

Открыть Excel Import.

Импортировать demo file.

Показать:

* column mapping;
* validation;
* результат.

## Сценарий 5

Открыть выбранную ткань.

Нажать:

`Открыть в конфигураторе`.

## Сценарий 6

В configurator изменить:

* ткань;
* пиджак;
* лацкан;
* пуговицы;
* карманы;
* брюки;
* жилет.

Покрутить 3D на iPad.

## Сценарий 7

Сохранить:

`Костюм клиента — вариант 1`.

## Сценарий 8

Дублировать.

Изменить:

* fabric;
* lapel;
* vest.

Сохранить:

`Костюм клиента — вариант 2`.

## Сценарий 9

Открыть Compare.

Показать различия.

На этом Stage 1 demo закончен.

# 77. Acceptance Criteria

Stage 1 считается технически выполненным только если выполнены все пункты.

## Auth

* [ ] Неавторизованный пользователь не может открыть private routes.
* [ ] Валидный пользователь может войти.
* [ ] Logout завершает session.
* [ ] Refresh не выбрасывает активного пользователя из приложения.

## Layout

* [ ] Интерфейс корректно работает на iPad landscape.
* [ ] Интерфейс корректно работает на iPad portrait.
* [ ] Есть desktop layout.
* [ ] Есть usable mobile layout.

## Fabrics

* [ ] Каталог загружается из PostgreSQL.
* [ ] Работает поиск.
* [ ] Работают filters.
* [ ] Работает sorting.
* [ ] Можно создать fabric.
* [ ] Можно edit fabric.
* [ ] Можно загрузить photo.
* [ ] Можно загрузить texture.
* [ ] Можно архивировать.
* [ ] Delete защищён confirmation.
* [ ] Used fabric нельзя удалить с потерей data.

## Import

* [ ] `.xlsx` читается.
* [ ] `.csv` читается.
* [ ] Есть column mapping.
* [ ] Required fields валидируются.
* [ ] Duplicate strategy работает.
* [ ] Пользователь видит preview.
* [ ] Пользователь видит import result.

## Configurator

* [ ] Fabric выбирается из каталога.
* [ ] Все группы option отображаются.
* [ ] Выбранные option сохраняются в state.
* [ ] Есть Reset.
* [ ] Есть unsaved changes protection.
* [ ] Configuration сохраняется в Postgres.
* [ ] Existing configuration открывается повторно.
* [ ] Configuration можно duplicate.

## 3D

* [ ] GLB загружается.
* [ ] Model отображается.
* [ ] Drag вращает model.
* [ ] Touch вращает model.
* [ ] Pinch/zoom работает.
* [ ] Reset camera работает.
* [ ] Texture технически может применяться.
* [ ] 3D error не ломает configurator.

## Compare

* [ ] Можно выбрать две сохранённые configs.
* [ ] Отображаются различия.
* [ ] Можно перейти обратно в любую config.

## Permissions

* [ ] UI скрывает запрещённые actions.
* [ ] Backend/RLS также запрещает action независимо от UI.

## Quality

* [ ] `pnpm build` проходит.
* [ ] TypeScript проходит без ошибок.
* [ ] Нет console errors в обычном demo flow.
* [ ] Playwright critical-path tests проходят.
* [ ] Нет mock data, выдаваемых за реальные записи, кроме явно demo seed.

# 78. Playwright E2E

Минимальные scenarios.

## Test 1 — login

```text
login → dashboard
```

## Test 2 — create fabric

```text
login admin
→ fabrics
→ new
→ fill
→ save
→ detail
```

## Test 3 — search

```text
seed
→ search article
→ one expected result
```

## Test 4 — import

```text
upload fixture
→ map
→ preview
→ import
→ expected rows
```

## Test 5 — configuration

```text
select fabric
→ select options
→ save
→ reload
→ values remain
```

## Test 6 — compare

```text
create A
create B
compare
→ differences visible
```

## Test 7 — permissions

employee direct request to admin mutation:

must fail.

## Test 8 — iPad

Critical flow with Playwright tablet/touch emulation.

# 79. Git strategy

Main branches:

```text
main
develop
```

Feature branches можно не плодить, если разработчик один.

Но commits делать маленькими.

Пример:

```text
chore: bootstrap Next and Supabase
feat: add auth and protected app shell
feat: add fabric schema and RLS
feat: implement fabric catalog
feat: implement fabric CRUD
feat: implement spreadsheet import
feat: add configurator state model
feat: integrate three viewer
feat: persist configurations
feat: add configuration compare
test: cover stage one critical flows
```

# 80. Milestones разработки

## M0 — Specification freeze

До кода.

Создать:

```text
PROJECT_SPEC.md
ARCHITECTURE.md
DESIGN_SYSTEM.md
DATABASE.md
CLAUDE.md
TASKS.md
```

Результат:

coding agent понимает весь Stage 1.

Оценка:

2–3 часа.

## M1 — Bootstrap

* Next;
* Tailwind;
* shadcn;
* Supabase;
* env;
* lint;
* folders;
* staging.

Оценка:

2–3 часа.

## M2 — Database + Auth

* migrations;
* profiles;
* roles;
* RLS;
* auth;
* protected layout.

Оценка:

3–4 часа.

## M3 — Design System + App Shell

* tokens;
* typography;
* buttons;
* forms;
* sidebar;
* header;
* responsive.

Оценка:

3–4 часа.

## M4 — Fabric Catalog

* schema;
* queries;
* cards;
* table;
* search;
* filters;
* sorting.

Оценка:

4–5 часов.

## M5 — Fabric CRUD

* create;
* edit;
* upload;
* texture;
* detail;
* archive/delete.

Оценка:

4–5 часов.

## M6 — Spreadsheet Import

* SheetJS;
* mapping;
* validation;
* preview;
* import result.

Оценка:

4–6 часов.

## M7 — Configurator Engine

* groups;
* options;
* Zustand draft;
* dirty state;
* fabric selector;
* save/reset.

Оценка:

4–5 часов.

## M8 — 3D Prototype

* Canvas;
* GLB;
* OrbitControls;
* texture;
* mesh mapping;
* loading/error;
* iPad touch.

Оценка:

5–7 часов в зависимости от demo model.

## M9 — Save + Duplicate + Compare

Оценка:

3–4 часа.

## M10 — Polish + Testing

* Playwright;
* responsive;
* error states;
* loading states;
* animation;
* demo seed;
* demo script.

Оценка:

4–6 часов.

# 81. Реальный срок Stage 1

При AI-assisted разработке и отсутствии блокеров по Supabase/Vercel:

ориентир:

3–5 полноценных рабочих дней.

Не включать в этот срок создание production 3D-костюма с нуля.

# 82. Definition of Demo Ready

Перед отправкой заказчику должны быть:

```text
staging URL
demo login/password
commit/tag
migration files
seed
demo XLSX
test report
```

Tag:

```text
stage-1-demo
```

# 83. AI coding workflow

Не запускать Claude Code командой:

`сделай Stage 1`.

Работать milestone за milestone.

## Первый prompt

Claude должен:

1. прочитать все `/docs`;
2. прочитать `CLAUDE.md`;
3. ничего не кодировать;
4. сформировать implementation plan;
5. указать риски;
6. указать противоречия;
7. перечислить migrations/routes/components;
8. дождаться approval.

## После approval

Одна сессия:

один milestone либо один логически законченный блок.

Каждый цикл:

```text
plan
→ implement
→ typecheck
→ test
→ browser test
→ review diff
→ commit
```

# 84. Что подключить Claude Code

## Использовать

### Matt Pocock Skills

Особенно полезны:

* setup;
* grill-with-docs;
* planning/review;
* TDD/debugging подходы;
* handoff.

## Playwright skills

После появления первого рабочего UI.

Agent должен уметь сам открыть браузер и проверить реальное поведение.

## codebase-memory-mcp

Не нужен на первой тысяче строк.

Подключать после появления:

* множества features;
* cross-feature dependencies;
* большого количества routes/services.

Не делать его обязательной инфраструктурной зависимостью.

## Headroom

Не нужен до появления больших:

* логов;
* test outputs;
* tool outputs;
* длинных debugging sessions.

# 85. Что НЕ подключать

## system_prompts_leaks

Не имеет отношения к архитектуре этого приложения.

Можно читать отдельно ради prompt ideas, но не добавлять в repo/workflow.

## OpenMontage

Не относится к задаче.

Не устанавливать.

## Десятки случайных MCP

Каждый MCP увеличивает:

* context;
* tool surface;
* вероятность неправильного action;
* сложность debug.

Добавлять tool только при конкретной проблеме.

# 86. Документы, которые Claude обязан поддерживать

## CLAUDE.md

Короткие постоянные правила.

Не превращать в 1000 строк ТЗ.

## PROJECT_SPEC.md

Источник истины по functionality.

## DATABASE.md

Таблицы, relationships, RLS.

## DESIGN_SYSTEM.md

Tokens и UI rules.

## DECISIONS.md

Формат:

```text
ADR-001
Problem
Decision
Reason
Consequences
```

Например:

```text
ADR-001
Use JSONB for configuration settings
instead of a table per suit element.
```

## TASKS.md

Только текущий progress.

Пример:

```text
[x] Auth
[x] Fabric schema
[ ] Import mapping
[ ] Configurator
```

Не использовать conversation history как единственный источник progress.

# 87. Правило против AI-хаоса

Claude запрещено:

* менять stack без причины;
* добавлять новую dependency без объяснения;
* создавать второй способ делать то же самое;
* обходить RLS через service key;
* менять database schema прямо в Supabase dashboard без migration;
* hardcode данные для production;
* переписывать целый feature ради мелкого bug;
* считать задачу законченной без test/build.

# 88. UI anti-AI rules

Чтобы интерфейс не выглядел как типичный AI-generated SaaS:

Запрещено по умолчанию:

* одинаковые rounded cards вокруг каждого текста;
* случайные gradients;
* glow;
* purple/blue AI palette;
* 3D blobs;
* огромные hero заголовки;
* excessive badges;
* декоративные graphs без данных;
* четыре KPI cards просто потому, что «dashboard».

Каждый визуальный блок должен отвечать на вопрос:

`зачем он нужен сотруднику ателье?`

# 89. Где использовать внешние reference libraries

## Refero

Искать:

* dashboard;
* inventory;
* product catalog;
* CRM table;
* detail page;
* filters;
* side navigation.

Не копировать конкретный продукт целиком.

## Checklist.design

Перед Stage 1 demo проверить:

* login;
* forms;
* tables;
* empty states;
* errors;
* navigation;
* responsive;
* accessibility.

## Uiverse

Использовать максимум для:

* loader;
* subtle button state;
* tooltip inspiration.

Не собирать дизайн-систему из 20 элементов разных авторов.

## MotionSites / GetLayers

Использовать как inspiration для:

* loading 3D;
* model entrance;
* configurator transition;
* texture interaction;
* premium motion.

Не переносить marketing hero-паттерны в рабочую CRM.

## Hockerty / Suitsupply

Главный reference для:

* последовательности customization;
* visual selection;
* fabric-first flow;
* product preview.

# 90. Главный принцип Stage 1

Первый этап должен выглядеть так, будто это уже начало настоящего продукта, а не технический прототип, который потом придётся выбросить.

Но при этом он не должен притворяться, что следующие этапы уже существуют.

То есть:

реальная архитектура + реальная БД + реальный UX + временный 3D asset.

Именно после этого Stage 2 CRM можно начинать поверх стабильного основания.
