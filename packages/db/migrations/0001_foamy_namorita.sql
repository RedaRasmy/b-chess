ALTER TABLE "user_stats" DROP CONSTRAINT "user_stats_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_white_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_black_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "white_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_white_id_user_id_fk" FOREIGN KEY ("white_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_black_id_user_id_fk" FOREIGN KEY ("black_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;