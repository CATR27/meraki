CREATE TABLE `grabacion_fragmentos` (
	`id` text PRIMARY KEY NOT NULL,
	`grabacion_id` text NOT NULL,
	`indice` integer NOT NULL,
	`pathname` text NOT NULL,
	`mime_type` text NOT NULL,
	`inicio_ms` integer NOT NULL,
	`duracion_ms` integer NOT NULL,
	`bytes` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`grabacion_id`) REFERENCES `grabaciones_sesion`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fragmentos_grabacion_indice_idx` ON `grabacion_fragmentos` (`grabacion_id`,`indice`);--> statement-breakpoint
CREATE TABLE `grabaciones_sesion` (
	`id` text PRIMARY KEY NOT NULL,
	`cita_id` text NOT NULL,
	`psicologo_id` text NOT NULL,
	`consultante_id` text NOT NULL,
	`estado` text DEFAULT 'grabando' NOT NULL,
	`duracion_ms` integer DEFAULT 0 NOT NULL,
	`transcripcion` text,
	`propuesta` text,
	`error` text,
	`audio_borrar_en` integer,
	`audio_borrado_at` integer,
	`procesada_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`psicologo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`consultante_id`) REFERENCES `consultantes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grabaciones_cita_unique_idx` ON `grabaciones_sesion` (`cita_id`);--> statement-breakpoint
CREATE INDEX `grabaciones_borrar_idx` ON `grabaciones_sesion` (`audio_borrar_en`);--> statement-breakpoint
ALTER TABLE `consultantes` ADD `consentimiento_grabacion_at` integer;