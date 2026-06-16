import Link from "next/link";
import { getCmsBlogPosts, getCmsGlobalContent } from "../cms/directus";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  if (!value) return "Published";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export async function generateMetadata() {
  const global = await getCmsGlobalContent();
  return {
    title: `Estate planning articles | ${global.tenant.name}`,
    description: "Plain-English estate planning articles from Pathway Estate Planning.",
  };
}

export default async function BlogPage() {
  const [posts, global] = await Promise.all([getCmsBlogPosts(), getCmsGlobalContent()]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link className={styles.backLink} href="/">Pathway Estate Planning</Link>
        <p className={styles.eyebrow}>Estate planning articles</p>
        <h1>Plain-English guidance for planning ahead.</h1>
        <p>
          Practical notes from {global.tenant.name}, backed by the tenant Directus CMS and ready for
          newsletter, social draft, and video proof workflows.
        </p>
      </section>

      <section className={styles.list} aria-label="Blog posts">
        {posts.map((post) => (
          <article className={styles.card} key={post.id}>
            <time>{formatDate(post.publishedAt)}</time>
            <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.excerpt}</p>
            <div className={styles.tags}>
              {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </article>
        ))}
        {posts.length === 0 ? (
          <article className={styles.card}>
            <h2>No articles are published yet</h2>
            <p>The Pathway CMS is connected, but there are no published blog posts ready to show.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
