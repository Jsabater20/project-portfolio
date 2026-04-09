# Turnero Estética

Sistema de turnos online para salones de belleza y estéticas. Permite a los clientes reservar citas con profesionales para servicios específicos, y a los administradores gestionar la agenda, los profesionales y los servicios ofrecidos.

---

## Características principales

- **Flujo de reserva guiado**: selección de servicio → profesional → identificación del cliente → elección de fecha y horario → confirmación
- **Prevención de superposición de turnos**: el backend verifica conflictos antes de aceptar una reserva
- **Filtrado por turno**: los profesionales tienen asignado un turno (`mañana`, `tarde` o `ambos`), y solo se muestran los horarios disponibles según su jornada
- **Bloqueo de fines de semana y feriados**: los feriados nacionales argentinos 2026 están incluidos; sábados y domingos no están disponibles para reservas
- **Vista diaria y semanal de agenda**: filtrado por profesional y navegación semana a semana
- **Historial de turnos por cliente**: acceso a citas pasadas y futuras una vez que el cliente se identifica
- **Gestión de estados**: los turnos pueden marcarse como `completado` o `cancelado`
- **Panel de administración**: ABM completo de profesionales y servicios, con asignación de servicios a profesionales

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | NestJS 11 + TypeScript |
| **ORM** | Prisma 5 |
| **Base de datos** | PostgreSQL |
| **Frontend** | React 19 + TypeScript |
| **Build tool** | Vite |
| **Estilos** | Tailwind CSS 3 |
| **Validación** | class-validator + class-transformer |

---

## Estructura del proyecto

```
project-portfolio/
├── backend/          # API REST con NestJS
│   ├── prisma/       # Schema, migraciones y seed
│   └── src/
│       ├── clientes/
│       ├── profesionales/
│       ├── servicios/
│       └── turnos/
└── frontend/         # SPA con React + Vite
    └── src/
        ├── components/
        ├── hooks/
        └── utils/
```

---

## Modelo de datos

```
Cliente         id, nombre, email (único), telefono
Profesional     id, nombre, turno (mañana/tarde/ambos), N:M con Servicio
Servicio        id, nombre (único), descripcion?, duracionMin, precio, N:M con Profesional
Turno           id, inicio, fin, estado (reservado/completado/cancelado)
                → clienteId, servicioId, profesionalId
```

---

## API — Endpoints principales

### Clientes `/clientes`
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/clientes` | Crear cliente |
| `POST` | `/clientes/identificar` | Buscar o crear cliente por email |
| `GET` | `/clientes` | Listar clientes |
| `GET` | `/clientes/:id/turnos` | Historial de turnos de un cliente |

### Profesionales `/profesionales`
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/profesionales` | Crear profesional |
| `GET` | `/profesionales` | Listar todos (incluye servicios asignados) |
| `PATCH` | `/profesionales/:id` | Actualizar nombre, turno o servicios |
| `DELETE` | `/profesionales/:id` | Eliminar profesional |

### Servicios `/servicios`
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/servicios` | Crear servicio |
| `POST` | `/servicios/:id/profesionales/:profesionalId` | Asignar profesional a servicio |
| `GET` | `/servicios` | Listar servicios (acepta `?profesionalId=`) |
| `PATCH` | `/servicios/:id` | Actualizar servicio |
| `DELETE` | `/servicios/:id` | Eliminar servicio |

### Turnos `/turnos`
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/turnos` | Crear turno (con validación de superposición) |
| `GET` | `/turnos` | Listar todos los turnos |
| `GET` | `/turnos/agenda?profesionalId=&fecha=` | Agenda diaria de un profesional |
| `GET` | `/turnos/semana?profesionalId=&fechaInicio=` | Agenda semanal |
| `PATCH` | `/turnos/:id/cancelar` | Cancelar turno |
| `PATCH` | `/turnos/:id/completar` | Marcar como completado |

---

## Instalación y uso local

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
```

Crear `backend/.env`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/turnero"
PORT=3000
```

```bash
npx prisma migrate dev   # aplicar migraciones
npm run seed             # cargar datos de prueba
npm run start:dev        # servidor en modo watch → http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
```

Crear `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev   # Vite dev server → http://localhost:5173
```

---

## Scripts disponibles

### Backend

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Servidor en modo desarrollo (watch) |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Iniciar build de producción |
| `npx prisma studio` | Explorador visual de la base de datos |

### Frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |

---

## Variables de entorno

| Archivo | Variable | Descripción |
|---|---|---|
| `backend/.env` | `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `backend/.env` | `PORT` | Puerto del servidor (defecto: `3000`) |
| `frontend/.env` | `VITE_API_URL` | URL base de la API |

> Los archivos `.env` **no se incluyen** en el repositorio. Deben crearse manualmente siguiendo las plantillas anteriores.
