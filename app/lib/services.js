// Service catalogue, lifted verbatim from the supplied prototype.
// Rate ranges are market estimates. The wizard build notes say these should
// eventually be served from the database by postcode rather than hardcoded.
export const SERVICES = [
  {k:'walk',  n:'Dog walking',            d:'Solo or small group walks, thirty to sixty minutes, rain or shine.',      lo:14, hi:18, unit:'an hour',    sug:16, ico:'M6.5 8.5a2 2 0 100-4 2 2 0 000 4zM11 6.5a2 2 0 100-4 2 2 0 000 4zM15.5 8.5a2 2 0 100-4 2 2 0 000 4zM19 12.5a2 2 0 100-4 2 2 0 000 4zM11 20c3 0 5-1.6 5-3.6 0-1.9-1.6-2.6-2.8-3.8-1-1-1.4-2.1-2.7-2.1s-1.7 1.1-2.7 2.1C6.6 13.8 5 14.5 5 16.4 5 18.4 8 20 11 20z'},
  {k:'dropin',n:'Drop-in visits',         d:'Feeding, fresh water, a bit of fuss and a photo sent home.',              lo:12, hi:16, unit:'a visit',    sug:14, ico:'M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h8M10.5 12H20M16.5 8.5L20 12l-3.5 3.5'},
  {k:'board', n:'Home boarding',          d:'The pet stays at yours overnight. A council licence is needed for this.', lo:28, hi:45, unit:'a night',    sug:34, ico:'M20.5 14.6A8.6 8.6 0 019.4 3.5a8.6 8.6 0 1011.1 11.1z M17 4.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z'},
  {k:'house', n:'House sitting',          d:'You stay at theirs, so the pet never leaves its own sofa.',               lo:40, hi:65, unit:'a night',    sug:48, ico:'M12 3l9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z M9.5 21v-6h5v6'},
  {k:'bath',  n:'Pet bathing',            d:'Wash, dry and brush out, at your place or theirs.',                       lo:20, hi:35, unit:'a session',  sug:26, ico:'M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4zM7 12V6a2 2 0 014 0M17 20l1 2M7 20l-1 2'},
  {k:'taxi',  n:'Pet taxi',               d:'Lifts to the vet, the groomer or the kennels and back again.',            lo:15, hi:30, unit:'a journey',  sug:20, ico:'M4 16h16M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M6.5 19a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM17.5 19a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z'},
  {k:'friend',n:'Pet friend and play',    d:'Company, play and enrichment for pets who hate being alone.',             lo:12, hi:16, unit:'an hour',    sug:14, ico:'M12 20s-7-4.3-7-9.1A4 4 0 0112 8.6 4 4 0 0119 10.9C19 15.7 12 20 12 20z'},
  {k:'puppy', n:'Puppy and kitten care',  d:'Toilet breaks, socialising and settling a new arrival in.',               lo:14, hi:20, unit:'a visit',    sug:16, ico:'M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z M18 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z'}
];
