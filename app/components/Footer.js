export default function Footer() {
  return (
    <>
      <footer className="foot">
        <div className="wrap">
          <div className="foot-in">
            <div>
              <span className="logo">leashh</span>
              <p className="foot-blurb">The place pet owners find someone local they can trust, and pet lovers turn their spare hours into extra income.</p>
            </div>
            <div>
              <h4>Pet Nannies</h4>
              <ul>
                <li><a href="/apply">Become a Pet Nanny</a></li>
                <li><a href="#services">Services and rates</a></li>
                <li><a href="#how">How it works</a></li>
                <li><a href="#faq">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4>Businesses</h4>
              <ul>
                <li><a href="#business">List your business</a></li>
                <li><a href="#business">Veterinary practices</a></li>
                <li><a href="#business">Grooming salons</a></li>
                <li><a href="#business">Kennels and catteries</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Leashh</a></li>
                <li><a href="terms.html">Pet Nanny terms</a></li>
                <li><a href="privacy.html">Privacy notice</a></li>
                <li><a href="#">Contact us</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bar">
            <span>© 2026 Leashh. All rights reserved.</span>
            <span><a href="terms.html">Terms</a> · <a href="privacy.html">Privacy notice</a> · <a href="privacy.html#cookies">Cookies</a> · <a href="#">Modern slavery statement</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
