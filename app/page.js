import Header from "./components/Header";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import HowItWorks from "./components/HowItWorks";
import Services from "./components/Services";
import WhyStay from "./components/WhyStay";
import Stories from "./components/Stories";
import Business from "./components/Business";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";

// The supplied prototype also carried an inline #apply form. Nothing links to
// it, every call to action points at a separate apply page, and the wizard
// screen board supersedes it, so it is not ported.

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Ticker />
      <HowItWorks />
      <Services />
      <WhyStay />
      <Stories />
      <Business />
      <Faq />
      <FinalCta />
      <Footer />
      <Reveal />
    </>
  );
}
