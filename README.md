# TaskFlow

![CI](https://github.com/imers229/taskflow-sdd/actions/workflows/ci.yml/badge.svg)

TaskFlow es una aplicación web interna para organizar proyectos y tareas de
equipos pequeños de desarrollo. Permite gestionar proyectos, administrar sus
tareas, cambiar estados rápidamente, filtrar y buscar tareas, y consultar un
panel de resumen por proyecto.

## Stack

- **Frontend:** Angular 20 standalone, TypeScript estricto, Router, HttpClient,
  Reactive Forms, Vitest y CSS propio.
- **Backend:** Node.js 20, TypeScript estricto, Express 5 y API REST JSON.
- **Persistencia:** SQLite mediante `better-sqlite3`.
- **CI:** GitHub Actions con jobs independientes para backend y frontend.

## Estructura

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
├── frontend/
│   └── src/app/
│       ├── core/
│       ├── dashboard/
│       ├── projects/
│       └── tasks/
├── specs/
├── .github/
│   ├── pull_request_template.md
│   └── workflows/ci.yml
└── docs/
```

## Requisitos

- Node.js `>=20 <21`
- npm

El backend declara formalmente el requisito de Node.js 20. El frontend no
declara un rango propio y se ejecuta en CI con Node.js 20.

## Instalación

```powershell
cd backend
npm ci
cd ..\frontend
npm ci
cd ..
```

## Variables de entorno

Copia `backend/.env.example` como referencia y configura estas variables en el
entorno donde se inicia el backend:

```dotenv
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
DATABASE_PATH=./data/taskflow.sqlite
```

El backend no carga archivos `.env` automáticamente porque no incluye una
dependencia `dotenv`; en PowerShell puedes definirlas antes de ejecutar
`npm start`. El archivo SQLite se crea localmente y está excluido del control
de versiones. La URL del API del frontend está definida actualmente en
`frontend/src/app/core/api.config.ts` como `http://localhost:3000/api`.

## Ejecución

Backend:

```powershell
cd backend
npm start
```

Frontend, en otra terminal:

```powershell
cd frontend
npm start
```

El backend queda disponible en `http://localhost:3000` y el frontend en
`http://localhost:4200`.

## Pruebas y build

```powershell
cd backend
npm test
npm run build
cd ..\frontend
npm test
npm run build
cd ..
```

El comando de pruebas del frontend usa Angular con Vitest y está configurado
sin modo watch (`ng test --watch=false`).

## Documentación adicional

- [Especificaciones funcionales y estado de implementación](docs/especificaciones.md)
- [Flujo de trabajo del proyecto](docs/flujo-de-trabajo.md)