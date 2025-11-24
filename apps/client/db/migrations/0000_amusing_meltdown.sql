CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`synced_at` integer,
	`sync_version` integer
);
--> statement-breakpoint
CREATE INDEX `people_created_at_idx` ON `people` (`created_at`);--> statement-breakpoint
CREATE INDEX `people_name_idx` ON `people` (`name`);--> statement-breakpoint
CREATE INDEX `people_deleted_at_idx` ON `people` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `people_synced_at_idx` ON `people` (`synced_at`);