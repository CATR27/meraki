import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date());

/* ───────────────────────── Autenticación (Better Auth) ───────────────────────── */

export const ROLES = ["admin", "psicologo"] as const;
export type Rol = (typeof ROLES)[number];

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  // Plugin admin
  role: text("role").notNull().default("psicologo"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
  // Meraki
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(true),
  cedulaProfesional: text("cedula_profesional"),
  especialidad: text("especialidad"),
  enfoqueTerapeutico: text("enfoque_terapeutico"),
  universidad: text("universidad"),
  telefono: text("telefono"),
  direccionConsultorio: text("direccion_consultorio"),
  duracionSesionMin: integer("duracion_sesion_min").notNull().default(50),
  costoSesion: integer("costo_sesion"),
  zonaHoraria: text("zona_horaria").notNull().default("America/Mexico_City"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/** Contadores de límite de intentos (login y endpoints de Better Auth). */
export const limites = sqliteTable("limites", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(), // epoch ms
});

/* ───────────────────────────────── Dominio ───────────────────────────────── */

export const ESTADOS_CONSULTANTE = ["activo", "alta", "baja"] as const;
export const SEXOS = ["femenino", "masculino", "otro", "prefiero_no_decir"] as const;

export const consultantes = sqliteTable(
  "consultantes",
  {
    id: id(),
    psicologoId: text("psicologo_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    nombre: text("nombre").notNull(),
    apellidos: text("apellidos").notNull(),
    fechaNacimiento: text("fecha_nacimiento"), // YYYY-MM-DD
    sexo: text("sexo", { enum: SEXOS }),
    estadoCivil: text("estado_civil"),
    ocupacion: text("ocupacion"),
    escolaridad: text("escolaridad"),
    telefono: text("telefono"),
    email: text("email"),
    direccion: text("direccion"),
    contactoEmergenciaNombre: text("contacto_emergencia_nombre"),
    contactoEmergenciaParentesco: text("contacto_emergencia_parentesco"),
    contactoEmergenciaTelefono: text("contacto_emergencia_telefono"),
    referidoPor: text("referido_por"),
    estado: text("estado", { enum: ESTADOS_CONSULTANTE }).notNull().default("activo"),
    consentimientoInformado: integer("consentimiento_informado", { mode: "boolean" })
      .notNull()
      .default(false),
    consentimientoFecha: text("consentimiento_fecha"), // YYYY-MM-DD
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("consultantes_psicologo_apellidos_idx").on(t.psicologoId, t.apellidos)],
);

export const expedientes = sqliteTable("expedientes", {
  id: id(),
  consultanteId: text("consultante_id")
    .notNull()
    .unique()
    .references(() => consultantes.id, { onDelete: "cascade" }),
  motivoConsulta: text("motivo_consulta"),
  padecimientoActual: text("padecimiento_actual"),
  antecedentesPersonales: text("antecedentes_personales"),
  antecedentesFamiliares: text("antecedentes_familiares"),
  antecedentesMedicos: text("antecedentes_medicos"),
  medicacionActual: text("medicacion_actual"),
  historiaDesarrollo: text("historia_desarrollo"),
  dinamicaFamiliar: text("dinamica_familiar"),
  evaluacionInicial: text("evaluacion_inicial"),
  impresionDiagnostica: text("impresion_diagnostica"),
  objetivosTerapeuticos: text("objetivos_terapeuticos"),
  planTratamiento: text("plan_tratamiento"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const MODALIDADES = ["presencial", "en_linea"] as const;
export const ESTADOS_CITA = [
  "programada",
  "confirmada",
  "completada",
  "cancelada",
  "no_asistio",
] as const;

export const citas = sqliteTable(
  "citas",
  {
    id: id(),
    psicologoId: text("psicologo_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    consultanteId: text("consultante_id")
      .notNull()
      .references(() => consultantes.id, { onDelete: "cascade" }),
    inicio: integer("inicio", { mode: "timestamp_ms" }).notNull(),
    fin: integer("fin", { mode: "timestamp_ms" }).notNull(),
    modalidad: text("modalidad", { enum: MODALIDADES }).notNull().default("presencial"),
    enlaceVideollamada: text("enlace_videollamada"),
    estado: text("estado", { enum: ESTADOS_CITA }).notNull().default("programada"),
    notas: text("notas"),
    confirmacionEnviadaAt: integer("confirmacion_enviada_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("citas_psicologo_inicio_idx").on(t.psicologoId, t.inicio),
    index("citas_consultante_idx").on(t.consultanteId),
  ],
);

export const NIVELES_RIESGO = ["ninguno", "bajo", "medio", "alto"] as const;
export const ESTADOS_NOTA = ["borrador", "cerrada"] as const;

export const notasSesion = sqliteTable(
  "notas_sesion",
  {
    id: id(),
    psicologoId: text("psicologo_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    consultanteId: text("consultante_id")
      .notNull()
      .references(() => consultantes.id, { onDelete: "cascade" }),
    citaId: text("cita_id").references(() => citas.id, { onDelete: "set null" }),
    numeroSesion: integer("numero_sesion").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    subjetivo: text("subjetivo"),
    objetivo: text("objetivo"),
    analisis: text("analisis"),
    plan: text("plan"),
    estadoAnimo: integer("estado_animo"), // 1–10
    nivelRiesgo: text("nivel_riesgo", { enum: NIVELES_RIESGO }).notNull().default("ninguno"),
    tareasAsignadas: text("tareas_asignadas"),
    observaciones: text("observaciones"),
    estado: text("estado", { enum: ESTADOS_NOTA }).notNull().default("borrador"),
    // Cada edición tras el cierre guarda la versión anterior en notas_sesion_versiones.
    version: integer("version").notNull().default(1),
    editadaAt: integer("editada_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("notas_consultante_fecha_idx").on(t.consultanteId, t.fecha),
    uniqueIndex("notas_cita_unique_idx").on(t.citaId),
  ],
);

export const ORIGENES_VERSION = ["manual", "ia"] as const;

/** Historial de una nota cerrada: el contenido tal como estaba antes de cada edición. */
export const notasSesionVersiones = sqliteTable(
  "notas_sesion_versiones",
  {
    id: id(),
    notaId: text("nota_id")
      .notNull()
      .references(() => notasSesion.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    subjetivo: text("subjetivo"),
    objetivo: text("objetivo"),
    analisis: text("analisis"),
    plan: text("plan"),
    estadoAnimo: integer("estado_animo"),
    nivelRiesgo: text("nivel_riesgo", { enum: NIVELES_RIESGO }).notNull(),
    tareasAsignadas: text("tareas_asignadas"),
    observaciones: text("observaciones"),
    // Quién y cómo se reemplazó esta versión.
    origen: text("origen", { enum: ORIGENES_VERSION }).notNull().default("manual"),
    editadoPor: text("editado_por")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("notas_versiones_nota_version_idx").on(t.notaId, t.version)],
);

export const recordatorios = sqliteTable(
  "recordatorios",
  {
    id: id(),
    psicologoId: text("psicologo_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    consultanteId: text("consultante_id").references(() => consultantes.id, {
      onDelete: "set null",
    }),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion"),
    fechaHora: integer("fecha_hora", { mode: "timestamp_ms" }).notNull(),
    completado: integer("completado", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("recordatorios_psicologo_fecha_idx").on(t.psicologoId, t.fechaHora)],
);

export const bitacora = sqliteTable(
  "bitacora",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accion: text("accion").notNull(),
    entidad: text("entidad").notNull(),
    entidadId: text("entidad_id").notNull(),
    fecha: createdAt(),
  },
  (t) => [index("bitacora_entidad_idx").on(t.entidad, t.entidadId)],
);
