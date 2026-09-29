import Link from "next/link";

// Holding page for /apply. Every call to action on the homepage points here,
// so without it the whole site dead-ends in a 404. Replaced by the wizard.
//
// Not indexed: a placeholder should never be the first thing a search engine
// learns about the application flow.
export const metadata = {
  title: "Become a Pet Nanny · Leashh",
  robots: { index: false, follow: true },
};

export default function ApplyHolding() {
  return (
    <main
      className="final"
      style={{
        // 100vh rather than dvh: this page has no scroll, and dvh left a gap
        // below the gradient in testing.
        minHeight: "100vh",
        display: "grid",
        alignItems: "center",
        padding: "48px 0",
      }}
    >
      <div className="wrap final-in">
        {/* .logo is inline-block and .eyebrow is inline-flex, so the wordmark
            needs its own block or the two collide on one line. */}
        <div style={{ marginBottom: "38px" }}>
          <Link href="/" className="logo" style={{ fontSize: "34px" }}>
            leashh
          </Link>
        </div>

        <span className="eyebrow" style={{ color: "#D9C4FF" }}>
          Pet Nanny applications
        </span>
        <h2 style={{ marginTop: "14px" }}>Almost ready for you.</h2>
        <p>
          We are finishing the sign-up form. It takes about five minutes, there is nothing to
          upload and it is free to apply, so it is worth coming back for.
        </p>
        <Link href="/" className="btn btn-white">Back to Leashh</Link>
        <small>UK residents aged 18 and over</small>
      </div>
    </main>
  );
}
