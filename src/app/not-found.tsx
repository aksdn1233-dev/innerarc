import Link from "next/link";

// A mistyped or retired address should read as a wrong turn, not as the site being
// down. Rendered by both the root and every locale segment's notFound() call.
export default function NotFound() {
  return (
    <main className="shell error-shell" id="main-content" tabIndex={-1}>
      <section className="error-card">
        <p className="eyebrow">404</p>
        <h1>찾을 수 없는 주소입니다</h1>
        <p>
          주소가 바뀌었거나 잘못 입력되었습니다. 서비스는 정상적으로 운영 중입니다.
        </p>
        <p className="error-card-en">
          This address does not exist. The service itself is running normally.
        </p>
        <div className="error-actions">
          <Link className="primary-button" href="/ko">처음으로</Link>
          <Link className="secondary-button" href="/en">English</Link>
        </div>
      </section>
    </main>
  );
}
