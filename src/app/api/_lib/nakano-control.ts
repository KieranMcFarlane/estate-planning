import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

type CrmResult = {
  status: string;
  personId?: string;
  noteId?: string;
  reason?: string;
};

type LeadCaptureInput = {
  id: string;
  source: string;
  contact: {
    name: string;
    phone: string;
    email: string;
    company: string;
  };
  message: string;
  pageUrl: string;
  chatId: string;
  crm: CrmResult;
};

type LeadSummaryInput = {
  id: string;
  source: string;
  personId: string;
  noteId: string;
  noteTargetId: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  pageUrl: string;
  chatId: string;
  message: string;
};

type HermesResult = {
  status: "accepted" | "skipped" | "failed";
  reason?: string;
  output?: string;
  response?: unknown;
  httpStatus?: number;
};

let sqlClient: Sql | null = null;

const TENANT_ID = process.env.NAKANO_CONTROL_TENANT_ID || "estate-planning";
const WORKFLOW_ID = "lead-intake-hermes-followup";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function controlSql() {
  const url = clean(process.env.NAKANO_ADMIN_DATABASE_URL);
  if (!url) return null;
  sqlClient ??= postgres(url, { max: 1, idle_timeout: 5 });
  return sqlClient;
}

function isSmoke(...values: unknown[]) {
  return values.some((value) => /\b(smoke|test|safe to delete)\b/i.test(clean(value)));
}

function runIdFromHermes(hermes: HermesResult) {
  if (!hermes.response || typeof hermes.response !== "object") return "";
  const record = hermes.response as Record<string, unknown>;
  return clean(record.run_id) || clean(record.runId);
}

async function insertAudit(sql: Sql, eventType: string, payload: Record<string, unknown>) {
  await sql`
    insert into audit_events (tenant_id, actor_user_id, event_type, payload)
    values (${TENANT_ID}, null, ${eventType}, ${sql.json(payload as postgres.JSONValue)})
  `;
}

export async function recordControlLeadCapture(input: LeadCaptureInput) {
  const sql = controlSql();
  if (!sql) return { status: "skipped", reason: "NAKANO_ADMIN_DATABASE_URL is not configured" };

  try {
    const status = input.crm.status === "created" ? "crm_created" : `crm_${input.crm.status}`;
    const smoke = isSmoke(input.id, input.contact.email, input.message, input.pageUrl, input.chatId);
    const rows = await sql`
      insert into lead_workflow_events (
        tenant_id, workflow_id, lead_id, source, status, contact, message,
        page_url, chat_id, crm_person_id, crm_note_id, error, is_smoke
      )
      values (
        ${TENANT_ID}, ${WORKFLOW_ID}, ${input.id}, ${input.source}, ${status},
        ${sql.json(input.contact as postgres.JSONValue)}, ${input.message || null}, ${input.pageUrl || null},
        ${input.chatId || null}, ${input.crm.personId || null}, ${input.crm.noteId || null},
        ${input.crm.reason || null}, ${smoke}
      )
      on conflict (lead_id) do update set
        source = excluded.source,
        status = excluded.status,
        contact = excluded.contact,
        message = excluded.message,
        page_url = excluded.page_url,
        chat_id = excluded.chat_id,
        crm_person_id = excluded.crm_person_id,
        crm_note_id = excluded.crm_note_id,
        error = excluded.error,
        is_smoke = excluded.is_smoke,
        updated_at = now()
      returning id
    `;

    await insertAudit(sql, "workflow.lead_intake.captured", {
      eventId: rows[0]?.id,
      leadId: input.id,
      source: input.source,
      crmStatus: input.crm.status,
      personId: input.crm.personId,
      noteId: input.crm.noteId,
      isSmoke: smoke,
    });
    return { status: "recorded", eventId: rows[0]?.id };
  } catch (error) {
    console.error("Nakano Control lead capture recording failed", error);
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown Control DB error" };
  }
}

export async function recordControlLeadStrategy(summary: LeadSummaryInput, hermes: HermesResult) {
  const sql = controlSql();
  if (!sql) return { status: "skipped", reason: "NAKANO_ADMIN_DATABASE_URL is not configured" };

  try {
    const smoke = isSmoke(summary.id, summary.contact.email, summary.message, summary.pageUrl, summary.chatId);
    const hermesRunId = runIdFromHermes(hermes);
    const status =
      hermes.status === "accepted" && clean(hermes.output)
        ? "approval_pending"
        : hermes.status === "accepted"
          ? "hermes_accepted"
          : `hermes_${hermes.status}`;

    const rows = await sql`
      insert into lead_workflow_events (
        tenant_id, workflow_id, summary_id, source, status, contact, message,
        page_url, chat_id, crm_person_id, crm_note_id, crm_note_target_id,
        hermes_run_id, hermes_output, error, is_smoke
      )
      values (
        ${TENANT_ID}, ${WORKFLOW_ID}, ${summary.id}, ${summary.source || "assistant_handoff"},
        ${status}, ${sql.json(summary.contact as postgres.JSONValue)}, ${summary.message || null},
        ${summary.pageUrl || null}, ${summary.chatId || null}, ${summary.personId || null},
        ${summary.noteId || null}, ${summary.noteTargetId || null}, ${hermesRunId || null},
        ${clean(hermes.output) || null}, ${hermes.reason || null}, ${smoke}
      )
      on conflict (tenant_id, crm_note_id) where crm_note_id is not null do update set
        summary_id = coalesce(lead_workflow_events.summary_id, excluded.summary_id),
        source = excluded.source,
        status = excluded.status,
        contact = excluded.contact,
        message = excluded.message,
        page_url = excluded.page_url,
        chat_id = excluded.chat_id,
        crm_person_id = excluded.crm_person_id,
        crm_note_target_id = excluded.crm_note_target_id,
        hermes_run_id = excluded.hermes_run_id,
        hermes_output = excluded.hermes_output,
        error = excluded.error,
        is_smoke = excluded.is_smoke,
        updated_at = now()
      returning id, approval_id
    `;

    const event = rows[0];
    let approvalId = event?.approval_id ?? null;

    if (event && !approvalId && hermes.status === "accepted" && clean(hermes.output)) {
      const approvalRows = await sql`
        insert into workflow_approvals (workflow_id, tenant_id, title, payload)
        values (
          ${WORKFLOW_ID},
          ${TENANT_ID},
          'Approve lead follow-up draft',
          ${sql.json({
            leadWorkflowEventId: event.id,
            summaryId: summary.id,
            source: summary.source,
            contact: summary.contact,
            message: summary.message,
            pageUrl: summary.pageUrl,
            chatId: summary.chatId,
            crm: {
              personId: summary.personId,
              noteId: summary.noteId,
              noteTargetId: summary.noteTargetId,
            },
            hermes: {
              runId: hermesRunId,
              output: clean(hermes.output),
            },
            policy: "Draft only. Owner approval is required before any outbound client-visible action.",
            smoke,
          } as postgres.JSONValue)}
        )
        returning id
      `;
      approvalId = approvalRows[0]?.id ?? null;
      await sql`
        update lead_workflow_events
        set approval_id = ${approvalId}, status = 'approval_pending', updated_at = now()
        where id = ${event.id}
      `;
    }

    await insertAudit(sql, approvalId ? "workflow.lead_intake.approval_created" : "workflow.lead_intake.strategy_recorded", {
      eventId: event?.id,
      approvalId,
      summaryId: summary.id,
      hermesStatus: hermes.status,
      hermesRunId,
      isSmoke: smoke,
    });

    return { status: "recorded", eventId: event?.id, approvalId };
  } catch (error) {
    console.error("Nakano Control lead strategy recording failed", error);
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown Control DB error" };
  }
}
