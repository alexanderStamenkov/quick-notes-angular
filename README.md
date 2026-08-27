# Quick Notes

Малко Angular practice приложение за бележки — CRUD (create, read, delete) с реален mock backend (`json-server`), reactive forms, и signal-based state management.

## Стек

- Angular 21 (standalone components, signals)
- Reactive Forms
- `json-server` — mock REST API за локална разработка

## Setup

```bash
npm install
```

Пусни **два** отделни терминала:

```bash
npm start     # Angular dev server, http://localhost:4200
npm run api   # json-server, http://localhost:3000
```

## Какво прави

- Списък с бележки (title + content), fetch-нат от mock API.
- Добавяне на нова бележка чрез reactive form.
- Изтриване на бележка, с confirmation modal.
- Целият state (списък с notes) се управлява централно в `NoteService`, чрез Angular signals — компонентът просто чете `noteService.allNote`, без да дублира state локално.

## Бележка

Данните се пазят в `db.json` и се ресетват при рестарт на `json-server` (няма истинска база данни — това е learning/practice проект, не production приложение).
