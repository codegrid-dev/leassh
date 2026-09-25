import { SERVICES } from "@/app/lib/services";
import Icon from "./Icon";

// The track is rendered twice so the marquee loops seamlessly.
export default function Ticker() {
  const run = (copy) =>
    SERVICES.map((s) => (
      <span className="rate-pill" key={copy + s.k}>
        <i><Icon d={s.ico} size={15} /></i>
        {s.n} <em>£{s.lo} to £{s.hi}</em> {s.unit}
      </span>
    ));
  return (
    <div className="ticker" aria-label="Typical rates by service">
      <div className="ticker-track" id="tick">{run("a")}{run("b")}</div>
    </div>
  );
}
