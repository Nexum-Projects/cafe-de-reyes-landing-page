import { getPublicLandingContent } from "@/app/actions/public-content";
import { PublicLanding } from "@/components/landing/public-landing";

export default async function Home() {
  const { data, error } = await getPublicLandingContent();

  return <PublicLanding content={data} warning={error} />;
}
