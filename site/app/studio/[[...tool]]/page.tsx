/**
 * Rota /studio — Sanity Studio embutido.
 * Painel de gestão de todo o conteúdo, no mesmo deploy do portfólio.
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
