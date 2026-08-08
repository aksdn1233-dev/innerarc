/**
 * What the storefront shows in place of testimonials while there are none.
 *
 * Everything here describes what the product actually does today — the calculation, the
 * sections a buyer receives, how access works, and how reviews are collected. No claim
 * is made about results, accuracy, or how many people have bought anything.
 */
export const evidenceCopy = {
  ko: {
    eyebrow: "구매 전 확인",
    reviewsTitle: "실제 이용자 후기",
    reviewsIntro:
      "리포트를 직접 열람한 분이 남기고, 공개에 동의했으며, 운영자 확인을 거친 후기만 표시합니다.",
    emptyTitle: "아직 공개된 후기가 없습니다",
    emptyIntro:
      "후기를 지어내지 않습니다. 공개 승인된 후기가 없는 동안에는 대신 실제로 제공되는 리포트 구성과 판단 기준을 보여드립니다.",
    evidenceTitle: "리포트에 실제로 들어가는 것",
    evidence: [
      ["계산 근거 공개", "생년월일에서 생명수·생일수·태도수·연도수·개인년을 코드로 계산하고, 리포트 안에 그 숫자를 그대로 표시합니다."],
      ["질문에 대한 직접 결론", "돌려 말하지 않고, 입력하신 질문에 대한 결론 문단을 먼저 배치합니다."],
      ["보류·중단·재검토 기준", "무엇을 하면 좋은지뿐 아니라, 어떤 신호가 보이면 멈추거나 다시 판단해야 하는지를 함께 적습니다."],
      ["우선순위가 있는 실행 항목", "지금 해볼 일을 순서대로 정리하고, 프리미엄에서는 단계별 실행 매뉴얼까지 포함합니다."],
    ],
    methodTitle: "해석이 만들어지는 순서",
    methodSteps: [
      ["1", "생년월일에서 핵심 숫자를 계산합니다. 이 단계에 AI는 관여하지 않습니다."],
      ["2", "선택한 관심 영역과 질문을 계산 결과와 연결합니다."],
      ["3", "계산된 사실, 전통적 상징, 해석, 한계를 구분해 문서로 정리합니다."],
    ],
    limitTitle: "하지 않는 것",
    limits: [
      "미래를 확정해 예언하지 않습니다.",
      "의료·법률·투자 판단을 대신하지 않습니다.",
      "행운이나 성과를 보장하지 않습니다.",
    ],
    faqTitle: "자주 묻는 질문",
    faq: [
      ["회원가입을 해야 하나요?", "아니요. 생년월일과 결제에 필요한 정보만 입력하면 되고, 계정을 만들지 않아도 리포트를 받고 다시 열람할 수 있습니다."],
      ["결제하면 언제 볼 수 있나요?", "결제가 승인되면 리포트 페이지가 바로 열립니다. 주소를 잃어버려도 주문번호와 결제하신 휴대폰 번호로 다시 찾을 수 있습니다."],
      ["자동으로 다시 결제되나요?", "아니요. 1회 결제 상품이며 구독이나 자동 갱신이 없습니다."],
      ["환불은 어떻게 하나요?", "고객 문의 또는 이메일로 접수해 주시면 접수일로부터 7일 이내에 확인·처리합니다. 결제가 취소되면 해당 리포트 열람도 함께 종료됩니다."],
      ["후기는 어떻게 모으나요?", "결제가 확인되고 리포트를 실제로 연 분에게만 요청합니다. 공개 동의와 운영자 확인을 모두 거친 후기만 표시하며, 작성자가 공개를 철회하면 즉시 내려갑니다."],
      ["입력한 내용은 어떻게 쓰이나요?", "구매하신 개인 리포트를 만들고 다시 열람할 수 있게 하는 데 사용합니다. 생년월일과 질문 내용은 공개 화면 어디에도 표시되지 않습니다."],
    ],
    summaryChanged: "공개된 후기 {total}건 중 {n}건이 계획했던 행동이 달라졌다고 답했습니다.",
    // The live chat block. It says where the words came from before it shows them,
    // because they are real but they are not website purchase reviews, and a visitor
    // who cannot tell the difference has been misled even by true sentences.
    liveTitle: "라이브 리딩 중에 올라온 반응",
    liveIntro:
      "운영자가 진행한 실시간 사주·타로 라이브 방송에서 시청자분들이 채팅으로 남긴 말들입니다. 오타까지 원문 그대로이고, 닉네임은 방송 화면에 공개되어 있던 그대로입니다.",
    liveBoundary:
      "웹사이트 리포트를 구매하고 남긴 후기와는 별개입니다. 구매 후기는 결제·열람이 확인된 분에게만 요청하며, 공개 승인을 거친 뒤 위에 표시됩니다.",
    liveLabel: "라이브 채팅",
  },
  en: {
    eyebrow: "Before you buy",
    reviewsTitle: "Reader feedback",
    reviewsIntro:
      "Only feedback left by someone who opened their own report, who consented to publication, and which an operator has reviewed.",
    emptyTitle: "No published reviews yet",
    emptyIntro:
      "We do not invent reviews. Until approved ones exist, this space shows what the report actually contains instead.",
    evidenceTitle: "What is actually in the report",
    evidence: [
      ["The calculation is shown", "Life path, birthday, attitude, birth-year, and personal-year numbers are computed in code from your birth date and printed in the report itself."],
      ["A direct answer first", "The conclusion for the question you asked comes first, not after several pages of preamble."],
      ["Stop and reconsider criteria", "Not only what to try, but which signals mean you should hold, stop, or judge again."],
      ["Prioritized actions", "Next actions in order, with a step-by-step execution manual in the premium reading."],
    ],
    methodTitle: "How the reading is built",
    methodSteps: [
      ["1", "Core numbers are calculated from your birth date. No AI is involved in this step."],
      ["2", "Your chosen area and question are connected to those calculated numbers."],
      ["3", "Calculated facts, traditional symbolism, interpretation, and limits are kept visibly separate."],
    ],
    limitTitle: "What it does not do",
    limits: [
      "It does not predict a fixed future.",
      "It does not replace medical, legal, or investment judgement.",
      "It does not promise luck or results.",
    ],
    faqTitle: "Common questions",
    faq: [
      ["Do I need an account?", "No. Enter your birth date and the details checkout needs; you can receive and reopen the report without creating an account."],
      ["When can I read it?", "The report page opens as soon as payment is approved. If you lose the address, your order number and checkout phone number bring it back."],
      ["Will I be charged again?", "No. This is a one-time purchase with no subscription and no auto-renewal."],
      ["How do refunds work?", "Contact support or email us; requests are reviewed and processed within seven days of receipt. If a payment is cancelled, access to that report closes with it."],
      ["How is feedback collected?", "We ask only people whose payment was confirmed and who actually opened their report. Feedback appears publicly only with the writer's consent and an operator's approval, and comes down the moment consent is withdrawn."],
      ["What happens to what I enter?", "It is used to build the personal report you purchased and to let you reopen it. Your birth date and your question never appear on any public page."],
    ],
    summaryChanged: "{n} of {total} published reviews said the reading changed a planned action.",
    liveTitle: "Said during a live reading",
    liveIntro:
      "Messages viewers typed into the chat during the operator's live Korean fortune and tarot broadcasts. They are reproduced exactly as written, in Korean, with a translation underneath; the handles are the public ones the broadcast showed.",
    liveBoundary:
      "These are not reviews of a purchased report. Purchase feedback is requested only from people whose payment and access were confirmed, and appears above once approved.",
    liveLabel: "Live chat",
  },
} as const;
