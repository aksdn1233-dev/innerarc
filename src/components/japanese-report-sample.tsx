import Image from "next/image";
import Link from "next/link";
import { getSampleReport, type SampleReportKind } from "@/server/reports/sample-report";

const numberMeaning: Readonly<Record<number, string>> = {
  1: "自分で方向を決め、最初の一歩をつくる力",
  2: "人との距離と協力のバランスを読む力",
  3: "考えを言葉や表現に変える力",
  4: "散らかったことを順序と仕組みに整える力",
  5: "変化を捉え、新しい方法へ動く力",
  6: "人と責任を長く支える力",
  7: "表面より根拠と原因を深く確かめる力",
  8: "資源と目標を現実の成果につなぐ力",
  9: "経験を大きな意味へ結び直す力",
  11: "小さな兆しと可能性を早く捉える力",
  22: "大きな構想を長く動く仕組みにする力",
  33: "人の成長を支え、周囲を育てる力",
};

const labels: Readonly<Record<SampleReportKind, string>> = {
  detail: "詳細リーディング",
  premium: "プレミアム深層リーディング",
  saju: "四柱命式",
};

function numberDisplay(value: number): string {
  return value === 11 ? "11/2" : value === 22 ? "22/4" : value === 33 ? "33/6" : String(value);
}

function numerologySections(kind: "detail" | "premium") {
  const base = getSampleReport(kind, "en");
  const basis = base.calculationBasis!;
  const numbers = [
    ["運命数", basis.lifePath], ["誕生日数", basis.birthday], ["態度数", basis.attitude], ["出生年数", basis.birthYear],
  ] as const;
  const core = `${numberDisplay(basis.lifePath)}の感受性で可能性を見つけ、${numberDisplay(basis.birthday)}の構造力で現実に移す人です。人をよく見ながら進めますが、選択肢を広げすぎると完成が遅くなりやすい傾向があります。`;
  const sections = [
    { title: "あなたを一文で表すと", body: core },
    { title: "4つの数字が示す基本構造", body: numbers.map(([label, value]) => `${label} ${numberDisplay(value)} — ${numberMeaning[value] ?? numberMeaning[9]}`).join("\n") },
    { title: "外から見える姿と内側の動き", body: "周囲には落ち着いて状況を整理する人に見えます。内側では複数の可能性を同時に比べ、失敗を減らそうとして長く考えることがあります。考える時間を決めてから、小さく試すと持ち味が生きます。" },
    { title: "強みが最も生きる場面", body: "まだ言葉になっていない不便を見つけ、誰でも使える順序や仕組みに直す場面です。企画、編集、サービス設計、運営改善のように、人の気持ちと現実の手順をつなぐ役割と相性があります。" },
    { title: "強みが負担に変わる瞬間", body: "良い方法を探し続けて着手が遅れるとき、また自分が全部引き受けて周囲の役割まで抱えるときです。二週間続く遅れ、やり直し、休息不足が重なったら範囲を減らしてください。" },
    { title: "決めるときの癖", body: "直感は方向を見つける材料にし、決定は確認できた事実で行うと安定します。『分かっている事実』『まだ確かめていない想定』『次に試す一歩』の三つに分けて書くと判断が速くなります。" },
    { title: "仕事と役割", body: "肩書きより、責任と裁量が釣り合っているかを見てください。完成の基準が明確で、改善結果を確認できる仕事では強みが続きます。説明のない期待だけが増える環境では消耗しやすくなります。" },
    { title: "お金と資源", body: "可能性を感じたとき一度に広げるより、生活を守る資金と試す資金を分ける方法が合います。投入前に最大損失、確認日、中止条件を一行ずつ決めてください。" },
    { title: "人間関係", body: "相手の言葉だけでなく、約束が守られたか、負担が一方に偏っていないか、衝突のあとに説明と修復があったかを見てください。理解し続けることと我慢し続けることは別です。" },
    { title: `${basis.serviceYear}年の流れ`, body: `個人年 ${numberDisplay(basis.personalYear)} は、今年を断定する予言ではありません。今ある予定と選択を見直すための問いとして使い、毎月の実際の結果が違えば現実の記録を優先してください。` },
    { title: "今すぐ試す三つの行動", body: "1. 今週終えることを一つだけ決める。\n2. 事実と期待を別々に書く。\n3. 一か月後に、実際に起きたことをReality Checkへ残す。" },
    { title: "最後に", body: "このレポートはあなたを決めつける答えではありません。繰り返す選択を見つけ、次の行動を少し扱いやすくするための仮説です。" },
  ];
  if (kind === "premium") sections.splice(10, 0,
    { title: "最善・現実・注意の三つのシナリオ", body: "最善の場合は小さな検証が早く積み上がります。現実的には進展と修正が交互に起きます。注意が必要なのは、証拠が増えないまま費用と約束だけが大きくなる場合です。" },
    { title: "判断に使う確認信号", body: "良い信号：期限内の完成、相手の自発的な行動、繰り返せる結果。注意信号：説明のない延期、役割の偏り、追加投入の要求。反証信号が二回続いたら方法を見直します。" },
    { title: "6段階の実行手順", body: "1. 目的を一文にする。\n2. 現在の事実を三つ集める。\n3. 最小の試行を決める。\n4. 完了日と確認基準を置く。\n5. 結果を記録する。\n6. 続行・縮小・中止を選ぶ。" },
    { title: "保留・中止・方向転換の基準", body: "生活の安全資金を崩す、同じ約束が二度破られる、健康や睡眠が続けて損なわれる、責任だけ増えて裁量がない、確認できる成果が期限までにない。この条件では止まって再検討してください。" },
    { title: "おすすめの小物の方向", body: "集中を助けるなら、形が単純で手入れしやすい木・金属・布の小物を選びます。色は落ち着いた青緑、生成り、木の色から一つに絞ります。小物が運や結果を変えるものではなく、生活の合図として使います。" },
  );
  return { base, sections };
}

function sajuSections() {
  const base = getSampleReport("saju", "en");
  const raw = base.sections.find((section) => section.title === "The four pillars")?.body ?? "";
  const pillars = raw.split("\n")[0]?.replace(/^Hour · day · month · year:\s*/u, "") ?? "";
  return { base, sections: [
    { title: "命式の四柱", body: `時柱・日柱・月柱・年柱：${pillars || "出生時刻なし・日柱・月柱・年柱"}\n出生時刻が入力されていないため、時柱は確定していません。` },
    { title: "日主と五行の見方", body: "日主は自分の中心を読む基準です。五行の数だけで吉凶を決めず、季節、強弱、組み合わせを一緒に確認します。" },
    { title: "幼少期から続く役割", body: "周囲の期待を早く読み、必要な役割を先に引き受けた可能性があります。実際の家族関係や記憶と違う場合は、記憶のほうを優先してください。" },
    { title: "仕事と関係で繰り返すこと", body: "深く考えてから動く力があります。基準が曖昧な場面では責任を抱え込みやすいため、役割・期限・完成条件を言葉にすると安定します。" },
    { title: "計算と補正の根拠", body: "生年月日は節気を基準に年柱・月柱・日柱を計算します。出生時刻がない場合、時柱と真太陽時補正は表示しません。同じ入力には同じ規則を適用します。" },
    { title: "現実で確かめる質問", body: "この説明は実際の記憶と合っていますか。違った部分はどこですか。繰り返した行動を一つ記録し、解釈より現実の経験を優先してください。" },
  ] };
}

export function JapaneseReportSample({ kind }: { kind: SampleReportKind }) {
  const { base, sections } = kind === "saju" ? sajuSections() : numerologySections(kind);
  const basis = base.calculationBasis;
  return <main className="editorial-report editorial-report-sample japanese-report-sample" id="main-content" lang="ja">
    <header className="ed-sample-head">
      <Link className="brand" href="/ja"><strong>태령당</strong></Link>
      <div><p className="eyebrow">1994年11月4日・結果レポート例</p><p className="sample-report-notice">実際の計算規則で作った固定サンプルです。決済・注文・保存は行われません。</p></div>
      <nav aria-label="レポート言語" className="sample-report-language-tabs"><Link href={`/ko/samples/${kind}`}>한국어</Link><Link href={`/en/samples/${kind}`}>English</Link><Link aria-current="page" href={`/ja/samples/${kind}`}>日本語</Link></nav>
      <nav aria-label="レポート例を選ぶ" className="sample-report-tabs">{(["detail", "premium", "saju"] as const).map((item) => <Link aria-current={item === kind ? "page" : undefined} className={item === kind ? "is-current" : undefined} href={`/ja/samples/${item}`} key={item}>{labels[item]}</Link>)}</nav>
    </header>
    <section className="ed-cover" aria-labelledby="ja-report-title">
      <Image alt="" aria-hidden="true" className="ed-cover-image" fill priority sizes="100vw" src="/images/brand/taeryeong-night-hero-v3.jpg" />
      <div className="ed-cover-shade" aria-hidden="true" />
      <div className="ed-cover-brand"><strong>태령당</strong><span>PERSONAL PATTERN INTELLIGENCE</span></div>
      <div className="ed-cover-copy"><p>繰り返す選択を、現実の行動まで整理する</p><h1 id="ja-report-title">{labels[kind]}<br />結果レポート</h1><div className="ed-symbol-mark" aria-hidden="true"><span /></div><h2>可能性を形にする人</h2><p>答えを決めつけず、実際の経験と照らし合わせます。</p></div>
      <dl className="ed-cover-facts"><div><dt>生年月日</dt><dd>1994-11-04</dd></div><div><dt>言語</dt><dd>日本語</dd></div><div><dt>レポート</dt><dd>{kind.toUpperCase()}</dd></div>{basis && <div><dt>個人年</dt><dd>{basis.serviceYear} · {numberDisplay(basis.personalYear)}</dd></div>}</dl>
    </section>
    {basis && <section className="ed-paper-section"><p className="ed-kicker">計算された数字</p><div className="ed-number-grid">{[["運命数", basis.lifePath], ["誕生日数", basis.birthday], ["態度数", basis.attitude], ["出生年数", basis.birthYear]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{numberDisplay(Number(value))}</strong><p>{numberMeaning[Number(value)] ?? numberMeaning[9]}</p></article>)}</div></section>}
    {sections.map((section, index) => <section className={index % 4 === 3 ? "ed-ink-section ed-reading-section" : "ed-paper-section ed-reading-section"} key={section.title}><span className="ed-chapter-number">{String(index + 1).padStart(2, "0")}</span><p className="ed-kicker">{kind === "premium" ? "PREMIUM READING" : kind === "saju" ? "FOUR PILLARS" : "PERSONAL PATTERN"}</p><h2>{section.title}</h2><div className="sample-report-body">{section.body.split("\n").map((line) => <p key={line}>{line}</p>)}</div></section>)}
    <section className="ed-paper-section"><h2>現実で確かめてください</h2><p>四柱推命と数秘術は自己理解のための象徴的な道具です。科学的な予測・診断・治療・結果の保証ではありません。</p><p className="payment-result-links"><Link className="primary-button" href="/ja/reading">自分のリーディングを始める</Link></p></section>
  </main>;
}
