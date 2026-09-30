// RFC 4180 quoting: double the quotes, and quote any field containing a
// comma, quote or newline. The bio is free text, so all three are likely.
const cell = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(columns, rows) {
  const lines = [columns.map(cell).join(",")];
  for (const r of rows) lines.push(columns.map((c) => cell(r[c])).join(","));
  // Excel reads a UTF-8 file as the local codepage unless it sees a BOM, which
  // turns every £ in the rates into mojibake. The client opens this in Excel.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
