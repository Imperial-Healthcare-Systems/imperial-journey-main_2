import { notFound } from "next/navigation";
import RenderStage from "./RenderStage";

/**
 * Dev-only page used to bake the space → Earth sequence into a video,
 * frame by frame (see scripts/render-intro.js). Not available in production.
 */
export default function IntroRenderPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <RenderStage />;
}
