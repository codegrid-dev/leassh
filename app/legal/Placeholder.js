import Link from "next/link";
import "../legal.css";

// The client has not supplied these documents yet. A 404 is worse than saying
// so plainly, and the footer, the wizard header and the step 4 declarations
// all link here.
export default function Placeholder({ title, blurb }) {
  return (
    <>
      <header className="legal-hd">
        <div className="legal-in">
          <Link href="/" className="mark">leashh</Link>
          <h1>{title}</h1>
        </div>
      </header>
      <main className="legal-body">
        <p>{blurb}</p>
        <p>
          We are finalising the wording. Until it is published here, you can ask us anything about
          how we handle your information by emailing{" "}
          <a href="mailto:privacy@leashh.com">privacy@leashh.com</a>.
        </p>
        <p><Link href="/">Back to Leashh</Link></p>
      </main>
    </>
  );
}
