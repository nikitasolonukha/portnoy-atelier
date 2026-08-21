-- Заполняйте после создания пользователя через Supabase Auth.
-- update public.profiles set full_name = 'Администратор', role = 'admin' where id = '<auth-user-uuid>';

with groups as (select id,key from public.configuration_groups)
insert into public.configuration_options(group_id,key,name,description,sort_order)
select groups.id, options.key, options.name, options.description, options.sort_order
from groups
join (values
  ('jacket','single','Однобортный','Чистая линия на каждый день',0), ('jacket','double','Двубортный','Более формальный силуэт',1),
  ('lapel','notch','Прямые','Классический английский уступ',0), ('lapel','peak','Острые','Выраженная линия к плечу',1), ('lapel','shawl','Шалевые','Мягкий вечерний контур',2),
  ('buttons','one','Одна',null,0), ('buttons','two','Две',null,1), ('buttons','three-roll-two','3 roll 2',null,2),
  ('pockets','flap','С клапаном',null,0), ('pockets','jetted','В рамку',null,1), ('pockets','patch','Накладные',null,2),
  ('trousers','classic','Классические',null,0), ('trousers','pleated','С одной складкой',null,1), ('trousers','double-pleat','С двумя складками',null,2),
  ('vest','none','Без жилета',null,0), ('vest','single','Однобортный',null,1), ('vest','double','Двубортный',null,2)
) as options(group_key,key,name,description,sort_order) on groups.key = options.group_key
on conflict (group_id,key) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order;
