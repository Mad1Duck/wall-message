CREATE TABLE "walls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_uid" varchar(255) NOT NULL,
	"username" varchar(20) NOT NULL,
	"display_name" varchar(40) NOT NULL,
	"bio" varchar(100) DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "walls_clerk_uid_unique" UNIQUE("clerk_uid"),
	CONSTRAINT "walls_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wall_id" uuid NOT NULL,
	"recipient" varchar(20) NOT NULL,
	"content" varchar(500) NOT NULL,
	"alias" varchar(100) DEFAULT 'Seseorang yang peduli 🌙' NOT NULL,
	"reply" text DEFAULT '',
	"is_public" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"react_heart" integer DEFAULT 0 NOT NULL,
	"react_fire" integer DEFAULT 0 NOT NULL,
	"react_cry" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "public"."walls"("id") ON DELETE cascade ON UPDATE no action;