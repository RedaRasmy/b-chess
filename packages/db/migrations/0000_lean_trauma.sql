CREATE TYPE "public"."color" AS ENUM('w', 'b');--> statement-breakpoint
CREATE TYPE "public"."gameover_reason" AS ENUM('Checkmate', 'Timeout', 'Fifty moves rule', 'Insufficient material', 'Stalemate', 'Threefold repetition', 'Resignation', 'Agreement');--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('draw', 'white_won', 'black_won');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('matching', 'preparing', 'playing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."timer_option" AS ENUM('bullet 1+0', 'bullet 2+1', 'blitz 3+0', 'blitz 3+2', 'blitz 5+0', 'blitz 5+3', 'rapid 10+0', 'rapid 10+5', 'rapid 15+10');--> statement-breakpoint
CREATE TYPE "public"."piece" AS ENUM('q', 'r', 'n', 'b', 'k', 'p');--> statement-breakpoint
CREATE TYPE "public"."promotion_piece" AS ENUM('q', 'r', 'n', 'b');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"white_id" text NOT NULL,
	"black_id" text,
	"current_fen" text DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' NOT NULL,
	"result" "result",
	"game_over_reason" "gameover_reason",
	"status" "status" DEFAULT 'matching' NOT NULL,
	"timer" timer_option NOT NULL,
	"current_turn" "color" DEFAULT 'w' NOT NULL,
	"white_time_left" integer NOT NULL,
	"black_time_left" integer NOT NULL,
	"last_move_at" bigint,
	"game_started_at" bigint,
	"white_ready" boolean DEFAULT false NOT NULL,
	"black_ready" boolean DEFAULT false NOT NULL,
	"request_draw" "color",
	"requested_draw_at" timestamp,
	"white_rating" integer NOT NULL,
	"min_rating" integer NOT NULL,
	"max_rating" integer NOT NULL,
	"black_rating" integer,
	"white_elo_diff" integer,
	"black_elo_diff" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fen_after" text NOT NULL,
	"game_id" uuid NOT NULL,
	"from" varchar(2) NOT NULL,
	"to" varchar(2) NOT NULL,
	"promotion" "promotion_piece",
	"player_color" "color" NOT NULL,
	"piece" "piece" NOT NULL,
	"captured_piece" "piece",
	"is_check" boolean DEFAULT false NOT NULL,
	"move_time" integer NOT NULL,
	"san" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_white_id_user_id_fk" FOREIGN KEY ("white_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_black_id_user_id_fk" FOREIGN KEY ("black_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "stats_user_id_index" ON "user_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "move_game_id_index" ON "moves" USING btree ("game_id");