-- Forward-fix: production option labels were inserted with broken client encoding
-- (UTF-8 bytes stored as Latin-1 mojibake). Groups are fine; only option name/description.
-- Rollback: no-op for correctness; restore previous labels only from backup if required.

with fixes(group_key, option_key, name, description) as (
  values
    ('jacket', 'single', 'Однобортный', 'Чистая линия на каждый день'),
    ('jacket', 'double', 'Двубортный', 'Более формальный силуэт'),
    ('lapel', 'notch', 'Прямые', 'Классический английский уступ'),
    ('lapel', 'peak', 'Острые', 'Выраженная линия к плечу'),
    ('lapel', 'shawl', 'Шалевые', 'Мягкий вечерний контур'),
    ('buttons', 'one', 'Одна', null::text),
    ('buttons', 'two', 'Две', null::text),
    ('buttons', 'three-roll-two', '3 roll 2', null::text),
    ('pockets', 'flap', 'С клапаном', null::text),
    ('pockets', 'jetted', 'В рамку', null::text),
    ('pockets', 'patch', 'Накладные', null::text),
    ('trousers', 'classic', 'Классические', null::text),
    ('trousers', 'pleated', 'С одной складкой', null::text),
    ('trousers', 'double-pleat', 'С двумя складками', null::text),
    ('vest', 'none', 'Без жилета', null::text),
    ('vest', 'single', 'Однобортный', null::text),
    ('vest', 'double', 'Двубортный', null::text)
)
update public.configuration_options as option_row
set
  name = fixes.name,
  description = fixes.description
from public.configuration_groups as group_row
join fixes on fixes.group_key = group_row.key
where option_row.group_id = group_row.id
  and option_row.key = fixes.option_key
  and (
    option_row.name is distinct from fixes.name
    or option_row.description is distinct from fixes.description
  );
