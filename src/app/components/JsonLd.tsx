type JsonLdProps = {
  data: unknown | unknown[];
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]).replace(/</g, "\\u003c"),
      }}
    />
  );
}
