import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_on_siparisler_status" AS ENUM('yeni', 'arandi', 'kapora', 'vazgecti', 'ulasilamadi');
  CREATE TYPE "public"."enum_on_siparis_olaylari_type" AS ENUM('view', 'click', 'submit');
  CREATE TABLE "on_siparisler" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"city" varchar,
  	"note" varchar,
  	"status" "enum_on_siparisler_status" DEFAULT 'yeni',
  	"call_note" varchar,
  	"product" varchar,
  	"queue" numeric,
  	"source" varchar,
  	"consent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "on_siparis_olaylari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_on_siparis_olaylari_type" NOT NULL,
  	"source" varchar,
  	"product" varchar,
  	"day" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "on_siparis_sayfasi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"open" boolean DEFAULT true,
  	"price" varchar,
  	"price_note" varchar,
  	"lead_time" varchar DEFAULT 'Yaklaşık 3 ay',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "on_siparisler_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "on_siparis_olaylari_id" integer;
  CREATE INDEX "on_siparisler_updated_at_idx" ON "on_siparisler" USING btree ("updated_at");
  CREATE INDEX "on_siparisler_created_at_idx" ON "on_siparisler" USING btree ("created_at");
  CREATE INDEX "on_siparis_olaylari_day_idx" ON "on_siparis_olaylari" USING btree ("day");
  CREATE INDEX "on_siparis_olaylari_updated_at_idx" ON "on_siparis_olaylari" USING btree ("updated_at");
  CREATE INDEX "on_siparis_olaylari_created_at_idx" ON "on_siparis_olaylari" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_on_siparisler_fk" FOREIGN KEY ("on_siparisler_id") REFERENCES "public"."on_siparisler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_on_siparis_olaylari_fk" FOREIGN KEY ("on_siparis_olaylari_id") REFERENCES "public"."on_siparis_olaylari"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_on_siparisler_id_idx" ON "payload_locked_documents_rels" USING btree ("on_siparisler_id");
  CREATE INDEX "payload_locked_documents_rels_on_siparis_olaylari_id_idx" ON "payload_locked_documents_rels" USING btree ("on_siparis_olaylari_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "on_siparisler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "on_siparis_olaylari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "on_siparis_sayfasi" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "on_siparisler" CASCADE;
  DROP TABLE "on_siparis_olaylari" CASCADE;
  DROP TABLE "on_siparis_sayfasi" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_on_siparisler_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_on_siparis_olaylari_fk";
  
  DROP INDEX "payload_locked_documents_rels_on_siparisler_id_idx";
  DROP INDEX "payload_locked_documents_rels_on_siparis_olaylari_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "on_siparisler_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "on_siparis_olaylari_id";
  DROP TYPE "public"."enum_on_siparisler_status";
  DROP TYPE "public"."enum_on_siparis_olaylari_type";`)
}
