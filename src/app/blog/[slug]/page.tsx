import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsBlogPost, getCmsGlobalContent } from "../../cms/directus";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  if (!value) return "Published";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [post, global] = await Promise.all([getCmsBlogPost(slug), getCmsGlobalContent()]);
  if (!post) return { title: `Article | ${global.tenant.name}` };
  return {
    title: `${post.title} | ${global.tenant.name}`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getCmsBlogPost(slug);
  if (!post) notFound();

  return (
    <main className={`${styles.page} ${styles.articlePage}`}>
      <section className={styles.hero}>
        <Link className={styles.backLink} href="/blog">Back to articles</Link>
        <p className={styles.eyebrow}>{formatDate(post.publishedAt)} / {post.author}</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className={styles.tags}>
          {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </section>

      <article className={styles.article}>
        {post.body.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>

      <section className={styles.cta}>
        <h2>Need help making this practical?</h2>
        <p>Use the chat or booking route to ask a general question or request an initial conversation.</p>
        <Link href="/contact">Start with an initial chat</Link>
      </section>
    </main>
  );
}
