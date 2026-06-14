import PathwaysExportHome from "./components/PathwaysExportHome";
import { getCmsPage } from "./cms/directus";

export default async function Home() {
  const page = await getCmsPage("/");
  return <PathwaysExportHome page={page} />;
}
