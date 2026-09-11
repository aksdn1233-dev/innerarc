import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PaidReport } from "@/core/paid-reading";
import {
  buildDetailEditorialModel,
  buildPremiumEditorialModel,
  type EditorialPattern,
  type EditorialTextBlock,
} from "@/core/detail-editorial";
import {
  accessoryDetailBoards,
  localizeAccessoryProduct,
  recommendAccessoryProductsByBirthDate,
} from "@/core/commerce/accessory-recommendations";
import type { Locale } from "@/i18n/config";
import { ReportRealityCheck } from "@/components/pattern-intelligence/report-reality-check";
import { EvidenceEventCapture } from "@/components/pattern-intelligence/evidence-event-capture";

function ChapterNumber({ value }: { value: number }) {
  return <span aria-hidden="true" className="ed-chapter-number">{String(value).padStart(2, "0")}</span>;
}

function detailParagraphs(item: EditorialTextBlock): string[] {
  const removeInternalLabel = (value: string) => value
    .replace(/\[(?:프리미엄 확장|Premium extension)\s*·\s*[^\]]+\]\s*/giu, "")
    .trim();
  const lead = removeInternalLabel(item.lead);
  let detail = removeInternalLabel(item.body);
  if (detail === lead) return [];
  if (lead && detail.includes(lead)) detail = detail.replace(lead, "").trim();
  else {
    const firstSentence = detail.match(/^.*?[.!?。](?:\s|$)/u)?.[0].trim();
    if (firstSentence && lead.includes(firstSentence)) detail = detail.slice(firstSentence.length).trim();
  }
  return detail.split(/\n{2,}/u).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function ReadingDetails({ item, label, className }: { item: EditorialTextBlock; label: string; className?: string }) {
  const paragraphs = detailParagraphs(item);
  if (paragraphs.length === 0) return null;
  return <details className={className}><summary>{label}</summary>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</details>;
}

const premiumFieldLabels = [
  "중심 동력", "실행 강점", "첫인상과 접근 방식", "오래 반복되는 바탕",
  "촉발 조건", "예상 행동", "가능한 결과", "확인 신호", "대응", "전환 기준",
  "긍정 신호", "경고 신호", "현재 해석을 반박하는 신호", "재평가 시점",
  "목표", "행동", "완료 기준", "위험", "다음 관문",
  "Core drive", "Execution strength", "First impression and approach", "Long-running base",
  "Trigger", "Expected behavior", "Possible result", "Confirmation signal", "Response", "Transition rule",
  "Positive", "Warning", "Contradiction", "Reassess",
] as const;

function splitPremiumProse(value: string): string[] {
  const normalized = value.trim();
  if (normalized.length < 190) return [normalized];
  const sentences = normalized.match(/[^.!?。]+(?:[.!?。]+|$)/gu)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalized];
  const groups: string[] = [];
  for (const sentence of sentences) {
    const last = groups.at(-1);
    if (last && `${last} ${sentence}`.length <= 165) groups[groups.length - 1] = `${last} ${sentence}`;
    else groups.push(sentence);
  }
  return groups;
}

function splitPremiumLines(paragraph: string): string[] {
  let normalized = paragraph.replace(/\s+/gu, " ").trim();
  if (!normalized) return [];
  if (normalized.includes("□")) return normalized.split(/\s*(?=□)/u).filter(Boolean);
  if ((normalized.match(/(?:^|\s)\d+[.)]\s+/gu) ?? []).length > 1) {
    return normalized.split(/\s+(?=\d+[.)]\s+)/u).filter(Boolean).flatMap(splitPremiumLines);
  }
  if ((normalized.match(/[①-⑩]/gu) ?? []).length > 1) {
    return normalized.split(/\s+(?=[①-⑩])/u).filter(Boolean).flatMap(splitPremiumLines);
  }

  normalized = normalized
    .replace(/^(\d+[.)]\s+(?:최선 시나리오|가장 현실적인 시나리오|위험 시나리오|Best scenario|Most likely scenario|Risk scenario))\s+/iu, "$1\n")
    .replace(new RegExp(`\\s+·\\s*(?=(?:${premiumFieldLabels.join("|")}):)`, "giu"), "\n")
    .replace(new RegExp(`(?<!\\d[.)])(?<=[.!?。])\\s+(?=(?:${premiumFieldLabels.join("|")}):)`, "giu"), "\n");
  const structured = normalized.split(/\n+/u).map((line) => line.trim()).filter(Boolean);
  if (structured.length > 1) return structured;
  return splitPremiumProse(normalized);
}

function ReadingBlock({ item, label, locale }: { item: EditorialTextBlock; label: string; locale: Locale }) {
  return (
    <article className="ed-reading-block">
      <small>{label}</small>
      <h3>{item.title}</h3>
      <p className="ed-reading-lead">{item.lead}</p>
      <ReadingDetails item={item} label={locale === "ko" ? "이어지는 내용 읽기" : "Continue reading"} />
    </article>
  );
}

function PatternBlock({ item, index, locale }: { item: EditorialPattern; index: number; locale: Locale }) {
  const ko = locale === "ko";
  return (
    <article className="ed-reading-block ed-pattern-block">
      <small>{ko ? `패턴 ${index + 1}` : `PATTERN ${index + 1}`}</small>
      <h3>{item.title}</h3>
      <p className="ed-reading-lead">{item.lead}</p>
      <details>
        <summary>{ko ? `패턴 ${index + 1}의 이어지는 순서` : `How pattern ${index + 1} unfolds`}</summary>
        <dl>
          <div><dt>{ko ? "이유" : "WHY"}</dt><dd>{item.why}</dd></div>
          <div><dt>{ko ? "실제 장면" : "REAL LIFE"}</dt><dd>{item.realLife}</dd></div>
          <div><dt>{ko ? "시작 신호" : "TRIGGER"}</dt><dd>{item.trigger}</dd></div>
          <div><dt>{ko ? "그대로 둘 때" : "RISK"}</dt><dd>{item.risk}</dd></div>
          <div><dt>{ko ? "바로잡는 방법" : "CORRECTION"}</dt><dd>{item.correction}</dd></div>
        </dl>
      </details>
    </article>
  );
}

function PremiumFeature({ item, label, locale }: { item: EditorialTextBlock; label: string; locale: Locale }) {
  const paragraphs = detailParagraphs(item);
  return (
    <article className="ed-premium-feature">
      <small>{label}</small>
      <h3>{item.title}</h3>
      <p className="ed-reading-lead">{item.lead}</p>
      {paragraphs.length > 0 && (
        <div className="ed-premium-body" aria-label={locale === "ko" ? `${item.title} 상세 내용` : `${item.title} details`}>
          {paragraphs.map((paragraph, paragraphIndex) => {
            const sourceLines = splitPremiumLines(paragraph);
            const lines = sourceLines.length === 1 && paragraph.includes(" · ")
              ? paragraph.split(/\s+·\s+/u).map((line) => line.trim()).filter(Boolean)
              : sourceLines;
            const structured = lines.length > 1 || lines.some((line) => /^(?:□|[①-⑩]|\d+[.)])\s*/u.test(line));
            if (!structured) return <p key={`${paragraphIndex}-${paragraph}`}>{paragraph}</p>;

            return (
              <div className="ed-premium-detail-group" key={`${paragraphIndex}-${paragraph}`}>
                {lines.map((line, lineIndex) => {
                  const heading = line.match(/^\d+[.)]\s+((?:최선|가장 현실적인|위험) 시나리오|(?:Best|Most likely|Risk) scenario)$/iu);
                  if (heading) return <h4 key={`${lineIndex}-${line}`}>{heading[1]}</h4>;
                  const checkpoint = line.match(/^□\s*(.+)$/u);
                  if (checkpoint) return <p className="ed-premium-check" key={`${lineIndex}-${line}`}><span aria-hidden="true">✓</span>{checkpoint[1]}</p>;
                  const field = line.match(/^(?:([①-⑩]|\d+[.)])\s*)?([^:]{1,28}):\s*(.+)$/u);
                  if (field) return <div className="ed-premium-field" key={`${lineIndex}-${line}`}><strong>{field[1] ? `${field[1]} ` : ""}{field[2]}</strong><div className="ed-premium-field-copy">{splitPremiumProse(field[3]).map((text) => <p key={text}>{text}</p>)}</div></div>;
                  const numbered = line.match(/^(\d+)[.)]\s+(.+)$/u);
                  if (numbered) return <p className="ed-premium-numbered" key={`${lineIndex}-${line}`}><span aria-hidden="true">{numbered[1]}</span>{numbered[2]}</p>;
                  return <p key={`${lineIndex}-${line}`}>{line}</p>;
                })}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function DetailEditorialReport({
  report,
  locale,
  orderId,
  signedIn,
  sample = false,
  sampleNavigation,
  footer,
}: {
  report: PaidReport;
  locale: Locale;
  orderId: string;
  signedIn: boolean;
  sample?: boolean;
  sampleNavigation?: ReactNode;
  footer?: ReactNode;
}) {
  const model = buildDetailEditorialModel(report);
  if (!model) return null;
  const ko = locale === "ko";
  const premium = buildPremiumEditorialModel(report);
  const isPremium = Boolean(premium);
  const accessories = isPremium
    ? recommendAccessoryProductsByBirthDate(model.birthDate, model.years[0]?.year ?? new Date().getFullYear())
    : [];
  const boundaryChapter = isPremium ? 24 : 19;
  const closingChapter = isPremium ? 25 : 20;
  const date = new Intl.DateTimeFormat(ko ? "ko-KR" : "en-US", { dateStyle: "long" }).format(new Date(model.generatedDate));
  const genderTime = [model.genderLabel, model.birthTime ? `${ko ? "출생 시각" : "Birth time"} ${model.birthTime}` : (ko ? "출생 시각 미기재" : "Birth time not provided")].join(" · ");
  const deterministicBasis = ko
    ? `생년월일을 같은 규칙으로 계산한 결과 · ${report.contentVersion ?? "저장 리포트"}`
    : `Same-rule birth-date calculation · ${report.contentVersion ?? "stored report"}`;
  const traditionalBasis = ko
    ? "숫자를 자기이해 질문으로 바꾸는 상징 해석"
    : "Symbolic interpretation that turns numbers into reflection prompts";
  const realityPatterns = [
    [/생각하고 결정/u, /Decision pattern/u],
    [/반복되는 실패/u, /Repeated failure/u],
    [/숫자 조합 안의 모순/u, /Internal contradiction/u],
    [/인간관계와 협업/u, /People and collaboration/u, /직접 연결되는 보조/u],
    [/재물 흐름/u, /Money flow/u, /질문 분야 상세 분석/u],
    [/압박을 받을 때/u, /Under pressure/u],
  ] as const;
  const usedRealitySections = new Set<number>();
  const realityLinks = realityPatterns.map((patterns) => {
    let index = report.sections.findIndex((section, sectionIndex) => !usedRealitySections.has(sectionIndex) && patterns.some((pattern) => pattern.test(section.title)));
    if (index < 0) index = report.sections.findIndex((_section, sectionIndex) => !usedRealitySections.has(sectionIndex));
    const safeIndex = Math.max(0, index);
    usedRealitySections.add(safeIndex);
    return safeIndex;
  });
  const patternSections = report.sections.map((section, index) => ({ index, title: section.title }));
  return (
    <main className={`editorial-report${sample ? " editorial-report-sample" : ""}${isPremium ? " editorial-report-premium" : ""}`} id="main-content">
      {sample && (
        <header className="ed-sample-head">
          <Link className="brand" href={`/${locale}`} prefetch={false}><strong>{ko ? "태령당" : "Taeryeongdang"}</strong></Link>
          <div>
            <p className="eyebrow">{ko ? `941104 남성 · ${isPremium ? "프리미엄 " : ""}결과 리포트 예시` : `1994-11-04 male · ${isPremium ? "premium " : ""}report sample`}</p>
            <p className="sample-report-notice">{ko ? "실제 계산기와 리포트 구조로 만든 고정 예시입니다. 결제·주문·저장은 발생하지 않습니다." : "A fixed sample made with the production calculator. It creates no payment, order, or storage."}</p>
          </div>
          {sampleNavigation}
        </header>
      )}

      <section className="ed-cover" aria-labelledby="ed-cover-title">
        <Image alt="" aria-hidden="true" className="ed-cover-image" fill priority sizes="100vw" src="/images/brand/taeryeong-night-hero-v3.jpg" />
        <div className="ed-cover-shade" aria-hidden="true" />
        <div className="ed-cover-brand"><strong>{ko ? "태령당" : "TAERYEONGDANG"}</strong><span>PERSONAL PATTERN INTELLIGENCE</span></div>
        <div className="ed-cover-copy">
          <p>{ko ? (isPremium ? "가능성부터 실행 기준까지 깊게 읽는 리포트" : "사람의 길을 읽는 당신만의 인생 리포트") : (isPremium ? "A deeper report from possibility to action" : "A personal report for reading the path you repeat")}</p>
          <h1 id="ed-cover-title">{ko ? (isPremium ? <>프리미엄<br />개인 패턴<br />리포트</> : <>개인 패턴<br />인텔리전스<br />리포트</>) : (isPremium ? <>Premium Personal<br />Pattern Report</> : <>Personal Pattern<br />Intelligence Report</>)}</h1>
          {report.customerName && <p className="ed-customer-name">{ko ? `${report.customerName}님의 리포트` : `Prepared for ${report.customerName}`}</p>}
          <div className="ed-symbol-mark" aria-hidden="true"><span /></div>
          <h2>{model.symbol.name}</h2>
          <p>{model.symbol.meaning}</p>
        </div>
        <dl className="ed-cover-facts">
          <div><dt>{ko ? "생년월일" : "Birth date"}</dt><dd>{model.birthDate}</dd></div>
          <div><dt>{ko ? "기본 정보" : "Profile"}</dt><dd>{genderTime}</dd></div>
          <div><dt>{ko ? "리포트 번호" : "Report ID"}</dt><dd>{model.reportId}</dd></div>
          <div><dt>{ko ? "작성일" : "Generated"}</dt><dd>{date}</dd></div>
        </dl>
      </section>

      <nav className="ed-toc" aria-label={ko ? "리포트 차례" : "Report contents"}>
        <a href="#ed-core">{ko ? "핵심" : "Core"}</a>
        <a href="#ed-patterns">{ko ? "반복 패턴" : "Patterns"}</a>
        <a href="#ed-life">{ko ? "돈·일·관계" : "Life"}</a>
        <a href="#ed-flow">{ko ? "3년 흐름" : "3-year flow"}</a>
        {isPremium && <a href="#ed-premium">{ko ? "심층 판단" : "Deep reading"}</a>}
        {isPremium && <a href="#ed-risk">{ko ? "중단 기준" : "Risk checks"}</a>}
        {isPremium && <a href="#ed-accessories">{ko ? "추천 소품" : "Accessories"}</a>}
        <a href="#ed-reality">Reality Check</a>
      </nav>

      <section className="ed-paper-section ed-statement" id="ed-core">
        <ChapterNumber value={1} />
        <p className="ed-kicker">{ko ? "당신을 한 문장으로" : "You in one sentence"}</p>
        <blockquote>“{model.coreLine}”</blockquote>
        <p>{ko ? "이 문장은 결론이 아니라, 이 리포트 전체에서 확인할 첫 번째 가설입니다." : "This is the first hypothesis to check throughout the report, rather than a final verdict."}</p>
      </section>

      <section className="ed-paper-section" aria-labelledby="ed-numbers-title">
        <ChapterNumber value={2} />
        <p className="ed-kicker">{ko ? "계산된 구조" : "Calculated structure"}</p>
        <h2 id="ed-numbers-title">{ko ? "당신의 핵심 구조" : "Your core structure"}</h2>
        <div className="ed-number-grid">
          {model.numbers.map((item) => <article key={item.label}><strong>{item.value}</strong><h3>{item.label}</h3><p>{item.meaning}</p></article>)}
        </div>
        <details className="ed-basis"><summary>{ko ? "계산 기준 확인" : "View calculation basis"}</summary><p>{deterministicBasis}. {ko ? "같은 생년월일에는 같은 숫자가 적용됩니다." : "The same birth date receives the same numbers."}</p></details>
      </section>

      <section className="ed-paper-section" aria-labelledby="ed-outer-title">
        <ChapterNumber value={3} />
        <h2 id="ed-outer-title">{ko ? "겉으로 보이는 나와 실제 나" : "How I appear and what happens inside"}</h2>
        <div className="ed-dual-grid">{model.outerInner.map((item, index) => <ReadingBlock item={item} key={item.title} locale={locale} label={index === 0 ? (ko ? "겉" : "OUTER") : (ko ? "안쪽" : "INNER")} />)}</div>
      </section>

      <section className="ed-paper-section" aria-labelledby="ed-strengths-title">
        <ChapterNumber value={4} />
        <p className="ed-kicker">{ko ? "잘하는 데에는 이유가 있습니다" : "Your strengths have a structure"}</p>
        <h2 id="ed-strengths-title">{ko ? "당신의 강점 5가지" : "Five strengths"}</h2>
        <ol className="ed-strength-list">{model.strengths.map((item, index) => <li key={`${item.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.lead}</p></div></li>)}</ol>
      </section>

      <section className="ed-ink-section" aria-labelledby="ed-shadows-title">
        <ChapterNumber value={5} />
        <p className="ed-kicker">{ko ? "주의할 점" : "Watch points"}</p>
        <h2 id="ed-shadows-title">{ko ? "약점은 강점이 오래 달린 모습입니다" : "A weakness can be a strength that ran too long"}</h2>
        <div className="ed-shadow-list">{model.shadows.map((item, index) => <article key={`${item.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.lead}</h3><p>{item.body}</p></div></article>)}</div>
      </section>

      <section className="ed-paper-section" id="ed-patterns" aria-labelledby="ed-patterns-title">
        <ChapterNumber value={6} />
        <p className="ed-kicker">{ko ? "왜 같은 일이 다시 생길까요?" : "Why does the same thing return?"}</p>
        <h2 id="ed-patterns-title">{ko ? "반복되는 선택의 순서" : "The sequence behind repeated choices"}</h2>
        <div className="ed-pattern-stack">{model.recurringPatterns.map((item, index) => <PatternBlock index={index} item={item} key={item.title} locale={locale} />)}</div>
      </section>

      <div id="ed-life">
        <section className="ed-paper-section ed-domain-section"><ChapterNumber value={7} /><ReadingBlock item={model.relationships} label={ko ? "관계" : "RELATIONSHIPS"} locale={locale} /></section>
        <section className="ed-paper-section ed-domain-section">
          <ChapterNumber value={8} /><p className="ed-kicker">{ko ? "재물" : "MONEY"}</p><h2>{model.money.title}</h2>
          <div className="ed-dual-grid ed-money-grid">
            <article><small>{ko ? "돈을 만드는 감각" : "HOW MONEY IS MADE"}</small><p>{model.money.first}</p></article>
            <article><small>{ko ? "돈이 새는 지점" : "WHERE MONEY LEAKS"}</small><p>{model.money.second}</p></article>
          </div>
        </section>
        <section className="ed-paper-section ed-domain-section"><ChapterNumber value={9} /><ReadingBlock item={model.career} label={ko ? "일·사업" : "WORK & BUSINESS"} locale={locale} /></section>
        <section className="ed-paper-section ed-domain-section">
          <ChapterNumber value={10} /><p className="ed-kicker">{ko ? "연애·배우자" : "LOVE & PARTNERSHIP"}</p><h2>{model.love.title}</h2>
          <div className="ed-dual-grid ed-love-grid">
            <article><small>{ko ? "가까워진 뒤 놓치기 쉬운 것" : "WHAT CAN BE MISSED AFTER CLOSENESS"}</small><p>{model.love.first}</p></article>
            <article><small>{ko ? "오래 맞으려면" : "LONG-TERM FIT"}</small><p>{model.love.second}</p></article>
          </div>
        </section>
      </div>

      <section className="ed-paper-section ed-boundary-section">
        <ChapterNumber value={11} />
        <p className="ed-kicker">{ko ? "가족·자녀" : "Family and children"}</p>
        <h2>{model.family?.title ?? (ko ? "없는 정보로 가족의 미래를 만들지 않습니다" : "We do not invent a family future from missing information")}</h2>
        {model.family ? <ReadingBlock item={model.family} locale={locale} label={ko ? "확인된 질문 범위" : "SUPPORTED CONTEXT"} /> : <p>{ko ? "가족이나 자녀에 대한 실제 질문과 관계 정보가 없어서 별도의 예측을 넣지 않았습니다. 필요한 경우 현재의 대화와 생활 조건부터 확인합니다." : "No family or child prediction is included without an actual question and relationship context. Current conversations and living conditions come first."}</p>}
      </section>

      <section className="ed-paper-section ed-stress-section">
        <ChapterNumber value={12} />
        <p className="ed-kicker">NORMAL LOOP / STRESS LOOP</p>
        <h2>{model.stress.title}</h2>
        <div className="ed-loop-grid">
          <article><small>NORMAL</small><p>{model.strengths.slice(0, 4).map((item) => item.title).join(" → ")}</p></article>
          <article><small>STRESS</small><p>{ko ? "생각 증가 → 해결책 증가 → 할 일 증가 → 직접 수정 → 피로" : "More thoughts → more solutions → more tasks → taking work back → fatigue"}</p></article>
        </div>
        <p className="ed-reading-lead">{model.stress.lead}</p>
        <ReadingDetails className="ed-basis" item={model.stress} label={ko ? "압박 패턴 이어서 읽기" : "Continue reading the stress pattern"} />
      </section>

      <section className="ed-paper-section" id="ed-flow">
        <ChapterNumber value={13} />
        <p className="ed-kicker">{ko ? "타고난 성향 / 작성 시점의 흐름" : "INNATE / REPORT-TIME CYCLE"}</p>
        <h2>{ko ? "타고난 성향과 작성 시점의 흐름은 다릅니다" : model.currentFlow.title}</h2>
        <div className="ed-dual-grid ed-current-grid">
          <article><small>{ko ? "타고난 조합" : "INNATE"}</small><p>{model.innateSummary}</p></article>
          <article><small>{model.years[0]?.year}</small><p>{model.currentFlow.lead}</p></article>
        </div>
        <ReadingDetails className="ed-basis" item={model.currentFlow} label={ko ? "작성 시점의 흐름 이어서 읽기" : "Continue reading the report-time cycle"} />
      </section>

      <section className="ed-paper-section" aria-labelledby="ed-years-title">
        <ChapterNumber value={14} />
        <p className="ed-kicker">{ko ? "앞으로 3년, 무엇을 확인할까요?" : "What should you check over the next three years?"}</p>
        <h2 id="ed-years-title">{ko ? "연도별 흐름과 현실 행동" : "Yearly themes and grounded actions"}</h2>
        <div className="ed-year-grid">{model.years.map((year) => <article key={year.year}><small>{year.year}</small><strong>{year.number}</strong><h3>{year.keyword}</h3><p>{year.reading}</p><dl>{year.focus.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl><p className="ed-year-action">{year.action}</p></article>)}</div>
      </section>

      <section className="ed-reality-section" id="ed-reality" aria-labelledby="ed-reality-title">
        <ChapterNumber value={15} />
        <p className="ed-kicker">REALITY CHECK</p>
        <h2 id="ed-reality-title">{ko ? "읽고 끝내지 말고, 실제 나와 비교해보세요" : "Compare the reading with your real life"}</h2>
        {sample ? (
          <><p>{ko ? "각 문장을 읽고 ‘맞음·애매함·아님’ 중 하나로 기록할 수 있습니다." : "Each statement can be recorded as Matches, Unclear, or Doesn't match."}</p><ol>{model.realityQuestions.map((question, index) => <li key={question}><span>{String(index + 1).padStart(2, "0")}</span><div><p>{question}</p></div></li>)}</ol></>
        ) : (
          <div className="ed-reality-actions">
            {realityLinks.map((index, position) => <ReportRealityCheck deterministicBasis={deterministicBasis} editorial key={`${index}-${position}`} locale={locale} orderId={orderId} personalized={Boolean(report.concern)} question={model.realityQuestions[position]} sectionIndex={index} signedIn={signedIn} traditionalBasis={traditionalBasis} />)}
          </div>
        )}
      </section>

      <section className="ed-paper-section">
        <ChapterNumber value={16} />
        <p className="ed-kicker">{ko ? "실제 경험" : "LIVED EVIDENCE"}</p>
        <h2>{ko ? "맞았던 말보다, 실제로 있었던 일을 남겨보세요" : "Record what happened, beyond what sounded right"}</h2>
        <p>{ko ? "기록은 해석을 뒷받침할 수도 있고, 반대로 틀렸다는 근거가 될 수도 있습니다." : "A record can support an interpretation or show that it was wrong."}</p>
        <EvidenceEventCapture locale={locale} orderId={orderId} sections={patternSections} signedIn={signedIn} />
      </section>

      <section className="ed-paper-section ed-confidence-section">
        <ChapterNumber value={17} />
        <p className="ed-kicker">{ko ? "확신의 정도" : "CONFIDENCE"}</p>
        <h2>{ko ? "처음부터 단정하지 않습니다" : "The report does not begin with certainty"}</h2>
        <div><span>{ko ? "강하게 반복됨" : "Strongly recurring"}</span><span>{ko ? "가능성이 높음" : "Likely"}</span><span>{ko ? "확인 필요" : "Needs confirmation"}</span></div>
        <p>{ko ? "현재 리포트는 생년월일 계산과 입력한 질문에서 시작합니다. Reality Check와 실제 경험이 쌓이면 어떤 패턴을 더 믿고, 어떤 해석을 낮춰야 하는지 확인할 수 있습니다." : "This report starts with the birth-date calculation and your question. Reality Checks and lived evidence show which patterns deserve more weight and which should be reduced."}</p>
      </section>

      <section className="ed-paper-section">
        <ChapterNumber value={18} />
        <p className="ed-kicker">{ko ? "지금 할 일" : "NEXT ACTIONS"}</p>
        <h2>{ko ? "오늘부터 바꿀 세 가지" : "Three things to change from today"}</h2>
        <ol className="ed-action-list">{model.actions.map((action, index) => <li key={action}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{action}</p></li>)}</ol>
      </section>

      {premium && (
        <>
          <section className="ed-ink-section ed-premium-synthesis" id="ed-premium" aria-labelledby="ed-premium-title">
            <ChapterNumber value={19} />
            <p className="ed-kicker">PREMIUM SYNTHESIS</p>
            <h2 id="ed-premium-title">{ko ? "숫자를 따로 보지 않고, 한 사람으로 읽습니다" : "The numbers are read together as one person"}</h2>
            <div className="ed-premium-feature-grid">
              <PremiumFeature item={premium.synthesis} label={ko ? "종합 해석" : "SYNTHESIS"} locale={locale} />
              <PremiumFeature item={premium.paradox} label={ko ? "강점의 역설" : "PARADOX"} locale={locale} />
              <PremiumFeature item={premium.longTerm} label={ko ? "장기 전략" : "LONG-TERM"} locale={locale} />
              <PremiumFeature item={premium.verdict} label={ko ? "종합 판단" : "VERDICT"} locale={locale} />
            </div>
          </section>

          <section className="ed-paper-section ed-premium-scenarios" aria-labelledby="ed-scenarios-title">
            <ChapterNumber value={20} />
            <p className="ed-kicker">BEST / LIKELY / RISK</p>
            <h2 id="ed-scenarios-title">{ko ? "한 가지 미래를 단정하지 않습니다" : "The report does not claim one fixed future"}</h2>
            <div className="ed-dual-grid">
              <PremiumFeature item={premium.scenarios} label={ko ? "가능한 흐름" : "POSSIBLE PATHS"} locale={locale} />
              <PremiumFeature item={premium.signals} label={ko ? "확인할 신호" : "EVIDENCE SIGNALS"} locale={locale} />
            </div>
          </section>

          <section className="ed-paper-section ed-premium-manual" aria-labelledby="ed-manual-title">
            <ChapterNumber value={21} />
            <p className="ed-kicker">DECISION MANUAL</p>
            <h2 id="ed-manual-title">{ko ? "결정을 내리고, 실제로 움직이는 방법" : "A practical way to decide and act"}</h2>
            <div className="ed-dual-grid">
              <PremiumFeature item={premium.decisionFramework} label={ko ? "판단 기준" : "DECISION RULES"} locale={locale} />
              <PremiumFeature item={premium.manual} label={ko ? "6단계 실행" : "SIX STEPS"} locale={locale} />
            </div>
          </section>

          <section className="ed-paper-section ed-premium-risk" id="ed-risk" aria-labelledby="ed-risk-title">
            <ChapterNumber value={22} />
            <p className="ed-kicker">CHECK BEFORE YOU COMMIT</p>
            <h2 id="ed-risk-title">{ko ? "계속할 때와 멈출 때를 미리 정합니다" : "Set the conditions to continue or stop in advance"}</h2>
            <div className="ed-dual-grid">
              <PremiumFeature item={premium.riskChecklist} label={ko ? "결정 전 확인" : "BEFORE DECIDING"} locale={locale} />
              <PremiumFeature item={premium.stopConditions} label={ko ? "보류·중단·전환" : "HOLD, STOP, OR PIVOT"} locale={locale} />
            </div>
          </section>

          <section className="ed-paper-section ed-accessory-section" id="ed-accessories" aria-labelledby="ed-accessories-title">
            <ChapterNumber value={23} />
            <p className="ed-kicker">PERSONAL EDIT</p>
            <h2 id="ed-accessories-title">{ko ? "당신의 숫자에서 고른 생활 소품" : "Everyday accessories selected from your numbers"}</h2>
            <p className="ed-accessory-intro">{ko ? "운을 바꾸는 물건이 아닙니다. 계산된 세 가지 숫자를 색과 형태로 옮긴, 취향을 위한 제작 제안입니다." : "These objects do not change luck. They translate three calculated numbers into color and form as personal design suggestions."}</p>
            <div className="ed-accessory-grid">
              {accessories.map((recommendation, index) => {
                const item = localizeAccessoryProduct(recommendation.product, locale);
                const factLabels = ko
                  ? { lifePath: "운명수", attitude: "태도수", personalYear: "개인년" }
                  : { lifePath: "Life path", attitude: "Attitude", personalYear: "Personal year" };
                return (
                  <article key={recommendation.fact}>
                    <div className="ed-accessory-image">
                      <Image
                        alt={`${item.name} · ${ko ? "제작 콘셉트" : "design concept"}`}
                        height={1254}
                        sizes="(max-width: 720px) 88vw, 30vw"
                        src={accessoryDetailBoards[recommendation.product.directionId]}
                        style={{ height: "300%", left: `-${recommendation.product.slot * 100}%`, maxWidth: "none", top: 0, width: "300%" }}
                        unoptimized
                        width={1254}
                      />
                      <span>{ko ? "제작 준비 중" : "IN DEVELOPMENT"}</span>
                    </div>
                    <div className="ed-accessory-copy">
                      <small>{factLabels[recommendation.fact]} {recommendation.value} · {index === 0 ? (ko ? "첫 번째 제안" : "PRIMARY EDIT") : (ko ? "함께 볼 제안" : "SUPPORTING EDIT")}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <p className="ed-accessory-meta">{item.kind} · {item.priceRange}</p>
                      <Link href={`/${locale}/shop/${recommendation.product.id}`}>{ko ? "디자인 자세히 보기" : "View the design"}</Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="ed-accessory-boundary">{ko ? "표시 가격은 제작 검토용 예상 범위입니다. 현재 리포트 화면에서 주문이나 결제는 진행되지 않습니다." : "Prices are planning ranges. No order or payment is taken from this report page."}</p>
          </section>
        </>
      )}

      <section className="ed-paper-section ed-safety-section">
        <ChapterNumber value={boundaryChapter} />
        <p className="ed-kicker">{ko ? "해석의 경계" : "BOUNDARY"}</p>
        <h2>{ko ? "결정은 현실의 사실과 함께 내립니다" : "Decisions belong with real-world facts"}</h2>
        {report.cautions.length > 0 && <ul>{report.cautions.map((item) => <li key={item}>{item}</li>)}</ul>}
        <p>{report.disclaimer}</p>
      </section>

      <section className="ed-closing" aria-labelledby="ed-closing-title">
        <Image alt="" aria-hidden="true" fill sizes="100vw" src="/assets/gyeol-webtoon/shared/backgrounds/closing-dusk-terrace_01.png" />
        <div aria-hidden="true" className="ed-closing-shade" />
        <div><ChapterNumber value={closingChapter} /><p className="ed-kicker">{ko ? "마지막 한마디" : "A LAST NOTE"}</p><h2 id="ed-closing-title">{model.closing}</h2><p>{ko ? "당신이 남긴 실제 기록이 다음 해석을 더 정확한 질문으로 바꿉니다." : "The record you leave turns the next reading into a better question."}</p><strong>{ko ? "태령당" : "TAERYEONGDANG"}</strong></div>
      </section>

      {footer}
    </main>
  );
}
