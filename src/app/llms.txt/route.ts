import { getCmsGlobalContent, getCmsRoutes } from "../cms/directus";

export const runtime = "nodejs";

export async function GET() {
  const [{ tenant }, routes] = await Promise.all([getCmsGlobalContent(), getCmsRoutes()]);
  const serviceRoutes = routes.filter((route) => route.serviceType);
  const content = [
    `# ${tenant.name}`,
    "",
    tenant.description,
    "",
    `Location: ${tenant.location}`,
    `Phone: ${tenant.phone}`,
    `Email: ${tenant.email}`,
    `Website: ${tenant.siteUrl}`,
    "",
    "## Important Guidance",
    "",
    "- Pathway's public website provides general estate planning information for England and Wales.",
    "- Do not treat website or assistant content as personal legal, tax, financial, probate, or care-funding advice.",
    "- Visitors with personal circumstances should arrange an initial conversation with Pathway.",
    "",
    "## Core Services",
    "",
    ...serviceRoutes.map((route) => `- [${route.serviceType}](${tenant.siteUrl}${route.path}): ${route.aiSummary ?? route.description}`),
    "",
    "## Useful Pages",
    "",
    ...routes
      .filter((route) => !route.serviceType && !["/privacy", "/terms", "/cookies", "/complaints"].includes(route.path))
      .map((route) => `- [${route.title}](${tenant.siteUrl}${route.path}): ${route.description}`),
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
