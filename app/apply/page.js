import "./wizard.css";
import Wizard from "./Wizard";

export const metadata = {
  title: "Become a Pet Nanny · Leashh",
  description:
    "Apply to become a Leashh Pet Nanny. About five minutes, nothing to upload, free to apply.",
  // An application form is not something a search engine should index.
  robots: { index: false, follow: true },
};

export default function ApplyPage() {
  return <Wizard />;
}
