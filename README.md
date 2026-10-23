# Meraki

Sistema web para consultorios de psicología: cuentas de psicólogos, consultantes, expediente psicológico, agenda con confirmaciones por correo, modo sesión con notas SOAP y recordatorios.

> _Meraki_ (griego): hacer algo con el alma, con creatividad y con amor.

## Funcionalidades

**Administración**

- Alta, edición, suspensión y reactivación de cuentas de psicólogos.
- Contraseña temporal aleatoria (se muestra una sola vez y se envía por correo); cambio obligatorio en el primer ingreso.
- La administración **no tiene acceso** a información clínica.

**Psicólogo/a**

- **Inicio (Hoy):** citas del día, pendientes, notas por cerrar e indicadores.
- **Consultantes:** ficha de identificación, contacto de emergencia, consentimiento informado, estados del proceso, búsqueda y paginación.
- **Expediente:** historia clínica por secciones con preguntas guía y progreso.
- **Agenda:** vistas de día, semana y mes; validación de traslapes; estados de cita; correo de confirmación con archivo `.ics` para agregar al calendario.
- **Modo sesión:** nota SOAP con autoguardado, estado de ánimo, nivel de riesgo, tareas, cronómetro y contexto del expediente. Al finalizar, la nota queda cerrada y la cita completada.
- **Recordatorios** internos y campana de avisos.
- **Bitácora** de consultas y cambios de información clínica.

## Stack

| Capa          | Herramienta                                                                               |
| ------------- | ----------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Components, Server Actions, Cache Components) + TypeScript |
| Base de datos | SQLite / [Turso](https://turso.tech) (libSQL) con Drizzle ORM                             |
| Autenticación | Better Auth (correo y contraseña, plugin admin, roles)                                    |
| UI            | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, fuentes Quicksand y Nunito              |
| Correo        | Nodemailer (SMTP)                                                                         |
| Calidad       | Vitest, ESLint, Prettier, GitHub Actions                                                  |

## Desarrollo local

Requisitos: Node.js 24+ y pnpm 11+.

```bash
pnpm install
cp .env.example .env          # completa BETTER_AUTH_SECRET y ADMIN_PASSWORD
pnpm db:migrate               # crea local.db con el esquema
pnpm db:seed                  # crea la cuenta de administración (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm mail:dev                 # (otra terminal) SMTP de desarrollo en localhost:1025
pnpm dev                      # http://localhost:3000
```

Genera el secreto con `openssl rand -base64 32` (o `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`).

`pnpm mail:dev` atrapa los correos en lugar de enviarlos y los guarda en `.mail/` (un `.html` para verlo en el navegador y el `.eml` original con adjuntos).

### Scripts

| Script                                         | Qué hace                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start`       | Desarrollo, build y servidor de producción                            |
| `pnpm typecheck` · `pnpm lint` · `pnpm format` | Tipos, lint y formato                                                 |
| `pnpm test`                                    | Pruebas unitarias e integración (SQLite en memoria)                   |
| `pnpm db:generate`                             | Genera una migración a partir de `src/db/schema.ts`                   |
| `pnpm db:migrate`                              | Aplica migraciones (archivo local o Turso según `TURSO_DATABASE_URL`) |
| `pnpm db:studio`                               | Explorador visual de la base de datos                                 |
| `pnpm db:seed`                                 | Crea el administrador inicial                                         |
| `pnpm mail:dev`                                | SMTP de desarrollo                                                    |

## Despliegue en Vercel + Turso

1. **Base de datos:** crea una BD en Turso y obtén URL y token:
   ```bash
   turso db create meraki
   turso db show meraki --url          # libsql://meraki-<usuario>.turso.io
   turso db tokens create meraki
   ```
2. **Migraciones y admin** contra Turso, desde tu equipo:
   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:migrate
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... BETTER_AUTH_SECRET=... \
     ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm db:seed
   ```
3. **Proyecto en Vercel:** importa el repositorio y define las variables de entorno:
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (la URL pública, p. ej. `https://meraki.tudominio.com`), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `APP_TIMEZONE`.
4. **SMTP:** cualquier proveedor sirve (Google Workspace / Gmail con contraseña de aplicación, Microsoft 365, Resend, Brevo, Amazon SES…). Usa el puerto 465 (TLS) o 587 (STARTTLS).

Cada cambio de esquema: `pnpm db:generate`, revisa el SQL en `src/db/migrations/` y aplica `pnpm db:migrate` contra Turso **antes** de desplegar.

## Seguridad y privacidad

- Autorización en el servidor en cada consulta y Server Action (`src/lib/dal.ts`); cada psicólogo solo accede a sus propios consultantes (un id ajeno responde 404).
- Límite de intentos de inicio de sesión por IP y por cuenta, persistido en la base de datos.
- Sesiones sin caché en cookie: suspender una cuenta o cambiar la contraseña surte efecto de inmediato.
- Las notas cerradas no se pueden modificar; la bitácora registra consultas y cambios del expediente.
- Los correos no incluyen información clínica.
- Cabeceras de seguridad (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).

Antes de usar la aplicación con datos reales, revisa su cumplimiento con la normativa aplicable (en México, NOM-004-SSA3-2012 y LFPDPPP), publica tu aviso de privacidad y define una política de respaldos de Turso.

## Estructura

```
src/
  app/            Rutas: (auth) login y cambio de contraseña · (app) área privada · api/auth
  features/       Un módulo por dominio: actions.ts · queries.ts · schemas.ts · components/
                  (auth, psicologos, perfil, consultantes, expediente, citas, sesiones, recordatorios, panel)
  components/     ui/ (shadcn) · layout/ · shared/ · brand/
  db/             schema.ts · migraciones · seed
  lib/            auth, DAL, fechas y zonas horarias, agenda, correo, validación, limitador
```
