# InnerArc GPT Codex 인수인계

> **완료 갱신 — 2026-07-26:** 이 문서 아래의 중단 상태는 복구 당시의 역사 기록이다. 관계 공유 카드 지연 로딩으로 285바이트 성능 초과를 해소했고, 월간 Reality Check 변경을 0.15.0으로 정리했다. ESLint, TypeScript, 251/251 단위·통합, 25개 출력 빌드, Chromium 52/52, 모바일 WebKit 51 통과와 의도적 제외 1건을 확인했다. 현재 상태와 명령은 `CODEX-WINDOWS-HANDOFF.md`와 `docs/Continuation-State.md`를 우선한다.

이 문서는 다른 GPT Codex 작업에 그대로 업로드하기 위한 독립형 인수인계 파일이다.

작성 시각: 2026-07-26  
작업 중단 상태: 사용자의 요청으로 이 파일 생성 후 개발 중지  
작업공간:

```text
C:\Users\qwer9\Documents\Codex\2026-07-18\ai-1-ai-self-discovery-personal
```

## 1. 반드시 지킬 작업 경계

1. 위 작업공간 내부 파일만 수정한다.
2. 다른 프로젝트의 Node, npm, pnpm, Next.js, 브라우저 프로세스를 광범위하게 종료하지 않는다.
3. 포트 3000이 이미 사용 중이면 해당 프로세스를 재사용하거나 종료하지 말고 작업을 중단해 소유자를 확인한다.
4. `scripts/run-e2e.mjs`는 점유 포트를 거부하며 자신이 생성한 정확한 서버 PID만 종료한다.
5. 외부 인증·DB·AI·결제·분석·모니터링·이메일·호스팅 계정, 도메인, 앱스토어, 법적 계약, 실제 배포는 사용자 승인 없이 진행하지 않는다.
6. `.openai/hosting.json`은 현재 없다. 실제 배포를 임의로 시작하지 않는다.
7. `.git`은 샌드박스에서 거부된 불완전 메타데이터이며 유효한 Git 저장소가 아니다. 소스에는 영향이 없지만 이 프로젝트의 `.git`을 다시 만드는 작업은 별도 권한이 필요하다.

작업 재개 전 PowerShell 확인:

```powershell
Set-Location -LiteralPath 'C:\Users\qwer9\Documents\Codex\2026-07-18\ai-1-ai-self-discovery-personal'
$listeners = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)
Write-Output "port3000_listeners=$($listeners.Count)"
```

이 인수인계 작성 시점의 `port3000_listeners`는 0이다.

## 2. 제품 목표와 고정 방향

제품 정체성:

```text
AI Self-Discovery & Personal Pattern Intelligence Platform
```

수비학과 타로를 과학적 예측으로 주장하지 않고 자기성찰을 위한 상징 체계로 사용한다. AI는 결정론적 계산 사실, 감사 가능한 카드 결과, 사용자 맥락과 실제 결과 회고를 분리해 설명해야 한다.

핵심 차별점은 Reality Check Loop다.

1. 질문과 당시 상태 기록
2. 상징 해석
3. 현실 확인 조건과 선택지
4. 선택과 행동계획 저장
5. 실제 결과 회고
6. 5단계 Personal Relevance 평가
7. 다음 분석에서 적합·불확실·부적합 결과를 모두 반영
8. 월간 반복 패턴 보고

웹사이트/PWA가 우선이며 네이티브 앱은 웹 활성화, D7/D30 유지, Reality Check 회수율, 안전, 접근성, 삭제 신뢰와 단위경제가 검증된 뒤에만 재검토한다.

연애 기능은 다음 원칙으로 구현돼 있다.

- 연애 에너지원
- 반복 참여를 통해 실제 접점이 생길 수 있는 현실적 만남 환경
- 미래 배우자/파트너의 관찰 가능한 관계 성향과 그린 플래그
- 갈등, 경계, 속도, 말과 행동의 일치
- 확률, 운명, 반드시 만난다는 표현 금지
- 선택한 환경을 편집 가능한 일회성 Reality Check 실험으로 연결

결과 기반 액세서리와 음악 방향은 claim-free 실험이다. 액세서리 상점은 카테고리 미리보기만 존재하며 상품, 가격, 장바구니, 결제, 제휴 추적은 없다.

## 3. 검증 완료된 정식 기준선

현재 `package.json` 정식 버전은 `0.14.0`이다.

0.14.0에서 검증된 결과:

- ESLint 오류·경고 0건
- TypeScript strict 통과
- 단위·통합 247/247, 24개 파일
- Next.js 16.2.11 프로덕션 빌드, 25개 출력
- 데스크톱 Chromium 51/51
- 모바일 WebKit 50 통과, 데스크톱 하드웨어 키보드 전용 1건 의도적 제외
- 20개 한국어/영어 경로와 동적 결과의 axe critical·serious 0건
- 7개 대표 경로 성능 예산 통과
- 프로덕션 의존성 취약점 0건
- CycloneDX 1.6 SBOM, 97개 프로덕션 구성요소
- 합성 데이터 출시 이미지 15개, 모두 1242×2688
- 비밀정보 패턴과 클라이언트 번들 민감 마커 0건

0.14.0의 주요 기능:

- 결정론적 피타고라스 수비학 7개 핵심 값과 11/22/33 처리
- 한글·영문·일본어·악센트·구분문자·긴 이름 경계 처리
- 계산 근거와 버전
- 관심 분야, 깊이, 선택 고민을 반영하는 로컬 컨텍스트형 온보딩
- 고민 원문은 현재 페이지 메모리에만 존재하며 계산, URL, 저장, 공유, 분석, 로그, AI 전송에서 제외
- 8개 영역 통합 프로필과 설명형 직업군 분석
- 78장 타로, 1장/3장 및 질문형 스프레드, 역방향, 고정 시드, 실제 카드 직접 입력
- 고위험 질문 안전 라우팅
- 관계 성찰, 7개 관계 유형 궁합, 공개 출처 유명인 비교
- Reality Check 기록·회고·월간 분류
- 관계 결과에서 현재 탭 전용 일회성 Reality Check 초안으로 연결
- 액세서리 및 음악 방향 추천
- 닫힌 상점 미리보기와 12개 상점 개방 게이트
- 로컬 SVG 공유 카드
- 게스트 개인정보 센터, 내보내기, 전체 기기 데이터 삭제
- 비활성 기본값의 AI·인증·결제·분석·권한·데이터권리 계약

## 4. 현재 작업 중인 미완료 변경

정식 버전은 아직 0.14.0이지만 소스에는 다음 0.15.0 후보인 Reality Check 월간 보고 개선이 들어가 있다.

목적:

- 현재 달만 보이던 월간 보고에서 이전 달 보고서를 다시 선택할 수 있게 한다.
- UTC 월말/월초 경계가 사용자의 현지 달과 다르게 분류되는 문제를 막는다.
- 기존 저장 기록을 깨뜨리거나 몰래 수정하지 않는다.

구현된 내용:

- 새 결과 회고에 UTC `reviewedAt`과 브라우저 현지 `reviewedMonth` (`YYYY-MM`)를 함께 기록
- 현지 월은 월간 그룹에만 사용하며 시간대, 위치, 좌표는 저장하지 않음
- 현재 현지 월과 회고가 존재하는 이전 월을 최신순으로 표시
- 월 변경은 저장, 분석, 네트워크, URL 변경을 발생시키지 않음
- `reviewedMonth`가 없는 기존 version-1 기록은 `reviewedAt`의 UTC 월을 호환용으로 사용
- 호환용 UTC 월 기록 수를 UI에 명시
- 월간 보고 규칙을 `monthly-pattern-1.1.0`으로 독립 버전 관리
- 잘못된 월, 현지/UTC 경계, 레거시 기록, 최신순 월 목록, 무저장 전환 테스트 추가

변경된 핵심 파일:

```text
src/core/reality-check/types.ts
src/core/reality-check/engine.ts
src/core/reality-check/repository.ts
src/core/reality-check/storage.ts
src/components/reality-check-experience.tsx
src/i18n/reality-check-copy.ts
src/app/globals.css
tests/unit/reality-check.test.ts
tests/e2e/onboarding.spec.ts
docs/Product-Requirements.md
docs/Privacy-Model.md
docs/Test-Strategy.md
docs/Decision-Log.md
```

현재 변경에 대해 통과한 검증:

- 관련 Reality Check 단위 테스트 26/26
- 전체 단위·통합 251/251, 24개 파일
- 전체 ESLint 통과
- TypeScript strict 통과
- 프로덕션 빌드 25개 출력 통과
- 새 월간 사용자 흐름 집중 브라우저 검사 4/4
  - Chromium 2건
  - 모바일 WebKit 2건
- 새 회고의 실제 현지 월 저장 확인
- 과거 월 전환 시 localStorage 원문 불변 확인
- 모바일 가로 넘침 없음 확인

## 5. 중단 시점의 정확한 실패 상태

전체 데스크톱 회귀 52건 중:

- 51건 통과
- 1건 실패

실패 항목:

```text
/en/relationship stays first-party and within the initial payload budget
```

수치:

```text
허용: decoded JavaScript < 1,050,000 bytes
실측: 1,050,285 bytes
초과: 285 bytes
```

기능·개인정보·안전·접근성 테스트 실패는 없었다. 고정 성능 예산을 올리지 말고 관계 화면 초기 번들을 최소 286바이트 이상 줄여야 한다.

권장 최소 수정:

- `src/components/relationship-experience.tsx`의 `ShareCardPanel`은 사용자가 관계 결과를 만든 뒤에만 필요하다.
- 현재 중단 시점에도 `ShareCardPanel`은 정적 import 상태다.
- React `lazy`/`Suspense` 또는 검증된 Next.js dynamic import로 결과 생성 뒤에만 로드하면 초기 번들을 충분히 줄일 가능성이 높다.
- 공유 카드 자체 기능과 로컬 렌더링 안전성은 유지해야 한다.

중요:

- 이 최적화 패치를 적용하려던 도중 사용자가 작업을 중단했다.
- 중단된 패치는 적용되지 않았다.
- 현재 파일에는 여전히 다음 정적 import와 직접 렌더가 존재한다.

```text
import { ShareCardPanel } from "@/components/share-card-panel";
<ShareCardPanel payload={buildRomanticPatternShare({ locale, insight })} />
```

전체 모바일 회귀는 현재 월간 변경 이후 아직 실행하지 않았다. 정식 0.15.0으로 올리면 안 된다.

## 6. 다음 Codex의 정확한 재개 순서

1. 포트 3000이 비어 있는지 확인한다.
2. `src/components/relationship-experience.tsx`에서 결과 후에만 필요한 공유 카드 코드를 지연 로딩한다.
3. 집중 Lint와 타입검사를 실행한다.
4. 프로덕션 빌드를 실행한다.
5. 관계 성능 검사를 먼저 실행한다.

```powershell
node scripts/run-e2e.mjs tests/e2e/performance.spec.ts --project=chromium
```

6. 관계 결과와 공유 카드 사용자 흐름이 유지되는지 Chromium과 모바일에서 확인한다.
7. 전체 회귀를 Windows 안정 기준에 따라 분리 실행한다.

```powershell
node scripts/run-e2e.mjs --project=chromium
node scripts/run-e2e.mjs --project=mobile
```

예상 테스트 수:

- 단위·통합 251/251
- Chromium 52/52
- 모바일 51 통과 및 하드웨어 키보드 전용 1건 의도적 제외

8. 모든 검증이 통과한 뒤에만 `package.json`을 0.15.0으로 올린다.
9. README, Continuation State, Living Checklist, Release Checklist, Architecture, Feature Audit, Windows handoff의 버전·테스트 수·결함 기록을 갱신한다.
10. `node scripts/generate-sbom.mjs`로 0.15.0 SBOM을 다시 생성한다.
11. 월간 보고 UI를 출시 자산에 포함할지 결정하고, 포함한다면 합성 데이터 캡처와 시각검사를 수행한다.
12. 의존성 감사, 비밀정보 스캔, 클라이언트 번들 노출 검사, 자산 매니페스트, 포트 0개를 최종 확인한다.

## 7. 안전한 검증 명령

PowerShell:

```powershell
& '.\node_modules\.bin\eslint.cmd' .
& '.\node_modules\.bin\tsc.cmd' --noEmit
& '.\node_modules\.bin\vitest.cmd' run
$env:NEXT_TELEMETRY_DISABLED='1'
& '.\node_modules\.bin\next.cmd' build
node scripts/run-e2e.mjs --project=chromium
node scripts/run-e2e.mjs --project=mobile
pnpm.cmd audit --prod --json
node scripts/generate-sbom.mjs
```

개발 서버:

```powershell
pnpm.cmd dev
```

주소:

```text
http://localhost:3000/ko
http://localhost:3000/en
```

다른 서버가 포트 3000을 사용 중이면 명령을 실행하지 않는다.

## 8. 핵심 문서 지도

```text
README.md
docs/Product-Vision.md
docs/Product-Requirements.md
docs/Architecture.md
docs/Numerology-Rules.md
docs/Tarot-Rules.md
docs/AI-Interpretation-Policy.md
docs/Safety-Policy.md
docs/Privacy-Model.md
docs/Decision-Log.md
docs/Living-Checklist.md
docs/Continuation-State.md
docs/Test-Strategy.md
docs/Release-Checklist.md
docs/Market-Research.md
docs/Monetization.md
docs/Feature-Audit.md
docs/Operations-Runbook.md
docs/Security-Review.md
artifacts/sbom.cdx.json
artifacts/store-assets/manifest.json
```

기존 `CODEX-WINDOWS-HANDOFF.md`는 검증 완료된 0.14.0 기준선을 설명한다. 현재 미완료 월간 보고 작업은 반드시 이 새 인수인계 파일을 기준으로 이어간다.

## 9. 엄격 기능 별점

별점은 사용자 리뷰가 아니라 출시 준비도다.

| 기능 | 별점 | 결정 |
| --- | ---: | --- |
| Reality Check Loop | 4.8/5 | 유지·전면 |
| 결정론적 수비학 | 4.7/5 | 유지 |
| 연애·미래 파트너 성찰 | 4.6/5 | 유지 |
| 감사 가능한 타로 | 4.5/5 | 유지 |
| 게스트 개인정보·데이터 권리 | 4.4/5 | 유지 |
| 컨텍스트형 온보딩 | 4.3/5 | 유지 |
| 통합 프로필·직업 | 4.2/5 | 유지 |
| 2인 궁합 | 4.1/5 | 유지 |
| 공유 카드 | 3.4/5 | 개선 실험 |
| 음악 방향 | 3.2/5 | 개선 실험 |
| 액세서리 방향 | 3.0/5 | 개선 실험 |
| 유명인 비교 | 2.9/5 | 보류·보조 |
| 닫힌 상점 | 2.4/5 | 닫힌 상태 유지 |
| 유료 실시간 AI | 1.8/5 | 비활성 유지 |
| 네이티브 앱 | 1.0/5 | 현재 빌드 제외 |
| 커뮤니티·실시간 점술가·진단 | 0.5/5 | 제거 |

월간 보고 개선은 전체 회귀와 사용자 이해도 증거가 끝나기 전까지 별도 상향 평가하지 않는다.

## 10. 외부 승인 전까지 차단된 항목

- 이메일/소셜 인증 서비스
- PostgreSQL 또는 Supabase 프로젝트
- 승인된 유료 AI 공급자와 API 키
- 결제 공급자
- 실제 분석 이벤트 수집처
- 에러 모니터링
- 이메일과 결과 확인 알림
- 호스팅과 실제 배포
- 도메인과 앱스토어
- 법률, 개인정보, 연령, 위기대응 검토
- 상표와 브랜드 승인
- 수비학/타로 편집 검토
- 한국어/영어 원어민 최종 검토
- 상점 공급자, 소재·알레르기·치수, 원산지, 재고, 배송, 환불, 세금, 지원, 소비자법

현재까지 외부 서비스 비용은 0원이다.

## 11. 새 GPT Codex에 넣을 시작 지시문

```text
업로드한 INNERARC-GPT-CODEX-HANDOFF-2026-07-26.md를 먼저 끝까지 읽고, 문서의 작업공간과 안전 경계를 지켜라. 정식 0.14.0 기준선 위에 월간 Reality Check 현지 달/과거 달 탐색 작업이 구현돼 있지만, 전체 데스크톱 52건 중 관계 화면 초기 decoded JavaScript가 1,050,000바이트 예산을 285바이트 초과해 1건 실패했고 모바일 전체 회귀는 아직 미실행이다. 성능 예산을 올리지 말고 결과 후에만 필요한 ShareCardPanel을 지연 로딩하는 최소 수정부터 적용해라. 그다음 관계 성능 집중검사, 공유 흐름, Chromium 전체, 모바일 전체, Lint, 타입, 251개 단위·통합, 프로덕션 빌드를 검증해라. 모두 통과하기 전에는 0.15.0으로 올리거나 완료로 보고하지 마라. 다른 프로젝트 파일·포트·프로세스를 건드리지 말고 외부 계정·결제·법률·실제 배포는 승인 없이 수행하지 마라.
```
