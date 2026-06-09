import Link from "next/link";
import {Activity, CalendarDays, Database, FileText, MessageSquare, ShieldCheck, UsersRound} from "lucide-react";
import styles from "./page.module.css";

const statusItems = [
  {label: "Public app", value: "Online", tone: "ready"},
  {label: "Conversation agent", value: "Connected", tone: "ready"},
  {label: "Twenty handoff", value: "Active", tone: "ready"},
  {label: "Directus", value: "Manual setup", tone: "manual"},
  {label: "Cal", value: "Owner needed", tone: "blocked"},
];

const workstreams = [
  {
    title: "Lead conversations",
    body: "Review recent planning chats, handoff state, and follow-up context.",
    href: "/chat",
    action: "Open chat",
    icon: MessageSquare,
  },
  {
    title: "CRM workspace",
    body: "Estate lead records and notes are linked to the Twenty workspace.",
    href: "https://crm.nakanodigital.com",
    action: "Open CRM",
    icon: UsersRound,
  },
  {
    title: "Content workspace",
    body: "Directus tenant role and content folder are managed from Nakano Admin.",
    href: "https://cms.nakanodigital.com/admin",
    action: "Open CMS",
    icon: FileText,
  },
  {
    title: "Booking workspace",
    body: "Cal.diy will become the tenant scheduling room after owner setup.",
    href: "https://cal.nakanodigital.com",
    action: "Open booking",
    icon: CalendarDays,
  },
];

const serviceRows = [
  ["Route", "estate.nakanodigital.com/operator", "Allowlisted"],
  ["Runtime", "estate-planning.service", "Managed"],
  ["Agent", "parlant-estate.service", "Observed"],
  ["Fallback leads", "data/leads", "Enabled"],
  ["Twenty API", "pathways_leads", "Configured"],
];

export default function EstateOperatorPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.header}>
        <div>
          <p className={styles.kicker}>Pathway Estate Planning</p>
          <h1>Tenant Operator</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/chat">Conversation</Link>
          <a href="https://crm.nakanodigital.com">Twenty</a>
        </div>
      </section>

      <section className={styles.statusGrid} aria-label="Workspace status">
        {statusItems.map(item => (
          <article className={styles.statusItem} data-tone={item.tone} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.layout}>
        <div className={styles.primary}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Workstreams</p>
              <h2>Client operations</h2>
            </div>
            <ShieldCheck aria-hidden="true" />
          </div>

          <div className={styles.workstreamGrid}>
            {workstreams.map(item => {
              const Icon = item.icon;
              return (
                <article className={styles.workstream} key={item.title}>
                  <div className={styles.workstreamIcon}>
                    <Icon aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <a href={item.href}>{item.action}</a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Runtime</p>
              <h2>Service map</h2>
            </div>
            <Activity aria-hidden="true" />
          </div>
          <dl className={styles.serviceList}>
            {serviceRows.map(([label, value, state]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <span>{value}</span>
                  <strong>{state}</strong>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className={styles.footerBand}>
        <div>
          <Database aria-hidden="true" />
          <p>Manifest source: estate tenant runtime, managed by Nakano Admin.</p>
        </div>
        <a href="https://admin.nakanodigital.com/operator/admin">Platform admin</a>
      </section>
    </main>
  );
}
