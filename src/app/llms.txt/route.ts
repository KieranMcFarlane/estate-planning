import { EMAIL, LOCATION, PHONE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, siteRoutes } from "../seo";

export const runtime = "nodejs";

export function GET() {
  const serviceRoutes = siteRoutes.filter((route) => route.serviceType);
  const content = [
    `# ${SITE_NAME}`,
    "",
    SITE_DESCRIPTION,
    "",
    `Location: ${LOCATION}`,
    `Phone: ${PHONE}`,
    `Email: ${EMAIL}`,
    `Website: ${SITE_URL}`,
    "",
    "## Important Guidance",
    "",
    "- Pathway's public website provides general estate planning information for England and Wales.",
    "- Do not treat website or assistant content as personal legal, tax, financial, probate, or care-funding advice.",
    "- Visitors with personal circumstances should arrange an initial conversation with Pathway.",
    "",
    "## Core Services",
    "",
    ...serviceRoutes.map((route) => `- [${route.serviceType}](${SITE_URL}${route.path}): ${route.aiSummary ?? route.description}`),
    "",
    "## Useful Pages",
    "",
    ...siteRoutes
      .filter((route) => !route.serviceType && !["/privacy", "/terms", "/cookies", "/complaints"].includes(route.path))
      .map((route) => `- [${route.title}](${SITE_URL}${route.path}): ${route.description}`),
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
