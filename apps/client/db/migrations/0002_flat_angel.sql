PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`input` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`synced_at` integer,
	`sync_version` integer
);
--> statement-breakpoint
INSERT INTO `__new_people`("id", "name", "description", "input", "created_at", "updated_at", "deleted_at", "synced_at", "sync_version") SELECT "id", "name", "description", COALESCE("input", ""), "created_at", "updated_at", "deleted_at", "synced_at", "sync_version" FROM `people`;--> statement-breakpoint
DROP TABLE `people`;--> statement-breakpoint
ALTER TABLE `__new_people` RENAME TO `people`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `people_created_at_idx` ON `people` (`created_at`);--> statement-breakpoint
CREATE INDEX `people_name_idx` ON `people` (`name`);--> statement-breakpoint
CREATE INDEX `people_deleted_at_idx` ON `people` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `people_synced_at_idx` ON `people` (`synced_at`);