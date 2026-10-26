CREATE TABLE `notas_sesion_versiones` (
	`id` text PRIMARY KEY NOT NULL,
	`nota_id` text NOT NULL,
	`version` integer NOT NULL,
	`subjetivo` text,
	`objetivo` text,
	`analisis` text,
	`plan` text,
	`estado_animo` integer,
	`nivel_riesgo` text NOT NULL,
	`tareas_asignadas` text,
	`observaciones` text,
	`origen` text DEFAULT 'manual' NOT NULL,
	`editado_por` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`nota_id`) REFERENCES `notas_sesion`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`editado_por`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notas_versiones_nota_version_idx` ON `notas_sesion_versiones` (`nota_id`,`version`);--> statement-breakpoint
ALTER TABLE `notas_sesion` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `notas_sesion` ADD `editada_at` integer;