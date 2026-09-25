// Outline icon, 24px grid, currentColor, per brand guidelines page 11.
// Stroke 1.9 decorative is the prototype default.
export default function Icon({ d, size = 20, stroke = 1.9 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.trim().split(/\s+(?=M)/).map((seg, i) => (
        <path key={i} d={seg} />
      ))}
    </svg>
  );
}
