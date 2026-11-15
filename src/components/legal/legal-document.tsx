import type { Metadata } from "next";
import { LegalTabs } from "@/components/legal/legal-tabs";
import { LegalToc } from "@/components/legal/legal-toc";
import { LEGAL_CONTACT, LEGAL_DOCS, type LegalSlug } from "@/lib/legal/documents";
import { formatDate } from "@/lib/utils";

export function legalMetadata(slug: LegalSlug): Metadata {
  const doc = LEGAL_DOCS[slug];
  return { title: doc.title, description: doc.summary };
}

/** Full legal page: document tabs, section nav and content. Rendered by each static /legal/* route. */
export function LegalDocument({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOCS[slug];

  return (
    <>
      <LegalTabs active={slug} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <LegalToc sections={doc.sections.map(({ id, title }) => ({ id, title }))} />

        <article className="min-w-0 max-w-3xl">
          <header className="border-b border-border pb-6">
            <h1 className="text-3xl font-display">{doc.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated {formatDate(doc.updated)}</p>
            <p className="mt-4 text-muted-foreground">{doc.summary}</p>
          </header>

          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-36 border-b border-border py-8 last:border-0">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                {section.body.map((block, i) =>
                  typeof block === "string" ? (
                    <p key={i}>{block}</p>
                  ) : (
                    <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-border">
                      {block.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}

          <p className="mt-4 text-sm text-muted-foreground">
            Questions? Email{" "}
            <a className="text-link underline" href={`mailto:${LEGAL_CONTACT.support}`}>
              {LEGAL_CONTACT.support}
            </a>
            .
          </p>
        </article>
      </div>
    </>
  );
}
