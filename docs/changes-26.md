# Состав изменения задания 26

База: Git HEAD a8f239a8a27e4f16ef64d4206bfc3a42d00ae742 и 27 незакоммиченных изменений задания 24. Всё дерево до изменений — evidence/base-26/d6-before-26-20261112T120100Z.tar.gz (SHA-256 в evidence/base-26/SHA256SUMS), там же git status, HEAD и tracked-before.patch. Diff отслеживаемых файлов после задания — evidence/stage-b-26/tracked-after.patch; новые файлы в него не входят. Commit не выполнялся.

Переписаны: index.html, style.css, app.js, data.js, state.js, storage.js, card.js, legacy.js (добавлена проверка v4), tests/state.test.mjs, README.md.

Новые: house.js (разрез дома), rooms.js (пять сцен комнат), art.js (иллюстрации изделий); tests/sample-26.mjs (этап A), tests/browser-26.mjs (этап B); docs/owner-analysis-2026-11-12.md, docs/sample-26.md, этот файл; evidence/base-26, evidence/sample-26, evidence/stage-b-26.

Перенесены в историю: room.js задания 24 → tests/history-24/room-24.js; прежние unit-тесты v4 → tests/history-24/state.test.mjs.txt. Пересобран public/ (11 файлов и свой SHA256SUMS; прежний public/room.js удалён из копии, оригинал в архиве базы).

Документы brief, design, assets, acceptance, portfolio, report дополнены датированным разделом задания 26; прежние разделы не переписаны. Корневой SHA256SUMS пересоздан (без .git, node_modules, docs/review-coordinator и самого себя), прежний — evidence/stage-b-26/previous-SHA256SUMS. Файлы docs/review-coordinator, business, Platform и другие демо не изменялись.

Ревизия после ревью (12.11.2026): app.js (R1, R2, R3, R5, C1), card.js (R4), index.html (live-область #live), style.css (кнопка «Начать заново» в hero), tests/state.test.mjs (C2 и unit для R4), tests/browser-26.mjs (проверки R1–R5, C1), public/ пересобран. Манифест первой передачи — evidence/stage-b-26/review-1-SHA256SUMS.
