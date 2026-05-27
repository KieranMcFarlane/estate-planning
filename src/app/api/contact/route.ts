import { redirect } from "next/navigation";
import { captureEstateLead } from "../_lib/twenty";

export const runtime = "nodejs";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const pageUrl = request.headers.get("referer") ?? "";

  const result = await captureEstateLead({
    source: "contact_form",
    name: value(formData, "name"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    company: value(formData, "company"),
    message: value(formData, "message"),
    pageUrl,
  });

  const status = result.crm.status === "created" ? "sent" : "saved";
  redirect(`/contact?enquiry=${status}`);
}
