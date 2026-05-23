import type { Metadata } from "next";

import { getPublicLandingContent } from "@/app/actions/public-content";
import { PublicLanding } from "@/components/landing/public-landing";
import { StructuredData } from "@/components/seo/structured-data";
import { buildLandingMetadata, buildLocalBusinessJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getPublicLandingContent();

  return buildLandingMetadata(data);
}

export default async function Home() {
  const { data, error } = await getPublicLandingContent();
  const structuredData = buildLocalBusinessJsonLd(data);

  return (
    <>
      <StructuredData data={structuredData} />
      <PublicLanding content={data} warning={error} />
    </>
  );
}
