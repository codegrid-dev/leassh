export default function Faq() {
  return (
    <>
      <section className="sec" id="faq">
        <div className="wrap faq-wrap">
          <div className="sec-head faq-head rv">
            <span className="eyebrow">Before you sign up</span>
            <h2>The questions everyone asks</h2>
            <p>Still stuck? Email <a href="mailto:nannies@leashh.co.uk" style={{color: 'var(--v-700)', fontWeight: '700'}}>nannies@leashh.co.uk</a> and a real person will answer.</p>
          </div>
          <div className="faq-list">
            <details className="qa rv"><summary>Do I need qualifications or experience?</summary><div className="a">For walking, drop-in visits, companionship and pet taxi work, no formal qualification is required. What owners care about is that you write honestly about the animals you are confident with, and that you turn up. If you plan to board animals in your own home you will need a licence from your council, and grooming customers usually look for a recognised qualification.</div></details>
            <details className="qa rv"><summary>Will I need a licence?</summary><div className="a">If you board dogs overnight in your home, or run day care for dogs as a business, you will usually need an animal activity licence from your local council. Rules differ across England, Wales, Scotland and Northern Ireland, so check with your own council first. Walking, drop-in visits and sitting in the owner&apos;s home do not normally need one. Tell us about any licence you hold when you sign up.</div></details>
            <details className="qa rv"><summary>Am I employed by Leashh?</summary><div className="a">No. Pet Nannies are self employed. You choose your own clients, set your own prices, work the hours you want and are responsible for your own tax and National Insurance. HMRC offers a trading allowance for small amounts of self employed income, so check the current threshold and your own position with HMRC or an accountant.</div></details>
            <details className="qa rv"><summary>How and when do I get paid?</summary><div className="a">Directly by the owner, in whatever way suits you both. Leashh introduces you and does not sit in the middle of the money, so there is no platform commission, no payout schedule and no waiting a fortnight for your own earnings.</div></details>
            <details className="qa rv"><summary>Does Leashh book the work for me?</summary><div className="a">No, and that is deliberate. There is no diary, no shift allocation and no cancellation penalty. Owners near you find your profile and message you, then the two of you agree what happens. You keep full control of what you take on.</div></details>
            <details className="qa rv"><summary>What will you ask me for?</summary><div className="a">Your name, mobile and email first, then a code from your inbox so we know the address is real. After that, your postcode, what you want to offer, what you charge and a few lines about yourself. There are no documents to upload and no ID check at sign-up.</div></details>
            <details className="qa rv"><summary>What does it cost to join?</summary><div className="a">Nothing. Signing up, verifying your ID and keeping your profile listed are all free. There is no monthly fee and no charge per enquiry.</div></details>
            <details className="qa rv"><summary>Is my home address shown to owners?</summary><div className="a">Never. We do not even ask for it. We take your postcode so owners can see you are nearby, and they see your first name, your photo, your profile and an approximate area. Nothing more.</div></details>
            <details className="qa rv"><summary>Do I need insurance?</summary><div className="a">It is not compulsory, but public liability and care, custody and control cover is inexpensive and most experienced Pet Nannies carry it. Say so when you sign up. Pet Nannies who carry it get noticeably more enquiries.</div></details>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
    </>
  );
}
