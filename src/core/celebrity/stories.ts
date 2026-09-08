import type { SuccessStory } from "./types";

const accessedAt = "2026-09-08";
const source = (title: string, publisher: string, url: string) => ({ title, publisher, url, accessedAt });
const commonUnknown = { ko: "공개 기록만으로는 매일의 훈련량, 실패한 시도, 비공개 도움을 모두 알 수 없습니다.", en: "Public records cannot reveal every daily practice, failed attempt, or private source of help." };

export const SUCCESS_STORIES: Readonly<Record<string, SuccessStory>> = {
  "barack-obama": {
    evidenceStatus: "supported",
    publicPattern: { ko: "지역사회 조직 활동, 법학 교육과 강의, 주·연방 의회를 거쳐 대통령직으로 이어진 장기 공공 서비스 경로가 공식 기록에 남아 있습니다.", en: "Official records show a long public-service path through community organizing, legal education and teaching, state and federal office, and the presidency." },
    hiddenConditions: [{ ko: "교육 기회와 장학금·학자금 대출", en: "Educational access, scholarships, and student loans" }, { ko: "지역 조직과 정치 제도 안의 팀·네트워크", en: "Teams and networks inside community and political institutions" }],
    unknowns: [commonUnknown], transferability: "conditional_experiment",
    transferableAction: { ko: "이번 주에 해결하려는 문제와 직접 닿아 있는 사람 한 명을 만나 실제 필요를 기록해 보세요.", en: "Meet one person directly affected by the problem you want to solve this week and write down the need you observe." },
    comparisonQuestion: { ko: "나는 직함을 먼저 좇는가, 작은 현장에서 경험을 먼저 쌓는가?", en: "Am I chasing a title first, or building experience in a small real setting?" },
    sources: [source("About President Barack Obama", "The Office of Barack and Michelle Obama", "https://barackobama.com/about/")],
  },
  "marie-curie": {
    evidenceStatus: "supported",
    publicPattern: { ko: "파리 유학, 반복 연구, 동료 연구자와의 협업, 박사 학위와 연구실 운영이 여러 해에 걸쳐 이어졌고 두 과학 분야의 노벨상으로 연결됐습니다.", en: "Her documented path spans study in Paris, sustained research, collaboration, a doctorate, laboratory leadership, and Nobel Prizes in two sciences." },
    hiddenConditions: [{ ko: "소르본의 교육·연구 환경", en: "The Sorbonne's education and research environment" }, { ko: "피에르 퀴리와 연구 공동체의 협업", en: "Collaboration with Pierre Curie and a research community" }, { ko: "당시 여성에게 가해진 제약과 위험한 연구 환경", en: "Constraints on women and hazardous research conditions of the period" }],
    unknowns: [commonUnknown], transferability: "conditional_experiment",
    transferableAction: { ko: "결론을 서두르지 말고 이번 주 관찰 한 가지를 같은 방식으로 세 번 기록해 보세요.", en: "Instead of rushing to a conclusion, record one observation in the same way three times this week." },
    comparisonQuestion: { ko: "내가 반복해서 검증할 수 있는 가장 작은 관찰은 무엇인가?", en: "What is the smallest observation I can test repeatedly?" },
    sources: [source("Marie Curie – Biographical", "Nobel Prize", "https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/"), source("Marie Curie – Facts", "Nobel Prize", "https://www.nobelprize.org/prizes/physics/1903/marie-curie/facts/")],
  },
  "serena-williams": {
    evidenceStatus: "partial",
    publicPattern: { ko: "WTA 기록은 오랜 선수 경력과 23회의 오픈 시대 여자 단식 메이저 우승을 확인하지만, 이 결과를 만든 단일한 성공 공식은 입증하지 않습니다.", en: "WTA records confirm a long career and 23 Open Era women's singles major titles, but they do not establish one formula that caused those results." },
    hiddenConditions: [{ ko: "전문 코칭·훈련 시설과 경쟁 환경", en: "Professional coaching, facilities, and competition" }, { ko: "신체 조건, 건강, 회복 자원", en: "Physical traits, health, and recovery resources" }],
    unknowns: [commonUnknown], transferability: "context_specific",
    transferableAction: { ko: "결과 목표 대신 이번 주에 반복할 수 있는 연습 단위를 하나 정하고 실제 횟수를 기록하세요.", en: "Choose one repeatable practice unit for this week and record completions instead of copying the outcome goal." },
    comparisonQuestion: { ko: "나는 유명한 결과를 따라 하는가, 내 수준의 반복 훈련을 설계하는가?", en: "Am I copying a famous outcome, or designing practice at my own level?" },
    sources: [source("Legend bio: Serena Williams", "WTA", "https://www.wtatennis.com/news/4487583/legend-bio-serena-williams")],
  },
  "son-heung-min": {
    evidenceStatus: "partial",
    publicPattern: { ko: "구단 기록은 장기간의 프로 경력과 주장 역할, 2025년 UEFA 유로파리그 우승을 확인하지만 개인 훈련과 기회의 전체 조건은 공개 자료만으로 재구성할 수 없습니다.", en: "Club records confirm a long professional career, captaincy, and the 2025 UEFA Europa League title, while public material cannot reconstruct every training and opportunity condition." },
    hiddenConditions: [{ ko: "유소년 훈련·가족 지원·프로 구단 시스템", en: "Youth training, family support, and professional club systems" }, { ko: "팀 동료와 경기 기회", en: "Teammates and match opportunities" }],
    unknowns: [commonUnknown], transferability: "context_specific",
    transferableAction: { ko: "내 목표에 필요한 기본 동작 하나를 정해 7일 동안 같은 기준으로 기록하세요.", en: "Pick one fundamental skill your goal requires and track it by the same standard for seven days." },
    comparisonQuestion: { ko: "내가 통제할 수 있는 기본기와 팀·환경이 제공해야 하는 조건을 구분했는가?", en: "Have I separated fundamentals I control from conditions a team or environment must provide?" },
    sources: [source("Heung-Min Son: Spurs legend", "Tottenham Hotspur", "https://www.tottenhamhotspur.com/the-club/history/legends/heung-min-son")],
  },
  "rm-bts": {
    evidenceStatus: "partial",
    publicPattern: { ko: "공식 프로필은 2013년 BTS 데뷔와 음악 활동의 연속성을 확인하지만, 개인 창작 습관과 팀·산업의 기여도를 하나의 공식으로 분리할 수 없습니다.", en: "The official profile confirms BTS's 2013 debut and continuing music work, but it cannot separate personal creative habits from team and industry contributions into one formula." },
    hiddenConditions: [{ ko: "그룹 구성원과 제작진의 협업", en: "Collaboration with group members and production teams" }, { ko: "기획사·유통·팬 공동체와 시장 시기", en: "Agency, distribution, audience community, and market timing" }],
    unknowns: [commonUnknown], transferability: "conditional_experiment",
    transferableAction: { ko: "완성품 하나를 베끼지 말고 매일 15분씩 아이디어 기록을 남긴 뒤 일주일 후 공통 주제를 찾으세요.", en: "Do not copy a finished work; keep a 15-minute idea log each day and look for recurring themes after one week." },
    comparisonQuestion: { ko: "내 창작 과정에서 혼자 반복할 부분과 협업이 필요한 부분은 무엇인가?", en: "Which part of my creative process can I repeat alone, and which part needs collaborators?" },
    sources: [source("BTS Profile", "BIGHIT MUSIC", "https://ibighit.com/bts/eng/profile/")],
  },
  "nelson-mandela": {
    evidenceStatus: "supported",
    publicPattern: { ko: "재단의 연대기는 법률 활동, 정치 조직, 장기 수감, 협상과 대통령직까지 수십 년의 공적 경로를 기록합니다. 시대적 억압과 집단 행동을 떼어 낼 수 없습니다.", en: "The foundation's chronology documents decades of legal work, political organizing, imprisonment, negotiation, and the presidency; apartheid and collective action cannot be separated from that path." },
    hiddenConditions: [{ ko: "아파르트헤이트라는 폭력적 제도와 저항 조직", en: "The violent apartheid system and organized resistance" }, { ko: "동료 활동가·법률가·국제사회의 집단 행동", en: "Collective action by activists, lawyers, and the international community" }],
    unknowns: [commonUnknown], transferability: "context_specific",
    transferableAction: { ko: "내 문제에서 혼자 해결할 부분과 제도·조직의 협력이 필요한 부분을 두 칸으로 나눠 적으세요.", en: "Write two columns for your problem: what you can do alone and what requires institutional or collective support." },
    comparisonQuestion: { ko: "개인의 끈기로만 설명해서는 안 되는 구조적 조건은 무엇인가?", en: "Which structural conditions cannot be explained by individual persistence alone?" },
    sources: [source("Biography of Nelson Mandela", "Nelson Mandela Foundation", "https://www.nelsonmandela.org/biography")],
  },
  "malala-yousafzai": {
    evidenceStatus: "supported",
    publicPattern: { ko: "공식 기록은 어린 시절의 교육권 발언, 폭력 피해 이후의 국제 활동, 말랄라 기금과 노벨 평화상으로 이어진 과정을 확인합니다.", en: "Official records document early advocacy for girls' education, international work after surviving violence, the Malala Fund, and the Nobel Peace Prize." },
    hiddenConditions: [{ ko: "가족의 교육 지원과 국제 의료·언론 환경", en: "Family support plus international medical and media systems" }, { ko: "지역의 교육 제한과 신체적 위험", en: "Local restrictions on education and physical danger" }],
    unknowns: [commonUnknown], transferability: "context_specific",
    transferableAction: { ko: "내가 관심 있는 문제를 이미 다루는 안전한 지역 단체 하나를 찾아 활동 방식과 참여 조건을 확인하세요.", en: "Find one safe local organization already working on your issue and review how it works and how people can participate." },
    comparisonQuestion: { ko: "내 상황의 안전 조건과 지원망을 먼저 확인했는가?", en: "Have I checked the safety conditions and support network in my own situation first?" },
    sources: [source("Malala's Story", "Malala Fund", "https://malala.org/malalas-story.html"), source("The Nobel Peace Prize 2014", "Nobel Prize", "https://www.nobelprize.org/prizes/peace/2014/yousafzai/facts/")],
  },
};
