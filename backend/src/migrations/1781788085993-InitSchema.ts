import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1781788085993 implements MigrationInterface {
    name = 'InitSchema1781788085993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "catalog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" character varying, "usage_type" character varying, "image_url" character varying, "expected_lifespan_km" real NOT NULL DEFAULT '5000', "price" real, "purchase_url" character varying, CONSTRAINT "PK_782754bded12b4e75ad4afff913" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tire_id" uuid, "source" character varying NOT NULL DEFAULT 'sensor', "strava_activity_id" bigint, "distance_km" real NOT NULL, "elevation_m" real NOT NULL DEFAULT '0', "avg_speed" real, "max_speed" real, "duration_seconds" integer, "avg_watts" real, "max_watts" integer, "calories" real, "avg_cadence" real, "avg_temp" real, "xp_earned" integer NOT NULL DEFAULT '0', "recorded_at" TIMESTAMP NOT NULL, "synced_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_83abd1ee062f671e86eed2bfa37" UNIQUE ("strava_activity_id"), CONSTRAINT "PK_9104d6654ed3ecf9170e43cf7d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tires" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "catalog_id" uuid, "installed_at" TIMESTAMP NOT NULL DEFAULT now(), "total_km" real NOT NULL DEFAULT '0', "wear_score" integer NOT NULL DEFAULT '100', "is_active" boolean NOT NULL DEFAULT true, "position" character varying, CONSTRAINT "PK_d0486c80db39eb9becdfec74546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "challenge_participants" ("challenge_id" uuid NOT NULL, "user_id" uuid NOT NULL, "contributed_km" real NOT NULL DEFAULT '0', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_931e5567a4dc157301e2912db45" PRIMARY KEY ("challenge_id", "user_id"))`);
        await queryRunner.query(`CREATE TABLE "challenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "target_km" real NOT NULL, "current_km" real NOT NULL DEFAULT '0', "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "reward_description" text, CONSTRAINT "PK_1e664e93171e20fe4d6125466af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "name" character varying NOT NULL, "avatar_url" character varying, "country" character varying, "region" character varying, "city" character varying, "strava_id" bigint, "strava_access_token" character varying, "strava_refresh_token" character varying, "strava_token_expires_at" bigint, "xp" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "level_name" character varying NOT NULL DEFAULT 'Rookie', "is_ambassador" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "best_distance_km" real NOT NULL DEFAULT '0', "best_elevation_m" real NOT NULL DEFAULT '0', "weight_kg" real, "has_completed_onboarding" boolean NOT NULL DEFAULT false, "friend_code" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_8e5e85cb0e47e3c3423ad89c3e2" UNIQUE ("strava_id"), CONSTRAINT "UQ_c10f3c55df84b51f0f6d55855e3" UNIQUE ("friend_code"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_badges" ("user_id" uuid NOT NULL, "badge_id" uuid NOT NULL, "unlocked_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_201b6e34825dc5bd06181320bde" PRIMARY KEY ("user_id", "badge_id"))`);
        await queryRunner.query(`CREATE TABLE "badges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "image_url" character varying NOT NULL, "condition_type" character varying NOT NULL, "condition_value" real NOT NULL, CONSTRAINT "PK_8a651318b8de577e8e217676466" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friendships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "friend_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a8e4ede8e2df44f3f21f557d379" UNIQUE ("user_id", "friend_id"), CONSTRAINT "PK_08af97d0be72942681757f07bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "levels" ("level" integer NOT NULL, "name" character varying NOT NULL, "xp_required" integer NOT NULL, CONSTRAINT "PK_c09b065bcc5f0a33e8a59698e46" PRIMARY KEY ("level"))`);
        await queryRunner.query(`CREATE TABLE "sensors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "position" character varying(10) NOT NULL, "label" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8bd5fcfd700e39e96bcd9ba6b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "started_at" TIMESTAMP NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, "total_km" double precision NOT NULL DEFAULT '0', "total_elevation" double precision NOT NULL DEFAULT '0', "battery_end" double precision, CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_readings" ("time" TIMESTAMP WITH TIME ZONE NOT NULL, "sensor_id" uuid NOT NULL, "ride_id" uuid NOT NULL, "pressure" double precision NOT NULL, "temperature" double precision NOT NULL, "battery_pct" double precision NOT NULL, CONSTRAINT "PK_0da302b68efbaed6882c4d3973d" PRIMARY KEY ("time", "sensor_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7483b5b6ca8f50cac249cabb8a" ON "sensor_readings"  ("ride_id") `);
        await queryRunner.query(`CREATE TABLE "ride_readings" ("time" TIMESTAMP WITH TIME ZONE NOT NULL, "ride_id" uuid NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "distance_km" double precision NOT NULL, "elevation_m" double precision NOT NULL, "duration_s" integer NOT NULL, CONSTRAINT "PK_bc9411659fe7c86b110d12a9810" PRIMARY KEY ("time", "ride_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_80389bba49115c0d972d887c93" ON "ride_readings"  ("ride_id") `);
        await queryRunner.query(`CREATE TABLE "wear_estimates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sensor_id" uuid NOT NULL, "ride_id" uuid NOT NULL, "wear_pct" double precision NOT NULL, "calculated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_518ab1adf26eb48734626bf4870" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6a27d151487a85a5a7bb08411b" ON "wear_estimates"  ("sensor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2e85c49622162822fba828e3d1" ON "wear_estimates"  ("ride_id") `);
        await queryRunner.query(`ALTER TABLE "sensor_records" ADD CONSTRAINT "FK_da69679a8e8adccb9556346d546" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sensor_records" ADD CONSTRAINT "FK_d1cc0f0d0a0784dc006001efec7" FOREIGN KEY ("tire_id") REFERENCES "tires"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tires" ADD CONSTRAINT "FK_5c18990f3cb6341aa6c84cee988" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tires" ADD CONSTRAINT "FK_8c1a090b6d087244621ff4d3bde" FOREIGN KEY ("catalog_id") REFERENCES "catalog"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_a4b4a1ca9ccc6f110d0e1037056" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_b98686bb3cea5782ee99733cfbc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "challenges" ADD CONSTRAINT "FK_1e1f02fc7bc2f3a792ecb0ad58e" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_c73eec6c7e7d5d1f2b3ce8b9002" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_972c6bdd4bc18dda48b8aa4714c" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_972c6bdd4bc18dda48b8aa4714c"`);
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_c73eec6c7e7d5d1f2b3ce8b9002"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3"`);
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_1e1f02fc7bc2f3a792ecb0ad58e"`);
        await queryRunner.query(`ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_b98686bb3cea5782ee99733cfbc"`);
        await queryRunner.query(`ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_a4b4a1ca9ccc6f110d0e1037056"`);
        await queryRunner.query(`ALTER TABLE "tires" DROP CONSTRAINT "FK_8c1a090b6d087244621ff4d3bde"`);
        await queryRunner.query(`ALTER TABLE "tires" DROP CONSTRAINT "FK_5c18990f3cb6341aa6c84cee988"`);
        await queryRunner.query(`ALTER TABLE "sensor_records" DROP CONSTRAINT "FK_d1cc0f0d0a0784dc006001efec7"`);
        await queryRunner.query(`ALTER TABLE "sensor_records" DROP CONSTRAINT "FK_da69679a8e8adccb9556346d546"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e85c49622162822fba828e3d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a27d151487a85a5a7bb08411b"`);
        await queryRunner.query(`DROP TABLE "wear_estimates"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80389bba49115c0d972d887c93"`);
        await queryRunner.query(`DROP TABLE "ride_readings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7483b5b6ca8f50cac249cabb8a"`);
        await queryRunner.query(`DROP TABLE "sensor_readings"`);
        await queryRunner.query(`DROP TABLE "rides"`);
        await queryRunner.query(`DROP TABLE "sensors"`);
        await queryRunner.query(`DROP TABLE "levels"`);
        await queryRunner.query(`DROP TABLE "friendships"`);
        await queryRunner.query(`DROP TABLE "badges"`);
        await queryRunner.query(`DROP TABLE "user_badges"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TABLE "challenge_participants"`);
        await queryRunner.query(`DROP TABLE "tires"`);
        await queryRunner.query(`DROP TABLE "sensor_records"`);
        await queryRunner.query(`DROP TABLE "catalog"`);
    }

}
