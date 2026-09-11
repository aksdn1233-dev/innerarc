import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PaidReport } from "@/core/paid-reading";
import { buildDetailEditorialModel, type EditorialPattern, type EditorialTextBlock } from "@/core/detail-editorial";
import type { Locale } from "@/i18n/config";
import { ReportRealityCheck } from "@/components/pattern-intelligence/report-reality-check";
import { EvidenceEventCapture } from "@/components/pattern-intelligence/evidence-event-capture";

function ChapterNumber({ value }: { value: number }) {
  return <span aria-hidden="true" className="ed-chapter-number">{String(value).padStart(2, "0")}</span>;
}

function detailParagraphs(item: EditorialTextBlock): string[] {
  const lead = item.lead.trim();
  let detail = item.body.trim();
  if (detail === lead) return [];
  if (detail.startsWith(lead)) detail = detail.slice(lead.length).trim();
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
    <main className={`editorial-report${sample ? " editorial-report-sample" : ""}`} id="main-content">
      {sample && (
        <header className="ed-sample-head">
          <Link className="brand" href={`/${locale}`} prefetch={false}><strong>{ko ? "태령당" : "Taeryeongdang"}</strong></Link>
          <div>
            <p className="eyebrow">{ko ? "941104 남성 · 결과 리포트 예시" : "1994-11-04 male · report sample"}</p>
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
          <p>{ko ? "사람의 길을 읽는 당신만의 인생 리포트" : "A personal report for reading the path you repeat"}</p>
          <h1 id="ed-cover-title">{ko ? <>개인 패턴<br />인텔리전스<br />리포트</> : <>Personal Pattern<br />Intelligence Report</>}</h1>
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

      <section className="ed-paper-section ed-safety-section">
        <ChapterNumber value={19} />
        <p className="ed-kicker">{ko ? "해석의 경계" : "BOUNDARY"}</p>
        <h2>{ko ? "결정은 현실의 사실과 함께 내립니다" : "Decisions belong with real-world facts"}</h2>
        {report.cautions.length > 0 && <ul>{report.cautions.map((item) => <li key={item}>{item}</li>)}</ul>}
        <p>{report.disclaimer}</p>
      </section>

      <section className="ed-closing" aria-labelledby="ed-closing-title">
        <Image alt="" aria-hidden="true" fill sizes="100vw" src="/assets/gyeol-webtoon/shared/backgrounds/closing-dusk-terrace_01.png" />
        <div aria-hidden="true" className="ed-closing-shade" />
        <div><ChapterNumber value={20} /><p className="ed-kicker">{ko ? "마지막 한마디" : "A LAST NOTE"}</p><h2 id="ed-closing-title">{model.closing}</h2><p>{ko ? "당신이 남긴 실제 기록이 다음 해석을 더 정확한 질문으로 바꿉니다." : "The record you leave turns the next reading into a better question."}</p><strong>{ko ? "태령당" : "TAERYEONGDANG"}</strong></div>
      </section>

      {footer}
    </main>
  );
}
