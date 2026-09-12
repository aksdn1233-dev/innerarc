import type { z } from "zod";
import { OntologyTokenSchema, type DreamInput } from "./schema";

type Token = z.infer<typeof OntologyTokenSchema>;
type LexiconEntry = Readonly<{ code: string; ko: string; en: string; patterns: readonly RegExp[] }>;

const lexicon: Readonly<Record<Token["kind"], readonly LexiconEntry[]>> = {
  entity: [
    { code: "SNAKE", ko: "뱀", en: "snake", patterns: [/뱀/u, /snake/i] },
    { code: "PIG", ko: "돼지", en: "pig", patterns: [/돼지/u, /pig/i] },
    { code: "BABY", ko: "아기", en: "baby", patterns: [/아기|아이를 낳/u, /baby|gave birth/i] },
    { code: "TEETH", ko: "이", en: "teeth", patterns: [/이빨|이가\s*빠/u, /teeth?|tooth/i] },
    { code: "WATER", ko: "물", en: "water", patterns: [/물|바다|홍수/u, /water|sea|flood/i] },
    { code: "DECEASED_PERSON", ko: "세상을 떠난 사람", en: "deceased person", patterns: [/죽은\s*(가족|사람)|돌아가신/u, /dead|deceased/i] },
    { code: "FORMER_PARTNER", ko: "전 연인", en: "former partner", patterns: [/전\s*(남친|여친|연인)/u, /ex[- ]?(partner|boyfriend|girlfriend)/i] },
    { code: "EXAM", ko: "시험", en: "exam", patterns: [/시험/u, /exam|test/i] },
    { code: "MOVIE_SCENE", ko: "최근 본 장면", en: "recently watched scene", patterns: [/영화\s*장면|최근\s*본/u, /movie scene|watched/i] },
  ],
  action: [
    { code: "ENTER", ko: "들어옴", en: "entering", patterns: [/들어오|들어왔|들어간/u, /enter|came in|coming in/i] },
    { code: "CHASE", ko: "쫓김", en: "being chased", patterns: [/쫓기|쫓아오|쫓아와/u, /chas(ed|ing)/i] },
    { code: "CATCH", ko: "잡음", en: "catching", patterns: [/잡았|잡는|붙잡/u, /catch|caught/i] },
    { code: "WATCH", ko: "바라봄", en: "watching", patterns: [/쳐다|바라보|지켜보/u, /watch|stared|looked at/i] },
    { code: "FALL", ko: "떨어짐", en: "falling", patterns: [/떨어지|추락/u, /fall|fell/i] },
    { code: "LATE", ko: "늦음", en: "being late", patterns: [/늦었|지각|늦는/u, /late|missed/i] },
    { code: "GIVE_BIRTH", ko: "낳음", en: "giving birth", patterns: [/낳는|출산/u, /gave birth|giving birth/i] },
    { code: "LOSE", ko: "빠지거나 잃음", en: "losing", patterns: [/빠졌|빠지는|잃어/u, /lost|falling out/i] },
  ],
  state: [
    { code: "LARGE", ko: "큼", en: "large", patterns: [/큰|거대한/u, /large|huge|big/i] },
    { code: "SUBMERGED", ko: "잠김", en: "submerged", patterns: [/잠긴|잠겼/u, /submerged|under water/i] },
    { code: "CALM", ko: "위협적이지 않음", en: "not threatening", patterns: [/무섭지(?:는)?\s*않|평온/u, /not afraid|calm/i] },
    { code: "SMILING", ko: "웃고 있음", en: "smiling", patterns: [/웃으며|웃고/u, /smil/i] },
  ],
  emotion: [
    { code: "FEAR", ko: "공포", en: "fear", patterns: [/무서|공포|두려/u, /afraid|fear|terrified/i] },
    { code: "ANXIETY", ko: "불안", en: "anxiety", patterns: [/불안|초조|답답/u, /anxious|anxiety|uneasy/i] },
    { code: "CALM", ko: "평온", en: "calm", patterns: [/평온|편안|안도|무섭지(?:는)?\s*않/u, /calm|relief|not afraid/i] },
    { code: "JOY", ko: "기쁨", en: "joy", patterns: [/기뻐|행복/u, /happy|joy/i] },
    { code: "GRIEF", ko: "그리움·슬픔", en: "grief or longing", patterns: [/슬프|슬펐|그리워|그리웠|보고\s*싶/u, /sad|grief|missed/i] },
    { code: "CONFUSION", ko: "혼란", en: "confusion", patterns: [/혼란|이상했/u, /confus|strange/i] },
  ],
  relation: [
    { code: "FAMILY", ko: "가족", en: "family", patterns: [/가족|엄마|아빠|부모|형제|자매/u, /family|mother|father|parent|sibling/i] },
    { code: "FORMER_PARTNER", ko: "전 연인", en: "former partner", patterns: [/전\s*(남친|여친|연인)/u, /ex[- ]?(partner|boyfriend|girlfriend)/i] },
    { code: "ANCESTOR", ko: "조상", en: "ancestor", patterns: [/조상|할머니|할아버지/u, /ancestor|grandmother|grandfather/i] },
    { code: "STRANGER", ko: "낯선 사람", en: "stranger", patterns: [/낯선\s*사람/u, /stranger/i] },
  ],
  context: [
    { code: "WORK", ko: "일·직업", en: "work", patterns: [/직장|이직|취업|일\b/u, /work|job|career/i] },
    { code: "RELATIONSHIP", ko: "관계", en: "relationship", patterns: [/연애|연인|관계|갈등/u, /relationship|partner|conflict/i] },
    { code: "EXAM", ko: "시험", en: "exam", patterns: [/시험|합격/u, /exam|test/i] },
    { code: "MONEY", ko: "재정", en: "money", patterns: [/돈|재정|재물/u, /money|finance/i] },
    { code: "RECENT_MEDIA", ko: "최근 본 콘텐츠", en: "recent media", patterns: [/영화|드라마|영상/u, /movie|show|video/i] },
    { code: "BODY_STATE", ko: "몸 상태", en: "body state", patterns: [/수면\s*부족|열|음주|약|아팠/u, /sleep deprived|fever|alcohol|medication|sick/i] },
  ],
  location: [
    { code: "HOME", ko: "집", en: "home", patterns: [/집|방/u, /home|house|room/i] },
    { code: "SCHOOL", ko: "학교", en: "school", patterns: [/학교|교실/u, /school|classroom/i] },
    { code: "HIGH_PLACE", ko: "높은 곳", en: "high place", patterns: [/높은\s*곳|절벽|옥상/u, /high place|cliff|rooftop/i] },
    { code: "SEA", ko: "바다", en: "sea", patterns: [/바다/u, /sea|ocean/i] },
  ],
};

function searchable(input: DreamInput): string {
  return [input.rawText, input.context.currentConcern, input.context.recentExperience, input.context.bodyState].join(" \n ");
}

export function extractDreamOntology(input: DreamInput): Token[] {
  const text = searchable(input);
  const tokens: Token[] = [];
  for (const [kind, entries] of Object.entries(lexicon) as [Token["kind"], readonly LexiconEntry[]][]) {
    for (const entry of entries) {
      const evidence = entry.patterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean);
      if (!evidence) continue;
      tokens.push(OntologyTokenSchema.parse({ kind, code: entry.code, label: { ko: entry.ko, en: entry.en }, evidence }));
    }
  }
  return tokens.slice(0, 40);
}

export function hasToken(tokens: readonly Token[], kind: Token["kind"], code: string): boolean {
  return tokens.some((token) => token.kind === kind && token.code === code);
}
