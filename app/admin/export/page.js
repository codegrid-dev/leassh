import Link from "next/link";
import "../../legal.css";

export const metadata = {
  title: "Export applications · Leashh",
  robots: { index: false, follow: false },
};

// Deliberately plain. A password field that posts straight to the route, which
// answers with the file. No session, no cookie, nothing to log out of.
export default function ExportPage() {
  return (
    <>
      <header className="legal-hd">
        <div className="legal-in">
          <Link href="/" className="mark">leashh</Link>
          <h1>Export applications</h1>
        </div>
      </header>
      <main className="legal-body">
        <p>
          Downloads every completed application as a CSV. Only applications where the declarations
          were confirmed are included, so anyone who started and did not finish is never in the
          file.
        </p>
        <form method="POST" action="/api/admin/export" style={{ marginTop: "26px", maxWidth: "380px" }}>
          <label htmlFor="password"
            style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "11px",
              border: "1.5px solid var(--line)", fontSize: "14.4px", fontFamily: "inherit",
            }} />
          <button type="submit" className="btn btn-primary" style={{ marginTop: "16px" }}>
            Download CSV
          </button>
        </form>
      </main>
    </>
  );
}
