# Спецификация Stage 1

Цель: самостоятельный рабочий модуль ателье, который можно открыть на iPad, войти, вести каталог тканей, собрать конфигурацию костюма, сохранить второй вариант и сравнить их.

Реализованный сценарий: `Вход → Каталог тканей → Выбор ткани → Конфигуратор → Настройка костюма → 3D/2D просмотр → Сохранение → Дублирование → Сравнение`.

Stage 1 включает технический 3D viewer на WebGL/GLB (`suit-web-v2.glb`): OrbitControls, rotate, touch, zoom, camera presets/reset, fullscreen и применение texture/material ткани, с fallback при недоступном WebGL. Текущий GLB — technical/demo asset, а не полная modular production-модель: реальные lapel/pocket/single-double/vest geometry swaps в 3D не заявляются. Construction-варианты достоверно показываются в 2D technical view, что соответствует исходному ТЗ («mesh switching, если модель это позволяет»).

CRM, мерки, заказы, WhatsApp, AI и PDF-досье остаются вне Stage 1.

Production-режим требует URL и anon key конкретного Supabase project. Пока доступы не выданы, локальная демонстрация использует явно отмеченный demo seed и browser storage. Схема PostgreSQL, RLS, Storage policies и server/browser clients подготовлены.
