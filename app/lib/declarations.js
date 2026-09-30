// Keys only. The wording itself lives in the declaration_texts table, versioned,
// because "if the transfer is ever challenged, this is the screen produced in
// evidence". The client's final copy lands there as a new version with no code
// change, which is why the pending wording never blocked the build.
export const MANDATORY = [
  "age_uk", "accurate", "onward_transfer", "identity_checks",
  "self_employed", "licences", "terms_privacy",
];
export const OPTIONAL = ["marketing_email", "marketing_sms"];

// "LSH-" plus five characters from an alphabet with no look-alikes.
export function reference() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return "LSH-" + s;
}

// The wording again, with the emphasis the brand guidelines allow ("key terms
// inside the sentence are bold, which is the only emphasis allowed in legal
// wording") and the two links.
//
// The database holds the same sentences as plain text, because that is the
// evidence record. These carry markup only. A test strips the markers and
// compares the two, so the pair cannot drift apart unnoticed.
export const TEXTS = {
  age_uk:
    "I am **18 or over** and I live in the United Kingdom.",
  accurate:
    "The information I have given is **accurate and my own**. I understand that Leashh has not checked it, and that giving false information may mean my application is rejected.",
  onward_transfer:
    "I agree that Leashh may **pass my details to a pet services company that operates the Pet Nanny network**, and that **this company may contact me directly** about becoming a Pet Nanny.",
  identity_checks:
    "I understand that company will **verify my identity and ask me for documents** as part of its own onboarding, which may include a background check, and that it decides whether to approve me.",
  self_employed:
    "I understand I would be working on a **self-employed** basis. Leashh does not employ me, does not set my hours or rates, does not arrange or book work, and does not take a share of what I earn. I am responsible for my own tax and National Insurance.",
  licences:
    "I will hold any **licence, insurance or registration** the law requires before I carry out any service, including a council animal activity licence if I board or day care animals at my home.",
  terms_privacy:
    "I have read and agree to the [Pet Nanny Terms](/terms) and I have read the [Privacy Notice](/privacy).",
  marketing_email:
    "Email me tips on getting my first enquiries, and news about Leashh.",
  marketing_sms:
    "Send me text messages about my application and about work in my area.",
};

// Strips the markers back to the plain sentence the database stores.
export const plain = (t) =>
  t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");
