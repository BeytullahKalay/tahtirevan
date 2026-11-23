import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_pieces_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pieces_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pieces_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__studies_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_fabrics_name_status" AS ENUM('final', 'provisional');
  CREATE TYPE "public"."enum_fabrics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fabrics_v_version_name_status" AS ENUM('final', 'provisional');
  CREATE TYPE "public"."enum__fabrics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fabrics_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_piece_collections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__piece_collections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__piece_collections_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_pattern_codes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pattern_codes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pattern_codes_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_signups_lang" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_site_status_mode" AS ENUM('live', 'soon', 'maintenance');
  CREATE TABLE "pieces_techniques" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pieces_techniques_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pieces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"collection_id" integer,
  	"type_id" integer,
  	"fabric_id" integer,
  	"photo_id" integer,
  	"model_id" integer,
  	"wood_id" integer,
  	"finish_id" integer,
  	"dims_w" numeric,
  	"dims_d" numeric,
  	"dims_h" numeric,
  	"dims_seat" numeric,
  	"weight_kg" numeric,
  	"hours" numeric,
  	"lead_weeks_min" numeric,
  	"lead_weeks_max" numeric,
  	"featured" boolean,
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pieces_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pieces_locales" (
  	"name" varchar,
  	"story" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pieces_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"woods_id" integer
  );
  
  CREATE TABLE "_pieces_v_version_techniques" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pieces_v_version_techniques_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pieces_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_collection_id" integer,
  	"version_type_id" integer,
  	"version_fabric_id" integer,
  	"version_photo_id" integer,
  	"version_model_id" integer,
  	"version_wood_id" integer,
  	"version_finish_id" integer,
  	"version_dims_w" numeric,
  	"version_dims_d" numeric,
  	"version_dims_h" numeric,
  	"version_dims_seat" numeric,
  	"version_weight_kg" numeric,
  	"version_hours" numeric,
  	"version_lead_weeks_min" numeric,
  	"version_lead_weeks_max" numeric,
  	"version_featured" boolean,
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pieces_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pieces_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pieces_v_locales" (
  	"version_name" varchar,
  	"version_story" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pieces_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"woods_id" integer
  );
  
  CREATE TABLE "studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"fabric_id" integer,
  	"featured" boolean,
  	"image_id" integer,
  	"video_id" integer,
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "studies_locales" (
  	"name" varchar,
  	"line" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_fabric_id" integer,
  	"version_featured" boolean,
  	"version_image_id" integer,
  	"version_video_id" integer,
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__studies_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_studies_v_locales" (
  	"version_name" varchar,
  	"version_line" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "fabrics_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar
  );
  
  CREATE TABLE "fabrics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"pattern_code_id" integer,
  	"image_id" integer,
  	"velvet" varchar,
  	"name_status" "enum_fabrics_name_status" DEFAULT 'final',
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_fabrics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "fabrics_locales" (
  	"name" varchar,
  	"motif" varchar,
  	"color_notes" varchar,
  	"scale" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "fabrics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"piece_types_id" integer
  );
  
  CREATE TABLE "_fabrics_v_version_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"color" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_fabrics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_pattern_code_id" integer,
  	"version_image_id" integer,
  	"version_velvet" varchar,
  	"version_name_status" "enum__fabrics_v_version_name_status" DEFAULT 'final',
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__fabrics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__fabrics_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_fabrics_v_locales" (
  	"version_name" varchar,
  	"version_motif" varchar,
  	"version_color_notes" varchar,
  	"version_scale" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_fabrics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"piece_types_id" integer
  );
  
  CREATE TABLE "piece_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"code_id" integer,
  	"featured" boolean,
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_piece_collections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "piece_collections_locales" (
  	"name" varchar,
  	"stop" varchar,
  	"line" varchar,
  	"intro" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_piece_collections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_code_id" integer,
  	"version_featured" boolean,
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__piece_collections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__piece_collections_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_piece_collections_v_locales" (
  	"version_name" varchar,
  	"version_stop" varchar,
  	"version_line" varchar,
  	"version_intro" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pattern_codes_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar
  );
  
  CREATE TABLE "pattern_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"lead_fabric_id" integer,
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pattern_codes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pattern_codes_locales" (
  	"name" varchar,
  	"line" varchar,
  	"description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pattern_codes_v_version_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"color" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pattern_codes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_lead_fabric_id" integer,
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pattern_codes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pattern_codes_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pattern_codes_v_locales" (
  	"version_name" varchar,
  	"version_line" varchar,
  	"version_description" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "piece_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "piece_types_locales" (
  	"name" varchar NOT NULL,
  	"plural" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "woods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "woods_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "finishes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "finishes_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sizes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sizes_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "fabric_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_tex_url" varchar,
  	"sizes_tex_width" numeric,
  	"sizes_tex_height" numeric,
  	"sizes_tex_mime_type" varchar,
  	"sizes_tex_filesize" numeric,
  	"sizes_tex_filename" varchar,
  	"sizes_swatch_url" varchar,
  	"sizes_swatch_width" numeric,
  	"sizes_swatch_height" numeric,
  	"sizes_swatch_mime_type" varchar,
  	"sizes_swatch_filesize" numeric,
  	"sizes_swatch_filename" varchar,
  	"sizes_tile_url" varchar,
  	"sizes_tile_width" numeric,
  	"sizes_tile_height" numeric,
  	"sizes_tile_mime_type" varchar,
  	"sizes_tile_filesize" numeric,
  	"sizes_tile_filename" varchar
  );
  
  CREATE TABLE "fabric_images_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"preview" boolean DEFAULT false,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "videos_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"report" varchar,
  	"height_cm" numeric DEFAULT 81,
  	"back_start" numeric DEFAULT 67,
  	"prepared" boolean,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "signups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"lang" "enum_signups_lang" DEFAULT 'tr',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pieces_id" integer,
  	"studies_id" integer,
  	"fabrics_id" integer,
  	"piece_collections_id" integer,
  	"pattern_codes_id" integer,
  	"piece_types_id" integer,
  	"woods_id" integer,
  	"finishes_id" integer,
  	"sizes_id" integer,
  	"fabric_images_id" integer,
  	"media_id" integer,
  	"videos_id" integer,
  	"models_id" integer,
  	"signups_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum_site_status_mode" DEFAULT 'live' NOT NULL,
  	"soon_launch_date" timestamp(3) with time zone,
  	"soon_show_form" boolean DEFAULT true,
  	"maintenance_return_at" timestamp(3) with time zone,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_status_locales" (
  	"soon_title" varchar,
  	"soon_message" varchar,
  	"maintenance_title" varchar,
  	"maintenance_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_craft_numbers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_craft_numbers_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_fabric_id" integer NOT NULL,
  	"studio_model_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"fabrics_id" integer
  );
  
  ALTER TABLE "pieces_techniques" ADD CONSTRAINT "pieces_techniques_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pieces_techniques_locales" ADD CONSTRAINT "pieces_techniques_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pieces_techniques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_collection_id_piece_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."piece_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_type_id_piece_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."piece_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_wood_id_woods_id_fk" FOREIGN KEY ("wood_id") REFERENCES "public"."woods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces" ADD CONSTRAINT "pieces_finish_id_finishes_id_fk" FOREIGN KEY ("finish_id") REFERENCES "public"."finishes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pieces_locales" ADD CONSTRAINT "pieces_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pieces_rels" ADD CONSTRAINT "pieces_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pieces_rels" ADD CONSTRAINT "pieces_rels_woods_fk" FOREIGN KEY ("woods_id") REFERENCES "public"."woods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pieces_v_version_techniques" ADD CONSTRAINT "_pieces_v_version_techniques_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pieces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pieces_v_version_techniques_locales" ADD CONSTRAINT "_pieces_v_version_techniques_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pieces_v_version_techniques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_parent_id_pieces_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pieces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_collection_id_piece_collections_id_fk" FOREIGN KEY ("version_collection_id") REFERENCES "public"."piece_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_type_id_piece_types_id_fk" FOREIGN KEY ("version_type_id") REFERENCES "public"."piece_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_fabric_id_fabrics_id_fk" FOREIGN KEY ("version_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_model_id_models_id_fk" FOREIGN KEY ("version_model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_wood_id_woods_id_fk" FOREIGN KEY ("version_wood_id") REFERENCES "public"."woods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v" ADD CONSTRAINT "_pieces_v_version_finish_id_finishes_id_fk" FOREIGN KEY ("version_finish_id") REFERENCES "public"."finishes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pieces_v_locales" ADD CONSTRAINT "_pieces_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pieces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pieces_v_rels" ADD CONSTRAINT "_pieces_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pieces_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pieces_v_rels" ADD CONSTRAINT "_pieces_v_rels_woods_fk" FOREIGN KEY ("woods_id") REFERENCES "public"."woods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "studies" ADD CONSTRAINT "studies_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "studies" ADD CONSTRAINT "studies_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "studies" ADD CONSTRAINT "studies_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "studies_locales" ADD CONSTRAINT "studies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_studies_v" ADD CONSTRAINT "_studies_v_parent_id_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_studies_v" ADD CONSTRAINT "_studies_v_version_fabric_id_fabrics_id_fk" FOREIGN KEY ("version_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_studies_v" ADD CONSTRAINT "_studies_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_studies_v" ADD CONSTRAINT "_studies_v_version_video_id_videos_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_studies_v_locales" ADD CONSTRAINT "_studies_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fabrics_colors" ADD CONSTRAINT "fabrics_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fabrics" ADD CONSTRAINT "fabrics_pattern_code_id_pattern_codes_id_fk" FOREIGN KEY ("pattern_code_id") REFERENCES "public"."pattern_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fabrics" ADD CONSTRAINT "fabrics_image_id_fabric_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."fabric_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fabrics_locales" ADD CONSTRAINT "fabrics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fabrics_rels" ADD CONSTRAINT "fabrics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fabrics_rels" ADD CONSTRAINT "fabrics_rels_piece_types_fk" FOREIGN KEY ("piece_types_id") REFERENCES "public"."piece_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fabrics_v_version_colors" ADD CONSTRAINT "_fabrics_v_version_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fabrics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fabrics_v" ADD CONSTRAINT "_fabrics_v_parent_id_fabrics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fabrics_v" ADD CONSTRAINT "_fabrics_v_version_pattern_code_id_pattern_codes_id_fk" FOREIGN KEY ("version_pattern_code_id") REFERENCES "public"."pattern_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fabrics_v" ADD CONSTRAINT "_fabrics_v_version_image_id_fabric_images_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."fabric_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fabrics_v_locales" ADD CONSTRAINT "_fabrics_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fabrics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fabrics_v_rels" ADD CONSTRAINT "_fabrics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_fabrics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fabrics_v_rels" ADD CONSTRAINT "_fabrics_v_rels_piece_types_fk" FOREIGN KEY ("piece_types_id") REFERENCES "public"."piece_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "piece_collections" ADD CONSTRAINT "piece_collections_code_id_pattern_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."pattern_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "piece_collections_locales" ADD CONSTRAINT "piece_collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."piece_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_piece_collections_v" ADD CONSTRAINT "_piece_collections_v_parent_id_piece_collections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."piece_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_piece_collections_v" ADD CONSTRAINT "_piece_collections_v_version_code_id_pattern_codes_id_fk" FOREIGN KEY ("version_code_id") REFERENCES "public"."pattern_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_piece_collections_v_locales" ADD CONSTRAINT "_piece_collections_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_piece_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pattern_codes_colors" ADD CONSTRAINT "pattern_codes_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pattern_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pattern_codes" ADD CONSTRAINT "pattern_codes_lead_fabric_id_fabrics_id_fk" FOREIGN KEY ("lead_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pattern_codes_locales" ADD CONSTRAINT "pattern_codes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pattern_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pattern_codes_v_version_colors" ADD CONSTRAINT "_pattern_codes_v_version_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pattern_codes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pattern_codes_v" ADD CONSTRAINT "_pattern_codes_v_parent_id_pattern_codes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pattern_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pattern_codes_v" ADD CONSTRAINT "_pattern_codes_v_version_lead_fabric_id_fabrics_id_fk" FOREIGN KEY ("version_lead_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pattern_codes_v_locales" ADD CONSTRAINT "_pattern_codes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pattern_codes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "piece_types_locales" ADD CONSTRAINT "piece_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."piece_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "woods_locales" ADD CONSTRAINT "woods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."woods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finishes_locales" ADD CONSTRAINT "finishes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sizes_locales" ADD CONSTRAINT "sizes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fabric_images_locales" ADD CONSTRAINT "fabric_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fabric_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_locales" ADD CONSTRAINT "videos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pieces_fk" FOREIGN KEY ("pieces_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_studies_fk" FOREIGN KEY ("studies_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fabrics_fk" FOREIGN KEY ("fabrics_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_piece_collections_fk" FOREIGN KEY ("piece_collections_id") REFERENCES "public"."piece_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pattern_codes_fk" FOREIGN KEY ("pattern_codes_id") REFERENCES "public"."pattern_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_piece_types_fk" FOREIGN KEY ("piece_types_id") REFERENCES "public"."piece_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_woods_fk" FOREIGN KEY ("woods_id") REFERENCES "public"."woods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sizes_fk" FOREIGN KEY ("sizes_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fabric_images_fk" FOREIGN KEY ("fabric_images_id") REFERENCES "public"."fabric_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_models_fk" FOREIGN KEY ("models_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_signups_fk" FOREIGN KEY ("signups_id") REFERENCES "public"."signups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_status_locales" ADD CONSTRAINT "site_status_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_status"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_craft_numbers" ADD CONSTRAINT "site_settings_craft_numbers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_craft_numbers_locales" ADD CONSTRAINT "site_settings_craft_numbers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_craft_numbers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_fabric_id_fabrics_id_fk" FOREIGN KEY ("hero_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_studio_model_id_models_id_fk" FOREIGN KEY ("studio_model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_fabrics_fk" FOREIGN KEY ("fabrics_id") REFERENCES "public"."fabrics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pieces_techniques_order_idx" ON "pieces_techniques" USING btree ("_order");
  CREATE INDEX "pieces_techniques_parent_id_idx" ON "pieces_techniques" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pieces_techniques_locales_locale_parent_id_unique" ON "pieces_techniques_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pieces_techniques_locales_parent_id_idx" ON "pieces_techniques_locales" USING btree ("_parent_id");
  CREATE INDEX "pieces__order_idx" ON "pieces" USING btree ("_order");
  CREATE INDEX "pieces_collection_idx" ON "pieces" USING btree ("collection_id");
  CREATE INDEX "pieces_type_idx" ON "pieces" USING btree ("type_id");
  CREATE INDEX "pieces_fabric_idx" ON "pieces" USING btree ("fabric_id");
  CREATE INDEX "pieces_photo_idx" ON "pieces" USING btree ("photo_id");
  CREATE INDEX "pieces_model_idx" ON "pieces" USING btree ("model_id");
  CREATE INDEX "pieces_wood_idx" ON "pieces" USING btree ("wood_id");
  CREATE INDEX "pieces_finish_idx" ON "pieces" USING btree ("finish_id");
  CREATE UNIQUE INDEX "pieces_key_idx" ON "pieces" USING btree ("key");
  CREATE INDEX "pieces_updated_at_idx" ON "pieces" USING btree ("updated_at");
  CREATE INDEX "pieces_created_at_idx" ON "pieces" USING btree ("created_at");
  CREATE INDEX "pieces__status_idx" ON "pieces" USING btree ("_status");
  CREATE UNIQUE INDEX "pieces_locales_locale_parent_id_unique" ON "pieces_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pieces_locales_parent_id_idx" ON "pieces_locales" USING btree ("_parent_id");
  CREATE INDEX "pieces_rels_order_idx" ON "pieces_rels" USING btree ("order");
  CREATE INDEX "pieces_rels_parent_idx" ON "pieces_rels" USING btree ("parent_id");
  CREATE INDEX "pieces_rels_path_idx" ON "pieces_rels" USING btree ("path");
  CREATE INDEX "pieces_rels_woods_id_idx" ON "pieces_rels" USING btree ("woods_id");
  CREATE INDEX "_pieces_v_version_techniques_order_idx" ON "_pieces_v_version_techniques" USING btree ("_order");
  CREATE INDEX "_pieces_v_version_techniques_parent_id_idx" ON "_pieces_v_version_techniques" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pieces_v_version_techniques_locales_locale_parent_id_unique" ON "_pieces_v_version_techniques_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pieces_v_version_techniques_locales_parent_id_idx" ON "_pieces_v_version_techniques_locales" USING btree ("_parent_id");
  CREATE INDEX "_pieces_v_parent_idx" ON "_pieces_v" USING btree ("parent_id");
  CREATE INDEX "_pieces_v_version_version__order_idx" ON "_pieces_v" USING btree ("version__order");
  CREATE INDEX "_pieces_v_version_version_collection_idx" ON "_pieces_v" USING btree ("version_collection_id");
  CREATE INDEX "_pieces_v_version_version_type_idx" ON "_pieces_v" USING btree ("version_type_id");
  CREATE INDEX "_pieces_v_version_version_fabric_idx" ON "_pieces_v" USING btree ("version_fabric_id");
  CREATE INDEX "_pieces_v_version_version_photo_idx" ON "_pieces_v" USING btree ("version_photo_id");
  CREATE INDEX "_pieces_v_version_version_model_idx" ON "_pieces_v" USING btree ("version_model_id");
  CREATE INDEX "_pieces_v_version_version_wood_idx" ON "_pieces_v" USING btree ("version_wood_id");
  CREATE INDEX "_pieces_v_version_version_finish_idx" ON "_pieces_v" USING btree ("version_finish_id");
  CREATE INDEX "_pieces_v_version_version_key_idx" ON "_pieces_v" USING btree ("version_key");
  CREATE INDEX "_pieces_v_version_version_updated_at_idx" ON "_pieces_v" USING btree ("version_updated_at");
  CREATE INDEX "_pieces_v_version_version_created_at_idx" ON "_pieces_v" USING btree ("version_created_at");
  CREATE INDEX "_pieces_v_version_version__status_idx" ON "_pieces_v" USING btree ("version__status");
  CREATE INDEX "_pieces_v_created_at_idx" ON "_pieces_v" USING btree ("created_at");
  CREATE INDEX "_pieces_v_updated_at_idx" ON "_pieces_v" USING btree ("updated_at");
  CREATE INDEX "_pieces_v_snapshot_idx" ON "_pieces_v" USING btree ("snapshot");
  CREATE INDEX "_pieces_v_published_locale_idx" ON "_pieces_v" USING btree ("published_locale");
  CREATE INDEX "_pieces_v_latest_idx" ON "_pieces_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pieces_v_locales_locale_parent_id_unique" ON "_pieces_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pieces_v_locales_parent_id_idx" ON "_pieces_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pieces_v_rels_order_idx" ON "_pieces_v_rels" USING btree ("order");
  CREATE INDEX "_pieces_v_rels_parent_idx" ON "_pieces_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pieces_v_rels_path_idx" ON "_pieces_v_rels" USING btree ("path");
  CREATE INDEX "_pieces_v_rels_woods_id_idx" ON "_pieces_v_rels" USING btree ("woods_id");
  CREATE INDEX "studies__order_idx" ON "studies" USING btree ("_order");
  CREATE INDEX "studies_fabric_idx" ON "studies" USING btree ("fabric_id");
  CREATE INDEX "studies_image_idx" ON "studies" USING btree ("image_id");
  CREATE INDEX "studies_video_idx" ON "studies" USING btree ("video_id");
  CREATE UNIQUE INDEX "studies_key_idx" ON "studies" USING btree ("key");
  CREATE INDEX "studies_updated_at_idx" ON "studies" USING btree ("updated_at");
  CREATE INDEX "studies_created_at_idx" ON "studies" USING btree ("created_at");
  CREATE INDEX "studies__status_idx" ON "studies" USING btree ("_status");
  CREATE UNIQUE INDEX "studies_locales_locale_parent_id_unique" ON "studies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "studies_locales_parent_id_idx" ON "studies_locales" USING btree ("_parent_id");
  CREATE INDEX "_studies_v_parent_idx" ON "_studies_v" USING btree ("parent_id");
  CREATE INDEX "_studies_v_version_version__order_idx" ON "_studies_v" USING btree ("version__order");
  CREATE INDEX "_studies_v_version_version_fabric_idx" ON "_studies_v" USING btree ("version_fabric_id");
  CREATE INDEX "_studies_v_version_version_image_idx" ON "_studies_v" USING btree ("version_image_id");
  CREATE INDEX "_studies_v_version_version_video_idx" ON "_studies_v" USING btree ("version_video_id");
  CREATE INDEX "_studies_v_version_version_key_idx" ON "_studies_v" USING btree ("version_key");
  CREATE INDEX "_studies_v_version_version_updated_at_idx" ON "_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_studies_v_version_version_created_at_idx" ON "_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_studies_v_version_version__status_idx" ON "_studies_v" USING btree ("version__status");
  CREATE INDEX "_studies_v_created_at_idx" ON "_studies_v" USING btree ("created_at");
  CREATE INDEX "_studies_v_updated_at_idx" ON "_studies_v" USING btree ("updated_at");
  CREATE INDEX "_studies_v_snapshot_idx" ON "_studies_v" USING btree ("snapshot");
  CREATE INDEX "_studies_v_published_locale_idx" ON "_studies_v" USING btree ("published_locale");
  CREATE INDEX "_studies_v_latest_idx" ON "_studies_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_studies_v_locales_locale_parent_id_unique" ON "_studies_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_studies_v_locales_parent_id_idx" ON "_studies_v_locales" USING btree ("_parent_id");
  CREATE INDEX "fabrics_colors_order_idx" ON "fabrics_colors" USING btree ("_order");
  CREATE INDEX "fabrics_colors_parent_id_idx" ON "fabrics_colors" USING btree ("_parent_id");
  CREATE INDEX "fabrics__order_idx" ON "fabrics" USING btree ("_order");
  CREATE INDEX "fabrics_pattern_code_idx" ON "fabrics" USING btree ("pattern_code_id");
  CREATE INDEX "fabrics_image_idx" ON "fabrics" USING btree ("image_id");
  CREATE UNIQUE INDEX "fabrics_key_idx" ON "fabrics" USING btree ("key");
  CREATE INDEX "fabrics_updated_at_idx" ON "fabrics" USING btree ("updated_at");
  CREATE INDEX "fabrics_created_at_idx" ON "fabrics" USING btree ("created_at");
  CREATE INDEX "fabrics__status_idx" ON "fabrics" USING btree ("_status");
  CREATE UNIQUE INDEX "fabrics_locales_locale_parent_id_unique" ON "fabrics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "fabrics_locales_parent_id_idx" ON "fabrics_locales" USING btree ("_parent_id");
  CREATE INDEX "fabrics_rels_order_idx" ON "fabrics_rels" USING btree ("order");
  CREATE INDEX "fabrics_rels_parent_idx" ON "fabrics_rels" USING btree ("parent_id");
  CREATE INDEX "fabrics_rels_path_idx" ON "fabrics_rels" USING btree ("path");
  CREATE INDEX "fabrics_rels_piece_types_id_idx" ON "fabrics_rels" USING btree ("piece_types_id");
  CREATE INDEX "_fabrics_v_version_colors_order_idx" ON "_fabrics_v_version_colors" USING btree ("_order");
  CREATE INDEX "_fabrics_v_version_colors_parent_id_idx" ON "_fabrics_v_version_colors" USING btree ("_parent_id");
  CREATE INDEX "_fabrics_v_parent_idx" ON "_fabrics_v" USING btree ("parent_id");
  CREATE INDEX "_fabrics_v_version_version__order_idx" ON "_fabrics_v" USING btree ("version__order");
  CREATE INDEX "_fabrics_v_version_version_pattern_code_idx" ON "_fabrics_v" USING btree ("version_pattern_code_id");
  CREATE INDEX "_fabrics_v_version_version_image_idx" ON "_fabrics_v" USING btree ("version_image_id");
  CREATE INDEX "_fabrics_v_version_version_key_idx" ON "_fabrics_v" USING btree ("version_key");
  CREATE INDEX "_fabrics_v_version_version_updated_at_idx" ON "_fabrics_v" USING btree ("version_updated_at");
  CREATE INDEX "_fabrics_v_version_version_created_at_idx" ON "_fabrics_v" USING btree ("version_created_at");
  CREATE INDEX "_fabrics_v_version_version__status_idx" ON "_fabrics_v" USING btree ("version__status");
  CREATE INDEX "_fabrics_v_created_at_idx" ON "_fabrics_v" USING btree ("created_at");
  CREATE INDEX "_fabrics_v_updated_at_idx" ON "_fabrics_v" USING btree ("updated_at");
  CREATE INDEX "_fabrics_v_snapshot_idx" ON "_fabrics_v" USING btree ("snapshot");
  CREATE INDEX "_fabrics_v_published_locale_idx" ON "_fabrics_v" USING btree ("published_locale");
  CREATE INDEX "_fabrics_v_latest_idx" ON "_fabrics_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_fabrics_v_locales_locale_parent_id_unique" ON "_fabrics_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_fabrics_v_locales_parent_id_idx" ON "_fabrics_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_fabrics_v_rels_order_idx" ON "_fabrics_v_rels" USING btree ("order");
  CREATE INDEX "_fabrics_v_rels_parent_idx" ON "_fabrics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_fabrics_v_rels_path_idx" ON "_fabrics_v_rels" USING btree ("path");
  CREATE INDEX "_fabrics_v_rels_piece_types_id_idx" ON "_fabrics_v_rels" USING btree ("piece_types_id");
  CREATE INDEX "piece_collections__order_idx" ON "piece_collections" USING btree ("_order");
  CREATE INDEX "piece_collections_code_idx" ON "piece_collections" USING btree ("code_id");
  CREATE UNIQUE INDEX "piece_collections_key_idx" ON "piece_collections" USING btree ("key");
  CREATE INDEX "piece_collections_updated_at_idx" ON "piece_collections" USING btree ("updated_at");
  CREATE INDEX "piece_collections_created_at_idx" ON "piece_collections" USING btree ("created_at");
  CREATE INDEX "piece_collections__status_idx" ON "piece_collections" USING btree ("_status");
  CREATE UNIQUE INDEX "piece_collections_locales_locale_parent_id_unique" ON "piece_collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "piece_collections_locales_parent_id_idx" ON "piece_collections_locales" USING btree ("_parent_id");
  CREATE INDEX "_piece_collections_v_parent_idx" ON "_piece_collections_v" USING btree ("parent_id");
  CREATE INDEX "_piece_collections_v_version_version__order_idx" ON "_piece_collections_v" USING btree ("version__order");
  CREATE INDEX "_piece_collections_v_version_version_code_idx" ON "_piece_collections_v" USING btree ("version_code_id");
  CREATE INDEX "_piece_collections_v_version_version_key_idx" ON "_piece_collections_v" USING btree ("version_key");
  CREATE INDEX "_piece_collections_v_version_version_updated_at_idx" ON "_piece_collections_v" USING btree ("version_updated_at");
  CREATE INDEX "_piece_collections_v_version_version_created_at_idx" ON "_piece_collections_v" USING btree ("version_created_at");
  CREATE INDEX "_piece_collections_v_version_version__status_idx" ON "_piece_collections_v" USING btree ("version__status");
  CREATE INDEX "_piece_collections_v_created_at_idx" ON "_piece_collections_v" USING btree ("created_at");
  CREATE INDEX "_piece_collections_v_updated_at_idx" ON "_piece_collections_v" USING btree ("updated_at");
  CREATE INDEX "_piece_collections_v_snapshot_idx" ON "_piece_collections_v" USING btree ("snapshot");
  CREATE INDEX "_piece_collections_v_published_locale_idx" ON "_piece_collections_v" USING btree ("published_locale");
  CREATE INDEX "_piece_collections_v_latest_idx" ON "_piece_collections_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_piece_collections_v_locales_locale_parent_id_unique" ON "_piece_collections_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_piece_collections_v_locales_parent_id_idx" ON "_piece_collections_v_locales" USING btree ("_parent_id");
  CREATE INDEX "pattern_codes_colors_order_idx" ON "pattern_codes_colors" USING btree ("_order");
  CREATE INDEX "pattern_codes_colors_parent_id_idx" ON "pattern_codes_colors" USING btree ("_parent_id");
  CREATE INDEX "pattern_codes__order_idx" ON "pattern_codes" USING btree ("_order");
  CREATE INDEX "pattern_codes_lead_fabric_idx" ON "pattern_codes" USING btree ("lead_fabric_id");
  CREATE UNIQUE INDEX "pattern_codes_key_idx" ON "pattern_codes" USING btree ("key");
  CREATE INDEX "pattern_codes_updated_at_idx" ON "pattern_codes" USING btree ("updated_at");
  CREATE INDEX "pattern_codes_created_at_idx" ON "pattern_codes" USING btree ("created_at");
  CREATE INDEX "pattern_codes__status_idx" ON "pattern_codes" USING btree ("_status");
  CREATE UNIQUE INDEX "pattern_codes_locales_locale_parent_id_unique" ON "pattern_codes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pattern_codes_locales_parent_id_idx" ON "pattern_codes_locales" USING btree ("_parent_id");
  CREATE INDEX "_pattern_codes_v_version_colors_order_idx" ON "_pattern_codes_v_version_colors" USING btree ("_order");
  CREATE INDEX "_pattern_codes_v_version_colors_parent_id_idx" ON "_pattern_codes_v_version_colors" USING btree ("_parent_id");
  CREATE INDEX "_pattern_codes_v_parent_idx" ON "_pattern_codes_v" USING btree ("parent_id");
  CREATE INDEX "_pattern_codes_v_version_version__order_idx" ON "_pattern_codes_v" USING btree ("version__order");
  CREATE INDEX "_pattern_codes_v_version_version_lead_fabric_idx" ON "_pattern_codes_v" USING btree ("version_lead_fabric_id");
  CREATE INDEX "_pattern_codes_v_version_version_key_idx" ON "_pattern_codes_v" USING btree ("version_key");
  CREATE INDEX "_pattern_codes_v_version_version_updated_at_idx" ON "_pattern_codes_v" USING btree ("version_updated_at");
  CREATE INDEX "_pattern_codes_v_version_version_created_at_idx" ON "_pattern_codes_v" USING btree ("version_created_at");
  CREATE INDEX "_pattern_codes_v_version_version__status_idx" ON "_pattern_codes_v" USING btree ("version__status");
  CREATE INDEX "_pattern_codes_v_created_at_idx" ON "_pattern_codes_v" USING btree ("created_at");
  CREATE INDEX "_pattern_codes_v_updated_at_idx" ON "_pattern_codes_v" USING btree ("updated_at");
  CREATE INDEX "_pattern_codes_v_snapshot_idx" ON "_pattern_codes_v" USING btree ("snapshot");
  CREATE INDEX "_pattern_codes_v_published_locale_idx" ON "_pattern_codes_v" USING btree ("published_locale");
  CREATE INDEX "_pattern_codes_v_latest_idx" ON "_pattern_codes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pattern_codes_v_locales_locale_parent_id_unique" ON "_pattern_codes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pattern_codes_v_locales_parent_id_idx" ON "_pattern_codes_v_locales" USING btree ("_parent_id");
  CREATE INDEX "piece_types__order_idx" ON "piece_types" USING btree ("_order");
  CREATE UNIQUE INDEX "piece_types_key_idx" ON "piece_types" USING btree ("key");
  CREATE INDEX "piece_types_updated_at_idx" ON "piece_types" USING btree ("updated_at");
  CREATE INDEX "piece_types_created_at_idx" ON "piece_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "piece_types_locales_locale_parent_id_unique" ON "piece_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "piece_types_locales_parent_id_idx" ON "piece_types_locales" USING btree ("_parent_id");
  CREATE INDEX "woods__order_idx" ON "woods" USING btree ("_order");
  CREATE UNIQUE INDEX "woods_key_idx" ON "woods" USING btree ("key");
  CREATE INDEX "woods_updated_at_idx" ON "woods" USING btree ("updated_at");
  CREATE INDEX "woods_created_at_idx" ON "woods" USING btree ("created_at");
  CREATE UNIQUE INDEX "woods_locales_locale_parent_id_unique" ON "woods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "woods_locales_parent_id_idx" ON "woods_locales" USING btree ("_parent_id");
  CREATE INDEX "finishes__order_idx" ON "finishes" USING btree ("_order");
  CREATE UNIQUE INDEX "finishes_key_idx" ON "finishes" USING btree ("key");
  CREATE INDEX "finishes_updated_at_idx" ON "finishes" USING btree ("updated_at");
  CREATE INDEX "finishes_created_at_idx" ON "finishes" USING btree ("created_at");
  CREATE UNIQUE INDEX "finishes_locales_locale_parent_id_unique" ON "finishes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "finishes_locales_parent_id_idx" ON "finishes_locales" USING btree ("_parent_id");
  CREATE INDEX "sizes__order_idx" ON "sizes" USING btree ("_order");
  CREATE UNIQUE INDEX "sizes_key_idx" ON "sizes" USING btree ("key");
  CREATE INDEX "sizes_updated_at_idx" ON "sizes" USING btree ("updated_at");
  CREATE INDEX "sizes_created_at_idx" ON "sizes" USING btree ("created_at");
  CREATE UNIQUE INDEX "sizes_locales_locale_parent_id_unique" ON "sizes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sizes_locales_parent_id_idx" ON "sizes_locales" USING btree ("_parent_id");
  CREATE INDEX "fabric_images_updated_at_idx" ON "fabric_images" USING btree ("updated_at");
  CREATE INDEX "fabric_images_created_at_idx" ON "fabric_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "fabric_images_filename_idx" ON "fabric_images" USING btree ("filename");
  CREATE INDEX "fabric_images_sizes_tex_sizes_tex_filename_idx" ON "fabric_images" USING btree ("sizes_tex_filename");
  CREATE INDEX "fabric_images_sizes_swatch_sizes_swatch_filename_idx" ON "fabric_images" USING btree ("sizes_swatch_filename");
  CREATE INDEX "fabric_images_sizes_tile_sizes_tile_filename_idx" ON "fabric_images" USING btree ("sizes_tile_filename");
  CREATE UNIQUE INDEX "fabric_images_locales_locale_parent_id_unique" ON "fabric_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "fabric_images_locales_parent_id_idx" ON "fabric_images_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_filename_idx" ON "videos" USING btree ("filename");
  CREATE UNIQUE INDEX "videos_locales_locale_parent_id_unique" ON "videos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "videos_locales_parent_id_idx" ON "videos_locales" USING btree ("_parent_id");
  CREATE INDEX "models_updated_at_idx" ON "models" USING btree ("updated_at");
  CREATE INDEX "models_created_at_idx" ON "models" USING btree ("created_at");
  CREATE UNIQUE INDEX "models_filename_idx" ON "models" USING btree ("filename");
  CREATE UNIQUE INDEX "signups_email_idx" ON "signups" USING btree ("email");
  CREATE INDEX "signups_updated_at_idx" ON "signups" USING btree ("updated_at");
  CREATE INDEX "signups_created_at_idx" ON "signups" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pieces_id_idx" ON "payload_locked_documents_rels" USING btree ("pieces_id");
  CREATE INDEX "payload_locked_documents_rels_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("studies_id");
  CREATE INDEX "payload_locked_documents_rels_fabrics_id_idx" ON "payload_locked_documents_rels" USING btree ("fabrics_id");
  CREATE INDEX "payload_locked_documents_rels_piece_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("piece_collections_id");
  CREATE INDEX "payload_locked_documents_rels_pattern_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("pattern_codes_id");
  CREATE INDEX "payload_locked_documents_rels_piece_types_id_idx" ON "payload_locked_documents_rels" USING btree ("piece_types_id");
  CREATE INDEX "payload_locked_documents_rels_woods_id_idx" ON "payload_locked_documents_rels" USING btree ("woods_id");
  CREATE INDEX "payload_locked_documents_rels_finishes_id_idx" ON "payload_locked_documents_rels" USING btree ("finishes_id");
  CREATE INDEX "payload_locked_documents_rels_sizes_id_idx" ON "payload_locked_documents_rels" USING btree ("sizes_id");
  CREATE INDEX "payload_locked_documents_rels_fabric_images_id_idx" ON "payload_locked_documents_rels" USING btree ("fabric_images_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_models_id_idx" ON "payload_locked_documents_rels" USING btree ("models_id");
  CREATE INDEX "payload_locked_documents_rels_signups_id_idx" ON "payload_locked_documents_rels" USING btree ("signups_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_status_locales_locale_parent_id_unique" ON "site_status_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_status_locales_parent_id_idx" ON "site_status_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_craft_numbers_order_idx" ON "site_settings_craft_numbers" USING btree ("_order");
  CREATE INDEX "site_settings_craft_numbers_parent_id_idx" ON "site_settings_craft_numbers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_craft_numbers_locales_locale_parent_id_unique" ON "site_settings_craft_numbers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_craft_numbers_locales_parent_id_idx" ON "site_settings_craft_numbers_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_hero_hero_fabric_idx" ON "site_settings" USING btree ("hero_fabric_id");
  CREATE INDEX "site_settings_studio_studio_model_idx" ON "site_settings" USING btree ("studio_model_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_fabrics_id_idx" ON "site_settings_rels" USING btree ("fabrics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pieces_techniques" CASCADE;
  DROP TABLE "pieces_techniques_locales" CASCADE;
  DROP TABLE "pieces" CASCADE;
  DROP TABLE "pieces_locales" CASCADE;
  DROP TABLE "pieces_rels" CASCADE;
  DROP TABLE "_pieces_v_version_techniques" CASCADE;
  DROP TABLE "_pieces_v_version_techniques_locales" CASCADE;
  DROP TABLE "_pieces_v" CASCADE;
  DROP TABLE "_pieces_v_locales" CASCADE;
  DROP TABLE "_pieces_v_rels" CASCADE;
  DROP TABLE "studies" CASCADE;
  DROP TABLE "studies_locales" CASCADE;
  DROP TABLE "_studies_v" CASCADE;
  DROP TABLE "_studies_v_locales" CASCADE;
  DROP TABLE "fabrics_colors" CASCADE;
  DROP TABLE "fabrics" CASCADE;
  DROP TABLE "fabrics_locales" CASCADE;
  DROP TABLE "fabrics_rels" CASCADE;
  DROP TABLE "_fabrics_v_version_colors" CASCADE;
  DROP TABLE "_fabrics_v" CASCADE;
  DROP TABLE "_fabrics_v_locales" CASCADE;
  DROP TABLE "_fabrics_v_rels" CASCADE;
  DROP TABLE "piece_collections" CASCADE;
  DROP TABLE "piece_collections_locales" CASCADE;
  DROP TABLE "_piece_collections_v" CASCADE;
  DROP TABLE "_piece_collections_v_locales" CASCADE;
  DROP TABLE "pattern_codes_colors" CASCADE;
  DROP TABLE "pattern_codes" CASCADE;
  DROP TABLE "pattern_codes_locales" CASCADE;
  DROP TABLE "_pattern_codes_v_version_colors" CASCADE;
  DROP TABLE "_pattern_codes_v" CASCADE;
  DROP TABLE "_pattern_codes_v_locales" CASCADE;
  DROP TABLE "piece_types" CASCADE;
  DROP TABLE "piece_types_locales" CASCADE;
  DROP TABLE "woods" CASCADE;
  DROP TABLE "woods_locales" CASCADE;
  DROP TABLE "finishes" CASCADE;
  DROP TABLE "finishes_locales" CASCADE;
  DROP TABLE "sizes" CASCADE;
  DROP TABLE "sizes_locales" CASCADE;
  DROP TABLE "fabric_images" CASCADE;
  DROP TABLE "fabric_images_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "videos_locales" CASCADE;
  DROP TABLE "models" CASCADE;
  DROP TABLE "signups" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_status" CASCADE;
  DROP TABLE "site_status_locales" CASCADE;
  DROP TABLE "site_settings_craft_numbers" CASCADE;
  DROP TABLE "site_settings_craft_numbers_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pieces_status";
  DROP TYPE "public"."enum__pieces_v_version_status";
  DROP TYPE "public"."enum__pieces_v_published_locale";
  DROP TYPE "public"."enum_studies_status";
  DROP TYPE "public"."enum__studies_v_version_status";
  DROP TYPE "public"."enum__studies_v_published_locale";
  DROP TYPE "public"."enum_fabrics_name_status";
  DROP TYPE "public"."enum_fabrics_status";
  DROP TYPE "public"."enum__fabrics_v_version_name_status";
  DROP TYPE "public"."enum__fabrics_v_version_status";
  DROP TYPE "public"."enum__fabrics_v_published_locale";
  DROP TYPE "public"."enum_piece_collections_status";
  DROP TYPE "public"."enum__piece_collections_v_version_status";
  DROP TYPE "public"."enum__piece_collections_v_published_locale";
  DROP TYPE "public"."enum_pattern_codes_status";
  DROP TYPE "public"."enum__pattern_codes_v_version_status";
  DROP TYPE "public"."enum__pattern_codes_v_published_locale";
  DROP TYPE "public"."enum_signups_lang";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_site_status_mode";`)
}
