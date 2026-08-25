"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SajuInputError,
  buildSajuChart,
  type SajuChart,
  type SajuViewpoints,
} from "@/core/saju";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";
import type { Locale } from "@/i18n/config";
import { sajuCopy } from "@/i18n/saju-copy";
import "./saju-experience.module.css";

/**
 * The free rung of the 사주 menu.
 *
 * The chart itself is given away: four pillars, the day master, the ten gods, the phase
 * balance, the 절기 the month sits between, and every correction that was applied to get
 * there. That is the part a visitor can check against any 만세력, and handing it over is
 * what earns the right to ask for anything else.
 *
 * The three viewpoints are named and their headline is shown, but the reading behind each
 * one is the paid product. The lock is on interpretation, never on the calculation — a
 * site that hid the chart would be asking to be trusted about arithmetic anyone can
 * verify, which is the opposite of the argument this product makes.
 */
export function SajuExperience({ locale, price }: { locale: Locale; price: number }) {
  // Bounded here rather than in the module so a long-lived tab still refuses tomorrow.
  const maxBirthDate = currentMaxBirthDate();
  const t = sajuCopy[locale];
  const router = useRouter();
  const [chart, setChart] = useState<SajuChart | null>(null);
  const [views, setViews] = useState<SajuViewpoints | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openViewpoint, setOpenViewpoint] = useState<string | null>(null);
  const submitLabel = locale === "ko"
    ? `${price.toLocaleString("ko-KR")}원 결제로 원국 받기`
    : `Get the chart for ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(price)}`;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const birthTime = String(form.get("birthTime") ?? "");
    const readingName = String(form.get("readingName") ?? "").trim();
    const submittedBirthDate = String(form.get("birthDate") ?? "");
    if (form.get("privacyRequired") !== "on") {
      setChart(null);
      setViews(null);
      setError(t.privacyRequired);
      return;
    }
    // The field carries min/max, but a submitted form can arrive without them.
    if (!isAcceptedBirthDate(submittedBirthDate)) {
      setChart(null);
      setViews(null);
      setError(t.outOfRange);
      return;
    }
    try {
      buildSajuChart({
        birthDate: String(form.get("birthDate") ?? ""),
        birthTime: birthTime || undefined,
        sex: form.get("sex") === "male" ? "male" : "female",
        midnightConvention: form.get("midnight") === "조자시" ? "조자시" : "야자시",
      });
      const draft = {
        version: 1 as const,
        locale,
        productCode: "plus_30d" as const,
        readingKind: "saju_chart" as const,
        birthDate: submittedBirthDate,
        birthTime: birthTime || undefined,
        name: readingName,
        focusId: "growth" as const,
        concern: "",
        gender: form.get("sex") === "male" ? "male" as const : "female" as const,
        midnightConvention: form.get("midnight") === "조자시" ? "조자시" as const : "야자시" as const,
        createdAt: new Date().toISOString(),
      };
      window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(draft));
      setChart(null);
      setViews(null);
      setError(null);
      router.push(`/${locale}/plans?product=plus_30d`);
    } catch (caught) {
      setChart(null);
      setViews(null);
      setError(caught instanceof SajuInputError ? caught.message : t.genericError);
    }
  }

  return (
    <main className="saju-page">
      <section className="saju-portal" aria-labelledby="saju-title">
        <header className="saju-head">
          <span className="saju-edition">GYEOL · FOUR PILLARS</span>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="saju-title">{t.title}</h1>
          <p className="saju-intro">{t.intro}</p>
        </header>
        <div className="saju-portal-visual" aria-hidden="true">
          <span className="saju-portal-ring" />
          <span className="saju-portal-core">{locale === "ko" ? "원국" : "CHART"}</span>
          <span data-phase="wood">{locale === "ko" ? "목" : "WOOD"}</span>
          <span data-phase="fire">{locale === "ko" ? "화" : "FIRE"}</span>
          <span data-phase="earth">{locale === "ko" ? "토" : "EARTH"}</span>
          <span data-phase="metal">{locale === "ko" ? "금" : "METAL"}</span>
          <span data-phase="water">{locale === "ko" ? "수" : "WATER"}</span>
        </div>
      </section>

      <div className="saju-intake-layout">
      <form className="saju-form" onSubmit={submit} noValidate>
        <div className="saju-form-head">
          <span>{locale === "ko" ? "01 · 원국 정보" : "01 · CHART DETAILS"}</span>
          <h2>{locale === "ko" ? "기억나는 만큼만 알려주세요" : "Share only what you remember"}</h2>
          <p>{locale === "ko" ? "모르는 태어난 시각은 추측하지 않고 비워둡니다." : "An unknown birth time stays blank rather than being guessed."}</p>
        </div>
        <div className="saju-field">
          <label htmlFor="saju-birthDate">{t.birthDate}</label>
          <input id="saju-birthDate" name="birthDate" required type="date" max={maxBirthDate} min={MIN_BIRTH_DATE} />
          <small>{t.solarOnly}</small>
        </div>

        <div className="saju-field">
          <label htmlFor="saju-readingName">{t.readingName}</label>
          <input autoComplete="name" id="saju-readingName" maxLength={80} name="readingName" type="text" />
          <small>{t.readingNameOptional}</small>
        </div>

        <div className="saju-field">
          <label htmlFor="saju-birthTime">{t.birthTime}</label>
          <input id="saju-birthTime" name="birthTime" type="time" />
          {/* Said before the form is submitted, not after: a visitor who does not know
              their birth time should know what they will and will not get. */}
          <small>{t.timeOptional}</small>
        </div>

        <fieldset className="saju-field">
          <legend>{t.sex}</legend>
          <label><input defaultChecked name="sex" type="radio" value="female" /> {t.female}</label>
          <label><input name="sex" type="radio" value="male" /> {t.male}</label>
          <small>{t.sexReason}</small>
        </fieldset>

        <details className="saju-advanced">
          <summary>{t.advanced}</summary>
          <fieldset className="saju-field">
            <legend>{t.midnight}</legend>
            <label><input defaultChecked name="midnight" type="radio" value="야자시" /> {t.lateNight}</label>
            <label><input name="midnight" type="radio" value="조자시" /> {t.earlyNight}</label>
            <small>{t.midnightReason}</small>
          </fieldset>
        </details>

        <label className="check">
          <input name="privacyRequired" required type="checkbox" />
          <span>{t.privacyRequired}</span>
        </label>

        <button className="saju-submit" type="submit">{submitLabel}</button>
        {error && <p className="saju-error" role="alert">{error}</p>}
      </form>

      <aside className="saju-shop-entry">
        <div><p className="eyebrow">SAJU ACCESSORY</p><h2>{locale === "ko" ? "내 사주 오행에 맞는 악세서리 방향" : "Accessory directions for your Saju phases"}</h2><p>{locale === "ko" ? "오행별 형태·색·소재 방향을 먼저 비교해 보세요. 물건이 운이나 결과를 바꾸는 것은 아닙니다." : "Compare form, palette, and material directions by phase. An object does not change luck or outcomes."}</p></div>
        <Link href={`/${locale}/shop#saju-accessory-title`}>{locale === "ko" ? "사주 추천 악세서리 보기" : "See Saju accessory directions"}</Link>
      </aside>
      </div>

      {chart && views && (
        <section aria-live="polite" className="saju-result" id="saju-result">
          {chart.termBoundaryWarning && (
            <p className="saju-warning" role="status">{chart.termBoundaryWarning}</p>
          )}

          <h2>{t.chartTitle}</h2>
          <div className="saju-chart-scroll">
            <table className="saju-chart">
              <caption className="visually-hidden">{t.chartTitle}</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="visually-hidden">{t.row}</span></th>
                  <th scope="col">{t.hourPillar}</th>
                  <th scope="col">{t.dayPillar}</th>
                  <th scope="col">{t.monthPillar}</th>
                  <th scope="col">{t.yearPillar}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t.stemRow}</th>
                  <td>{chart.hour?.stem ?? "—"}</td>
                  <td className="is-self">{chart.day.stem}</td>
                  <td>{chart.month.stem}</td>
                  <td>{chart.year.stem}</td>
                </tr>
                <tr>
                  <th scope="row">{t.branchRow}</th>
                  <td>{chart.hour?.branch ?? "—"}</td>
                  <td>{chart.day.branch}</td>
                  <td>{chart.month.branch}</td>
                  <td>{chart.year.branch}</td>
                </tr>
                <tr>
                  <th scope="row">{t.godRow}</th>
                  <td>{chart.tenGods.hourStem ?? "—"}</td>
                  <td className="is-self">{t.self}</td>
                  <td>{chart.tenGods.monthStem}</td>
                  <td>{chart.tenGods.yearStem}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {chart.hour === null && <p className="saju-note">{t.noHourPillar}</p>}

          <dl className="saju-facts">
            <div><dt>{t.dayMaster}</dt><dd>{chart.dayMaster} · {chart.dayMasterPhase} · {chart.dayMasterPolarity}</dd></div>
            <div><dt>{t.monthTerm}</dt><dd>{chart.monthTerm.name} → {chart.nextTerm.name}</dd></div>
            <div><dt>{t.voidBranches}</dt><dd>{chart.voidBranches.join(" · ")}</dd></div>
            <div><dt>{t.phaseBalance}</dt><dd>{
              Object.entries(chart.phaseBalance)
                .map(([phase, count]) => `${phase} ${count}`).join(" · ")
            }</dd></div>
          </dl>

          {/* The corrections are shown because they changed the answer. A visitor who
              compares this against another site and finds a different hour pillar can
              see here exactly why, instead of concluding one of them is broken. */}
          <details className="saju-derivation">
            <summary>{t.derivationTitle}</summary>
            <ul>
              <li>{t.wallClock}: {chart.time.wallClock || t.notGiven}</li>
              <li>{t.zone}: UTC{chart.time.zoneOffsetMinutes >= 0 ? "+" : ""}
                {Math.floor(chart.time.zoneOffsetMinutes / 60)}:
                {String(Math.abs(chart.time.zoneOffsetMinutes % 60)).padStart(2, "0")}</li>
              <li>{t.longitude}: {chart.time.longitudeCorrectionMinutes}{t.minutes}</li>
              <li>{t.corrected}: {chart.time.correctedLocalTime}</li>
              <li>{t.convention}: {chart.time.midnightConvention}</li>
              <li>{t.ruleVersion}: {chart.ruleVersion}</li>
            </ul>
            <p>{t.derivationNote}</p>
          </details>

          <h2 className="saju-viewpoints-title">{t.viewpointsTitle}</h2>
          <p className="saju-viewpoints-intro">{t.viewpointsIntro}</p>

          <div className="saju-viewpoints">
            {([
              [views.strength.viewpoint, t.strengthBlurb, `${views.strength.label} · ${views.strength.score > 0 ? "+" : ""}${views.strength.score}`],
              [views.climate.viewpoint, t.climateBlurb, `${views.climate.season} · ${views.climate.need}`],
              [views.structure.viewpoint, t.structureBlurb, views.structure.name],
            ] as const).map(([name, blurb, headline]) => (
              <article className="saju-viewpoint" key={name}>
                <h3>{name}</h3>
                <p className="saju-viewpoint-headline">{headline}</p>
                <p className="saju-viewpoint-blurb">{blurb}</p>
                <button
                  aria-expanded={openViewpoint === name}
                  className="saju-viewpoint-open"
                  onClick={() => setOpenViewpoint(openViewpoint === name ? null : name)}
                  type="button"
                >
                  {t.howDerived}
                </button>
                {openViewpoint === name && (
                  <div className="saju-viewpoint-derivation">
                    {name === "억부" && (
                      <ul>
                        {views.strength.contributions.map((entry) => (
                          <li key={entry.source}>
                            {entry.source} · {entry.god} · {entry.weight}
                            {entry.supports ? ` (${t.supports})` : ` (${t.drains})`}
                          </li>
                        ))}
                      </ul>
                    )}
                    {name === "조후" && <p>{views.climate.note}</p>}
                    {name === "격국" && <p>{views.structure.derivedFrom}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>

          <aside className="saju-upsell">
            <h3>{t.upsellTitle}</h3>
            <p>{t.upsellBody}</p>
            <ul>{t.upsellItems.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link className="saju-upsell-cta" href={`/${locale}/plans?product=pro_30d`}>
              {t.upsellCta}
            </Link>
            <p className="saju-upsell-honest">{t.upsellHonest}</p>
          </aside>

          <p className="saju-limits">{t.limits}</p>
        </section>
      )}
    </main>
  );
}
