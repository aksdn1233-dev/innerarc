import { NumberPath, SceneDivider, ThreadWeave } from "@/components/brand-visuals";
import { summarizeReviewOutcomes, type PublicReview } from "@/core/reviews";
import type { Locale } from "@/i18n/config";
import { evidenceCopy } from "@/i18n/evidence-copy";
import {
  anonymousFallbackName,
  changedActionLabels,
  reviewTypeLabels,
} from "@/i18n/review-copy";

const PRODUCT_LABEL: Record<Locale, Record<string, string>> = {
  ko: { plus_30d: "코어 리딩", pro_30d: "상세 리딩", premium_pdf: "프리미엄 심층 리딩" },
  en: { plus_30d: "Core reading", pro_30d: "Detailed reading", premium_pdf: "Premium in-depth reading" },
};

/**
 * The one place approved reviews are shown to a visitor.
 *
 * With no approved reviews it does not render an empty carousel, a greyed-out card, or
 * a "reviews coming soon" line: it renders what the product actually contains, how the
 * reading is built, and the questions buyers ask. That is real evidence, and it is what
 * the section is for until other people's words are genuinely available.
 */
export function ReviewEvidenceSection({
  locale,
  reviews,
}: {
  locale: Locale;
  reviews: readonly PublicReview[];
}) {
  const t = evidenceCopy[locale];
  const summary = summarizeReviewOutcomes(reviews);
  const hasReviews = reviews.length > 0;

  return (
    <section className="evidence-section" id="evidence" aria-labelledby="evidence-title">
      <SceneDivider className="evidence-divider" />
      <div className="section-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="evidence-title">{hasReviews ? t.reviewsTitle : t.emptyTitle}</h2>
        <p className="evidence-intro">{hasReviews ? t.reviewsIntro : t.emptyIntro}</p>
      </div>

      {hasReviews ? (
        <>
          {summary.changed > 0 && (
            <p className="evidence-outcome">
              {t.summaryChanged
                .replace("{n}", String(summary.changed))
                .replace("{total}", String(summary.total))}
            </p>
          )}
          <div className="evidence-review-grid">
            {reviews.map((review) => (
              <article className="evidence-review" key={review.id}>
                <header>
                  <span className="evidence-review-type">
                    {reviewTypeLabels[locale][review.reviewType]}
                  </span>
                  <small>
                    {review.displayName || anonymousFallbackName[locale]}
                    {review.productCode && ` · ${PRODUCT_LABEL[locale][review.productCode] ?? ""}`}
                    {review.publishedMonth && ` · ${review.publishedMonth}`}
                  </small>
                </header>
                {review.wantedToUnderstand && (
                  <p className="evidence-review-question">{review.wantedToUnderstand}</p>
                )}
                <p className="evidence-review-body">{review.mostUseful}</p>
                {review.hardToUnderstand && (
                  <p className="evidence-review-hard">{review.hardToUnderstand}</p>
                )}
                <p className="evidence-review-changed">
                  {changedActionLabels[locale][review.changedAction]}
                </p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="evidence-panel">
          <ThreadWeave className="evidence-weave" />
          <div className="evidence-grid">
            <h3>{t.evidenceTitle}</h3>
            <ul className="evidence-list">
              {t.evidence.map(([title, body]) => (
                <li key={title}><strong>{title}</strong><span>{body}</span></li>
              ))}
            </ul>
          </div>
          <div className="evidence-method">
            <h3>{t.methodTitle}</h3>
            <NumberPath className="evidence-number-path" />
            <ol className="evidence-steps">
              {t.methodSteps.map(([step, body]) => (
                <li key={step}><b>{step}</b><span>{body}</span></li>
              ))}
            </ol>
            <h3 className="evidence-limit-title">{t.limitTitle}</h3>
            <ul className="evidence-limits">
              {t.limits.map((limit) => <li key={limit}>{limit}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="evidence-faq">
        <h3>{t.faqTitle}</h3>
        {t.faq.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
