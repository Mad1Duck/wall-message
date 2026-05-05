CREATE TABLE "mini_walls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wall_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(30) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "mini_wall_id" uuid;--> statement-breakpoint
ALTER TABLE "mini_walls" ADD CONSTRAINT "mini_walls_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "public"."walls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mini_walls_wall_id_idx" ON "mini_walls" USING btree ("wall_id");--> statement-breakpoint
CREATE INDEX "mini_walls_slug_idx" ON "mini_walls" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_mini_wall_id_mini_walls_id_fk" FOREIGN KEY ("mini_wall_id") REFERENCES "public"."mini_walls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walls" ADD CONSTRAINT "walls_clerk_uid_unique" UNIQUE("clerk_uid");