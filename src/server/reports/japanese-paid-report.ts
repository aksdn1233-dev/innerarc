import { calculateBirthYearNumber, calculateNumerologyProfile } from "@/core/numerology";
import { buildSajuChart, readViewpoints } from "@/core/saju";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";

const meanings: Readonly<Record<number, string>> = {
  1: "自分で方向を決め、最初の一歩をつくる力", 2: "人との距離と協力のバランスを読む力",
  3: "考えを言葉や表現に変える力", 4: "散らかったことを順序と仕組みに整える力",
  5: "変化を捉え、新しい方法へ動く力", 6: "人と責任を長く支える力",
  7: "表面より根拠と原因を深く確かめる力", 8: "資源と目標を現実の成果につなぐ力",
  9: "経験を大きな意味へ結び直す力", 11: "小さな兆しと可能性を早く捉える力",
  22: "大きな構想を長く動く仕組みにする力", 33: "人の成長を支え、周囲を育てる力",
};

const focus: Readonly<Record<PaidReadingInput["focusId"], Readonly<{ name: string; check: string }>>> = {
  work: { name: "仕事・キャリア", check: "責任と裁量、期限と完成条件が釣り合っているか" },
  relationships: { name: "人間関係", check: "言葉だけでなく約束と修復の行動が続いているか" },
  health: { name: "健康・生活", check: "睡眠・食事・休息が崩れる前に負担を減らせているか" },
  growth: { name: "成長・方向", check: "新しい可能性より、今選んだ一つを終えられているか" },
  money: { name: "お金・資源", check: "生活を守る資金と試す資金を分けているか" },
};

function display(value: number): string {
  return value === 11 ? "11/2" : value === 22 ? "22/4" : value === 33 ? "33/6" : String(value);
}

function japaneseSaju(orderId: string, input: PaidReadingInput): PaidReport {
  const chart = buildSajuChart({ birthDate: input.birthDate, birthTime: input.birthTime, sex: input.gender === "male" ? "male" : "female", midnightConvention: input.midnightConvention ?? "야자시" });
  const views = readViewpoints(chart);
  const pillar = (item: { stem: string; branch: string } | null) => item ? `${item.stem}${item.branch}` : "未入力";
  const pillars = [pillar(chart.hour), pillar(chart.day), pillar(chart.month), pillar(chart.year)];
  const phases = Object.entries(chart.phaseBalance).map(([name, count]) => `${name} ${count}`).join("・");
  return {
    version: 1, orderId, productCode: input.productCode, locale: "en", displayLocale: "ja",
    title: "私の四柱命式", customerName: input.name.trim() || null, createdAt: input.createdAt, concern: input.concern,
    summary: `${pillars.join("・")}で立てた命式です。伝統的な象徴解釈を、実際の記憶や行動と照らし合わせて読んでください。`,
    sections: [
      { title: "命式の四柱", body: `時柱・日柱・月柱・年柱：${pillars.join("・")}\n日主：${chart.dayMaster}・${chart.dayMasterPhase}・${chart.dayMasterPolarity}\n出生時刻がない場合、時柱は確定しません。` },
      { title: "五行と節気", body: `五行の分布：${phases}\n月を開く節気：${chart.monthTerm.name} → 次の節気：${chart.nextTerm.name}\n数の多さだけで吉凶を決めず、季節と組み合わせを一緒に見ます。` },
      { title: "強弱・調候・格局の三つの見方", body: `強弱：${views.strength.label} (${views.strength.score >= 0 ? "+" : ""}${views.strength.score})\n調候：${views.climate.season}・${views.climate.need}\n格局：${views.structure.name}\n三つの見方が違うときは、一つを絶対視せず実際の経験を優先します。` },
      { title: "仕事と関係で確認すること", body: "深く考えてから動く力を生かすには、役割・期限・完成条件を言葉にしてください。周囲の期待を先に読みすぎて責任を抱え込んでいないかも確認します。" },
      { title: "計算と時刻補正", body: chart.time.wallClock ? `入力時刻：${chart.time.wallClock}\n真太陽時補正：${chart.time.longitudeCorrectionMinutes}分\n補正時刻：${chart.time.correctedLocalTime}\n規則：${chart.ruleVersion}` : `入力時刻：なし\n時柱：計算しない\n時刻補正：表示しない\n規則：${chart.ruleVersion}` },
      { title: "現実で確かめる質問", body: "この説明は実際の記憶と合っていますか。違った部分はどこですか。繰り返した行動を一つ記録し、解釈より現実の経験を優先してください。" },
    ],
    actions: ["四柱を保存し、別の万年暦と照合する", "出生時刻が不明なら時柱を確定事項として使わない", "解釈と実際の記憶が違えばReality Checkに残す"],
    cautions: chart.hour ? [] : ["出生時刻がないため、時柱は空欄です。"],
    disclaimer: "四柱推命は自己理解のための伝統的な象徴ツールです。未来を保証せず、医療・法律・投資の判断に代わるものではありません。",
    tierLabel: "四柱命式・一回", characterLabel: "태령당 四柱命式", contentVersion: "saju-chart-report-ja-1.0.0",
    contentReferences: [`saju-rule:${chart.ruleVersion}`, "locale:ja"],
    profileFacts: { birthDate: input.birthDate, ...(input.birthTime ? { birthTime: input.birthTime } : {}), ...(input.gender ? { gender: input.gender } : {}) },
  };
}

export function createJapanesePaidReport(orderId: string, input: PaidReadingInput): PaidReport {
  if (input.readingKind === "saju_chart") return japaneseSaju(orderId, input);
  const serviceYear = new Date(input.createdAt).getUTCFullYear();
  const profile = calculateNumerologyProfile({ birthDate: input.birthDate, name: input.name, personalYear: serviceYear });
  const birthYear = calculateBirthYearNumber(input.birthDate).value;
  const selected = focus[input.focusId];
  const basis = [
    ["運命数", profile.lifePath.value], ["誕生日数", profile.birthday.value], ["態度数", profile.attitude.value], ["出生年数", birthYear],
  ] as const;
  const core = `${display(profile.lifePath.value)}の「${meanings[profile.lifePath.value] ?? meanings[9]}」を中心に、${display(profile.birthday.value)}の「${meanings[profile.birthday.value] ?? meanings[9]}」を行動に使う傾向があります。`;
  const sections: Array<{ title: string; body: string; keySentence?: string }> = [
    { title: "あなたを一文で表すと", keySentence: core, body: `${core}\nこれは結論ではなく、実際の選択で確かめる最初の仮説です。` },
    { title: "4つの数字が示す基本構造", body: basis.map(([label, value]) => `${label} ${display(value)} — ${meanings[value] ?? meanings[9]}`).join("\n") },
    { title: "外から見える姿と内側の動き", body: "周囲には落ち着いて状況を整理する人に見えます。内側では複数の可能性を比べ、失敗を減らそうとして長く考えることがあります。考える時間を決め、小さく試すと持ち味が生きます。" },
    { title: "強みが最も生きる場面", body: "まだ言葉になっていない不便を見つけ、誰でも使える順序や仕組みに直す場面です。人の気持ちと現実の手順をつなぐ役割で力を発揮しやすいでしょう。" },
    { title: "強みが負担に変わる瞬間", body: "良い方法を探し続けて着手が遅れるとき、自分が全部引き受けて周囲の役割まで抱えるときです。遅れ・やり直し・休息不足が二週間続いたら範囲を減らしてください。" },
    { title: "決めるときの癖", body: "直感は方向を見つける材料にし、決定は確認できた事実で行います。『分かっている事実』『まだ確かめていない想定』『次に試す一歩』の三つに分けると判断が明確になります。" },
    { title: `${selected.name}で先に見る基準`, body: `${selected.check}を最初に確認してください。${input.concern.trim() ? `ご相談「${input.concern.trim()}」についても、期待だけで結論を出さず、期限内に確認できる行動を一つ決めます。` : "最近の一場面を選び、言葉と実際の行動が一致したかを記録します。"}` },
    { title: "仕事と役割", body: "肩書きより責任と裁量が釣り合っているかを見ます。完成の基準が明確で、改善結果を確認できる仕事では強みが続きます。説明のない期待だけが増える環境では消耗しやすくなります。" },
    { title: "お金と資源", body: "生活を守る資金と試す資金を分けます。投入前に最大損失、確認日、中止条件を一行ずつ決め、可能性だけで固定費を増やさないようにします。" },
    { title: "人間関係", body: "相手の言葉だけでなく、約束が守られたか、負担が偏っていないか、衝突のあとに説明と修復があったかを見てください。理解と我慢は別です。" },
    { title: `${serviceYear}年の流れ`, body: `個人年 ${display(profile.personalYear.value)} は未来を断定する予言ではありません。今年の予定と選択を見直す問いとして使い、実際の結果が違えば記録された現実を優先します。` },
  ];
  if (input.productCode === "premium_pdf") sections.push(
    { title: "最善・現実・注意の三つのシナリオ", body: "最善の場合は小さな検証が早く積み上がります。現実的には進展と修正が交互に起きます。注意が必要なのは、証拠が増えないまま費用と約束だけが大きくなる場合です。" },
    { title: "判断に使う確認信号", body: "良い信号：期限内の完成、相手の自発的な行動、繰り返せる結果。注意信号：説明のない延期、役割の偏り、追加投入の要求。反証が二回続いたら方法を見直します。" },
    { title: "6段階の実行手順", body: "1. 目的を一文にする。\n2. 現在の事実を三つ集める。\n3. 最小の試行を決める。\n4. 完了日と確認基準を置く。\n5. 結果を記録する。\n6. 続行・縮小・中止を選ぶ。" },
    { title: "保留・中止・方向転換の基準", body: "生活の安全資金を崩す、同じ約束が二度破られる、健康や睡眠が続けて損なわれる、責任だけ増えて裁量がない、期限までに確認できる成果がない。この条件では止まって再検討します。" },
    { title: "おすすめの小物の方向", body: "形が単純で手入れしやすい木・金属・布の小物を選びます。色は落ち着いた青緑、生成り、木の色から一つに絞ります。小物が運や結果を変えるものではなく、生活の合図として使います。" },
  );
  sections.push({ title: "最後に", body: "このレポートはあなたを決めつける答えではありません。繰り返す選択を見つけ、次の行動を少し扱いやすくするための仮説です。" });
  return {
    version: 1, orderId, productCode: input.productCode, locale: "en", displayLocale: "ja",
    title: input.productCode === "premium_pdf" ? "プレミアム深層リーディング" : input.productCode === "pro_30d" ? "詳細リーディング" : "基本リーディング",
    customerName: input.name.trim() || null, createdAt: input.createdAt, concern: input.concern, summary: core, sections,
    actions: ["今週終えることを一つ決める", "事実と期待を別々に書く", "一か月後に実際の結果を記録する"],
    cautions: ["健康・法律・金融・安全の判断は、資格を持つ専門家と公式資料を優先してください。"],
    disclaimer: "数秘術は自己理解と選択整理のための象徴的なツールです。科学的な予測・診断・治療・結果の保証ではありません。",
    tierLabel: input.productCode === "premium_pdf" ? "プレミアム深層リーディング" : input.productCode === "pro_30d" ? "詳細リーディング" : "基本リーディング",
    characterLabel: "可能性を形にする人", contentVersion: "japanese-report-composer-1.0.0",
    calculationBasis: { birthDate: input.birthDate, serviceYear, lifePath: profile.lifePath.value, birthday: profile.birthday.value, attitude: profile.attitude.value, birthYear, personalYear: profile.personalYear.value },
    profileFacts: { birthDate: input.birthDate, ...(input.birthTime ? { birthTime: input.birthTime } : {}), ...(input.gender ? { gender: input.gender } : {}) },
    contentReferences: ["numerology:deterministic", "locale:ja"],
  };
}
