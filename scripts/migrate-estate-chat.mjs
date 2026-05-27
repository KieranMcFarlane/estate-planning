import { readFileSync, existsSync } from "node:fs";
import postgres from "postgres";

function loadDotEnv() {
  if (!existsSync(".env")) return;
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const databaseUrl = process.env.ESTATE_DATABASE_URL;

if (!databaseUrl) {
  console.error("ESTATE_DATABASE_URL is required. Refusing to use DATABASE_URL for estate chat persistence.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

await sql.begin(async (tx) => {
  await tx`
    create table if not exists estate_chat_sessions (
      id text primary key,
      anonymous_visitor_id text not null,
      title text not null default 'Pathway chat',
      source_page text not null default '',
      archived boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await tx`
    create table if not exists estate_chat_messages (
      id text primary key,
      session_id text not null references estate_chat_sessions(id) on delete cascade,
      role text not null check (role in ('system', 'user', 'assistant')),
      parts jsonb not null,
      created_at timestamptz not null default now()
    )
  `;

  await tx`
    create index if not exists estate_chat_messages_session_created_idx
    on estate_chat_messages (session_id, created_at)
  `;

  await tx`
    create table if not exists estate_chat_handoffs (
      id text primary key,
      session_id text references estate_chat_sessions(id) on delete set null,
      name text not null default '',
      email text not null default '',
      phone text not null default '',
      message text not null default '',
      page_url text not null default '',
      twenty_person_id text,
      twenty_note_id text,
      crm_status text not null,
      crm_reason text,
      created_at timestamptz not null default now()
    )
  `;

  await tx`
    create index if not exists estate_chat_handoffs_session_created_idx
    on estate_chat_handoffs (session_id, created_at)
  `;

  await tx`
    create table if not exists estate_rate_limit_events (
      id bigserial primary key,
      bucket_key text not null,
      created_at timestamptz not null default now()
    )
  `;

  await tx`
    create index if not exists estate_rate_limit_events_bucket_created_idx
    on estate_rate_limit_events (bucket_key, created_at)
  `;
});

await sql.end();

console.log("Estate chat database migration complete.");
