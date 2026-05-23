type StructuredDataProps = {
  data: Record<string, unknown>;
};

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
