import { LegalDocument, legalMetadata } from "@/components/legal/legal-document";

export const metadata = legalMetadata("intellectual-property");

export default function Page() {
  return <LegalDocument slug="intellectual-property" />;
}
