# InnerArc Windows Codex 인수인계

마지막 갱신: 2026-07-27<br>
현재 버전: 0.15.0  
전체 진행률: 98%  
제품 상태: 웹/PWA 우선 로컬 MVP와 출시 기반 검증 완료, 외부 서비스와 실제 배포는 미연결

## 1. 새 Codex가 가장 먼저 할 일

이 파일과 `docs/Continuation-State.md`를 먼저 읽는다. 작업 경로를 아래 폴더로 고정하고, 다른 프로젝트의 파일·포트·프로세스는 수정하거나 종료하지 않는다.

```text
C:\Users\qwer9\Documents\Codex\2026-07-18\ai-1-ai-self-discovery-personal
```

PowerShell 기준:

```powershell
Set-Location -LiteralPath 'C:\Users\qwer9\Documents\Codex\2026-07-18\ai-1-ai-self-discovery-personal'
$listeners = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)
Write-Output "port3000_listeners=$($listeners.Count)"
```

포트 3000에 리스너가 있으면 소유 프로세스를 확인하기 전에는 테스트나 개발 서버를 시작하지 않는다. 광범위한 `node`/`npm` 프로세스 종료는 금지한다. 이 프로젝트의 브라우저 실행기는 포트가 사용 중이면 실패하고, 자신이 만든 정확한 서버 PID만 종료한다.

`.openai/hosting.json`은 없다. 실제 배포, 외부 계정, 결제, 도메인, 앱스토어, 법적 계약은 사용자 승인 없이는 진행하지 않는다. 로컬 `main`은 비공개 GitHub 저장소 `aksdn1233-dev/innerarc`를 추적한다. `local-bootstrap` 브랜치는 원격 통합 전 로컬 두 커밋을 보존한다.

## 2. 현재 구현된 제품

- 한국어/영어 모바일 우선 Next.js 웹사이트와 PWA 메타데이터
- 결정론적 피타고라스 수비학 7개 핵심 값, 11/22/33 보존, 계산 근거
- 관심사·분석 깊이·선택 고민을 반영하는 컨텍스트형 온보딩
- 고민 원문은 현재 페이지 메모리에만 있고 계산, URL, 저장소, 공유, 분석, 로그, 외부 AI 요청에 포함되지 않음
- 8개 영역 통합 프로필과 근거형 직업군 분석
- 78장 타로, 1장/3장 및 질문별 스프레드, 고정 시드 감사 기록, 역방향, 실제 카드 직접 입력
- 차분한 리딩룸 도입부, 세로형 카드 결과, 펼쳐보는 추첨 감사 기록을 갖춘 타로 시각 경험
- 관계 에너지, 현실적 만남 환경, 미래 배우자/파트너의 관찰 가능한 성향, 갈등과 그린 플래그
- 관계 결과에서 편집 가능한 일회성 Reality Check 초안으로 이어지는 현재 탭 전용 연결
- 7개 관계 유형 궁합과 8개 관계 운영 영역, 운명 점수 없음
- 공개 출처 생년월일 구조만 사용하는 유명인 비교
- 질문·선택·행동·결과·5단계 적합도와 월간 패턴을 잇는 Reality Check Loop
- 새 회고의 브라우저 현지 월 기록, 과거 월 최신순 탐색, 기존 UTC 월 기록의 명시적 호환 처리
- 결과 기반 액세서리 형태/색/소재 방향과 음악 장르/사운드/사용 맥락 추천
- 액세서리 상점 카테고리 미리보기. 상품·가격·장바구니·결제·제휴 추적은 없음
- 로컬 SVG 공유 카드, 게스트 개인정보 센터, 내보내기와 기기 데이터 전체 삭제
- 고위험 질문 라우팅, 지역을 추정하지 않는 공식 위기지원 정보, 과도한 확신 차단
- 공급자 중립 AI·인증·결제·분석·권한·데이터 권리 계약과 비활성 기본값

핵심 불변 조건:

1. 수비학 계산과 타로 추첨을 AI가 결정하지 않는다.
2. 컨텍스트 해석이 계산 사실을 바꾸지 않는다.
3. 사용자 선택 전에는 민감 기록을 읽거나 저장하지 않는다.
4. 미래 만남, 배우자, 궁합을 확률·운명·보장으로 표현하지 않는다.
5. 상점은 명시적 승인과 모든 운영 게이트 전까지 닫혀 있어야 한다.

## 3. 0.15.0 검증 결과

- ESLint: 오류·경고 0건
- TypeScript strict: 통과
- 단위·통합: 251/251, 24개 파일
- Next.js 16.2.11 프로덕션 빌드: 25개 출력
- 데스크톱 Chromium: 52/52
- 모바일 WebKit: 변경 전 전체 51 통과와 하드웨어 키보드 전용 1건 의도적 제외, 변경 질문 흐름 3/3, 안전 포커스 1/1, 접근성 27/27, 성능 7/7 통과. 장시간 단일 세션에서 자원 고갈이 보이면 파일별 새 프로세스로 재검증
- 접근성: 20개 한·영 경로와 동적 온보딩/관계 결과/Reality Check 연결의 axe critical·serious 0건
- 성능: 7개 대표 경로의 HTML, 요청 수, JS/CSS 전송·해제 크기, 전체 페이로드 예산 통과
- 프로덕션 의존성 감사: 알려진 취약점 0건
- 전체 의존성 감사: 알려진 취약점 0건. `brace-expansion` 5.0.8 고정과 `minimatch` 3 호환 패치 포함
- CycloneDX 1.6 SBOM: 97개 프로덕션 구성요소, 버전 0.15.0
- 출시 이미지: 합성 데이터 15개, 모두 1242×2688, 외부 요청 없음
- 한국어/영어 홈, 한국어 타로 카드·관계·상점 이미지 시각검사 완료
- 포트 3000 최종 리스너 0개
- 비공개 GitHub CI `30232289893`: Corepack pnpm 11.9.0, 단위·통합 251개, 전체 감사, 97개 구성요소 SBOM, Chromium·모바일 103개 통과와 의도된 1개 제외, 경고·주석 0개

이번 변경에서 발견·수정한 오류:

1. 관계 화면 초기 JS가 1.05MB 예산을 10.9KB 초과함.
   - 결과 회고·일회성 연결 모듈을 명시적 사용자 동작 시 지연 로딩하도록 수정.
2. 지연 로딩 후 동적 관계 결과에 키보드 포커스가 너무 일찍 이동함.
   - 결과 렌더 이후 포커스하도록 수정하고 양쪽 브라우저 접근성 회귀 추가.
3. 출시 캡처 자동화에서 라디오 카드의 텍스트가 컨트롤 클릭을 가로막음.
   - 캡처 전용 입력을 실제 폼 컨트롤에 적용하도록 수정.
4. 월간 보고 개선 뒤 관계 화면 초기 JS가 1,050,000바이트 예산을 285바이트 초과함.
   - 결과 이후에만 필요한 공유 카드 패널을 React 지연 로딩으로 분리했고, 동일 예산과 공유 흐름을 Chromium 및 모바일 WebKit에서 재검증.

Windows에서 WebKit을 높은 병렬도로 실행하면 일시적인 작업자 종료나 탐색 지연이 발생할 수 있다. 제품 assertion은 단독 재검사에서 통과했고, 모바일 전체 52건은 한 작업자로 51 통과와 의도적 제외 1건을 확인했다. 릴리스 증거는 아래 분리 명령을 사용한다.

## 4. 안전한 검증 명령

의존성이 이미 설치된 현재 환경:

```powershell
& '.\node_modules\.bin\eslint.cmd' .
& '.\node_modules\.bin\tsc.cmd' --noEmit
& '.\node_modules\.bin\vitest.cmd' run
$env:NEXT_TELEMETRY_DISABLED='1'
& '.\node_modules\.bin\next.cmd' build
node scripts/run-e2e.mjs --project=chromium
node scripts/run-e2e.mjs --project=mobile --workers=1
# 장시간 WebKit 세션이 불안정할 때 아래 파일별 명령으로 대체
node scripts/run-e2e.mjs tests/e2e/accessibility.spec.ts --project=mobile --timeout=180000
node scripts/run-e2e.mjs tests/e2e/onboarding.spec.ts --project=mobile --timeout=180000
node scripts/run-e2e.mjs tests/e2e/performance.spec.ts --project=mobile --timeout=180000
pnpm.cmd audit
node scripts/generate-sbom.mjs
```

각 브라우저 명령 전에 포트 3000이 비었는지 확인한다. 테스트 실행기는 점유 포트를 재사용하지 않는다.

로컬 사이트 실행:

```powershell
pnpm.cmd dev
```

한국어 `http://localhost:3000/ko`, 영어 `http://localhost:3000/en`.

출시 이미지 재생성은 프로덕션 빌드 이후 `pnpm.cmd capture:launch`로 실행한다. 이 명령은 포트 3000이 점유돼 있으면 실패하고, AI를 끈 상태로 이 저장소의 프로덕션 서버만 시작한 뒤 자신이 만든 정확한 자식 프로세스만 종료한다. 현재 결과는 `artifacts/store-assets/manifest.json`에 15개로 검증돼 있으므로 UI가 바뀌지 않았다면 불필요하게 다시 만들지 않는다.

## 5. 핵심 파일 지도

- 제품 상태: `docs/Continuation-State.md`
- 전체 체크리스트: `docs/Living-Checklist.md`
- 엄격 기능 별점: `docs/Feature-Audit.md`
- 결정 기록: `docs/Decision-Log.md`
- 테스트 규칙: `docs/Test-Strategy.md`
- 출시 체크: `docs/Release-Checklist.md`
- 제품 요구사항: `docs/Product-Requirements.md`
- 개인정보 모델: `docs/Privacy-Model.md`
- 안전 정책: `docs/Safety-Policy.md`
- 시장 비교: `docs/Market-Research.md`
- 수익화/상점 경계: `docs/Monetization.md`
- 컨텍스트 온보딩: `src/core/onboarding/context.ts`
- 온보딩 화면: `src/components/onboarding-experience.tsx`
- 수비학: `src/core/numerology`
- 타로: `src/core/tarot`
- 관계: `src/core/relationship`
- Reality Check: `src/core/reality-check`
- 라이프스타일 추천: `src/core/lifestyle`
- 상점 계약: `src/core/commerce`
- 출시 이미지: `artifacts/store-assets`
- SBOM: `artifacts/sbom.cdx.json`

## 6. 기능 별점과 제품 결정

별점은 사용자 리뷰가 아니라 엄격한 출시 준비도다.

| 기능 | 별점 | 결정 |
| --- | ---: | --- |
| Reality Check Loop | 4.8/5 | 유지·전면 |
| 결정론적 수비학 | 4.7/5 | 유지 |
| 연애/미래 파트너 성찰 | 4.6/5 | 유지 |
| 감사 가능한 타로 | 4.5/5 | 유지 |
| 게스트 개인정보·데이터 권리 | 4.4/5 | 유지 |
| 컨텍스트형 온보딩 | 4.3/5 | 유지 |
| 통합 프로필·직업 | 4.2/5 | 유지 |
| 2인 궁합 | 4.1/5 | 유지 |
| 공유 카드 | 3.4/5 | 개선 실험 |
| 음악 방향 | 3.2/5 | 개선 실험 |
| 액세서리 방향 | 3.0/5 | 개선 실험 |
| 유명인 비교 | 2.9/5 | 보류·보조 |
| 닫힌 상점 미리보기 | 2.4/5 | 닫힌 상태 유지 |
| 유료 실시간 AI | 1.8/5 | 비활성 유지 |
| 네이티브 앱 | 1.0/5 | 현재 빌드에서 제외 |
| 커뮤니티·실시간 점술가·진단 | 0.5/5 | 제거 |

## 7. 다음 우선순위와 차단 조건

로컬에서 더 진행 가능한 일은 문서·콘텐츠·테스트 개선이다. 다음 실제 제품 단계는 외부 승인이 필요하다.

1. 인증/DB, AI, 결제, 분석, 모니터링, 이메일/알림, 호스팅 서비스 선택과 계정 승인
2. 승인된 어댑터 구현 후 스테이징 소유권 격리, 삭제, 마이그레이션, 백업/복구, 실패, 부하, 비용 검증
3. 법률·개인정보·연령·위기대응·수비학/타로 편집·한영 원어민·접근성·보안·상표 검토
4. Plus/Pro 가격과 AI 단위경제 검증
5. 상점 개방 전 공급자, 소재/알레르기/치수, 원산지, 재고, 배송, 환불, 세금, 사기, 지원, 소비자법, 접근성 승인
6. 사용자가 명시적으로 요청한 뒤에만 스테이징 또는 프로덕션 배포
7. 웹의 활성화, D7/D30 유지, Reality Check 회수율, 삭제 신뢰, 단위경제가 검증된 뒤 네이티브 앱 재평가

예상 외부 비용은 아직 0원이다. 실제 비용은 서비스·트래픽·AI 모델·결제 지역·호스팅 선택 이후 산정한다.

## 8. 새 Windows Codex 시작 프롬프트

```text
이 작업공간의 CODEX-WINDOWS-HANDOFF.md와 docs/Continuation-State.md를 먼저 읽고 현재 0.15.0 검증 기준선을 유지해라. 다른 프로젝트의 파일·포트·프로세스를 건드리지 말고, 포트 3000이 점유돼 있으면 중단해라. 명세→수용기준→개인정보/안전 검토→구현→단위/통합/브라우저/회귀→문서 갱신 순서를 지켜 다음 미완료 우선순위를 진행해라. 외부 계정, 결제, 법적 결정, 도메인, 앱스토어, 실제 배포는 승인 없이 수행하지 마라. Windows 브라우저 회귀는 Chromium과 mobile을 분리하고 mobile은 한 작업자 또는 파일별 새 프로세스로 실행해라.
```
