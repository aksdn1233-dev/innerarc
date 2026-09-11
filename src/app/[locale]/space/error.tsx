"use client";
export default function SpaceErrorPage({ reset }: { reset(): void }) { return <main><h1>풍수학 · Feng Shui</h1><p>화면을 불러오지 못했습니다. 다시 시도해 주세요. / Could not load the workspace. Please retry.</p><button onClick={reset}>다시 시도 / Retry</button></main>; }
