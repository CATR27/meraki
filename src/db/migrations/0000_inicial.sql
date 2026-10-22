CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `bitacora` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`accion` text NOT NULL,
	`entidad` text NOT NULL,
	`entidad_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bitacora_entidad_idx` ON `bitacora` (`entidad`,`entidad_id`);--> statement-breakpoint
CREATE TABLE `citas` (
	`id` text PRIMARY KEY NOT NULL,
	`psicologo_id` text NOT NULL,
	`consultante_id` text NOT NULL,
	`inicio` integer NOT NULL,
	`fin` integer NOT NULL,
	`modalidad` text DEFAULT 'presencial' NOT NULL,
	`enlace_videollamada` text,
	`estado` text DEFAULT 'programada' NOT NULL,
	`notas` text,
	`confirmacion_enviada_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`psicologo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`consultante_id`) REFERENCES `consultantes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `citas_psicologo_inicio_idx` ON `citas` (`psicologo_id`,`inicio`);--> statement-breakpoint
CREATE INDEX `citas_consultante_idx` ON `citas` (`consultante_id`);--> statement-breakpoint
CREATE TABLE `consultantes` (
	`id` text PRIMARY KEY NOT NULL,
	`psicologo_id` text NOT NULL,
	`nombre` text NOT NULL,
	`apellidos` text NOT NULL,
	`fecha_nacimiento` text,
	`sexo` text,
	`estado_civil` text,
	`ocupacion` text,
	`escolaridad` text,
	`telefono` text,
	`email` text,
	`direccion` text,
	`contacto_emergencia_nombre` text,
	`contacto_emergencia_parentesco` text,
	`contacto_emergencia_telefono` text,
	`referido_por` text,
	`estado` text DEFAULT 'activo' NOT NULL,
	`consentimiento_informado` integer DEFAULT false NOT NULL,
	`consentimiento_fecha` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`psicologo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `consultantes_psicologo_apellidos_idx` ON `consultantes` (`psicologo_id`,`apellidos`);--> statement-breakpoint
CREATE TABLE `expedientes` (
	`id` text PRIMARY KEY NOT NULL,
	`consultante_id` text NOT NULL,
	`motivo_consulta` text,
	`padecimiento_actual` text,
	`antecedentes_personales` text,
	`antecedentes_familiares` text,
	`antecedentes_medicos` text,
	`medicacion_actual` text,
	`historia_desarrollo` text,
	`dinamica_familiar` text,
	`evaluacion_inicial` text,
	`impresion_diagnostica` text,
	`objetivos_terapeuticos` text,
	`plan_tratamiento` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`consultante_id`) REFERENCES `consultantes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expedientes_consultante_id_unique` ON `expedientes` (`consultante_id`);--> statement-breakpoint
CREATE TABLE `notas_sesion` (
	`id` text PRIMARY KEY NOT NULL,
	`psicologo_id` text NOT NULL,
	`consultante_id` text NOT NULL,
	`cita_id` text,
	`numero_sesion` integer NOT NULL,
	`fecha` integer NOT NULL,
	`subjetivo` text,
	`objetivo` text,
	`analisis` text,
	`plan` text,
	`estado_animo` integer,
	`nivel_riesgo` text DEFAULT 'ninguno' NOT NULL,
	`tareas_asignadas` text,
	`observaciones` text,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`psicologo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`consultante_id`) REFERENCES `consultantes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `notas_consultante_fecha_idx` ON `notas_sesion` (`consultante_id`,`fecha`);--> statement-breakpoint
CREATE UNIQUE INDEX `notas_cita_unique_idx` ON `notas_sesion` (`cita_id`);--> statement-breakpoint
CREATE TABLE `recordatorios` (
	`id` text PRIMARY KEY NOT NULL,
	`psicologo_id` text NOT NULL,
	`consultante_id` text,
	`titulo` text NOT NULL,
	`descripcion` text,
	`fecha_hora` integer NOT NULL,
	`completado` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`psicologo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`consultante_id`) REFERENCES `consultantes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `recordatorios_psicologo_fecha_idx` ON `recordatorios` (`psicologo_id`,`fecha_hora`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'psicologo' NOT NULL,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`must_change_password` integer DEFAULT true NOT NULL,
	`cedula_profesional` text,
	`especialidad` text,
	`enfoque_terapeutico` text,
	`universidad` text,
	`telefono` text,
	`direccion_consultorio` text,
	`duracion_sesion_min` integer DEFAULT 50 NOT NULL,
	`costo_sesion` integer,
	`zona_horaria` text DEFAULT 'America/Mexico_City' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);