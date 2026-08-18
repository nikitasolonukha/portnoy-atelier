# Security model

Defense in depth: proxy session refresh → route verified actor/role → Zod validation → application invariant → repository → PostgreSQL constraints/RLS → private Storage policies.

Anon key разрешён в клиенте и не является service secret. Service-role key не используется приложением. Secrets не хранятся в repo и не логируются.

Security headers находятся в `next.config.ts`: CSP, frame denial, MIME sniffing protection, referrer and permissions policy. Перед production CSP проверяется с реальным Supabase hostname.

Uploads: private bucket, allowlist JPEG/PNG/WebP, 10 MB bucket limit, role-based writes, unique storage path. API проверяет заявленный MIME, сигнатуру декодированных байтов, размер и количество файлов до записи в Storage.

Сообщения об ошибках публичные и стабильные; stack/SQL доступны только в защищённой observability system.

При обнаружении уязвимости: остановить rollout, сохранить минимальные логи без secrets, закрыть affected route/policy, выпустить test-first fix, rotate compromised credentials и документировать incident timeline.
