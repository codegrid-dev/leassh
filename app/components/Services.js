import { SERVICES } from "@/app/lib/services";
import Icon from "./Icon";

export default function Services() {
  return (
    <section className="sec sec-alt" id="services">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">Pick one or pick the lot</span>
          <h2>Offer what suits your week</h2>
          <p>
            Most Pet Nannies start with one service and add more once the enquiries come in. Rates
            below are what owners around the UK typically pay.
          </p>
        </div>
        <div className="svc-grid" id="svcGrid">
          {SERVICES.map((s) => (
            <article className="svc rv" key={s.k}>
              <div className="svc-ico"><Icon d={s.ico} size={21} /></div>
              <h3>{s.n}</h3>
              <p>{s.d}</p>
              <div className="svc-rate money">
                £{s.lo} to £{s.hi} <span>{s.unit}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
