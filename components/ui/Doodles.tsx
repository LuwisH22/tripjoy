export function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none">
      <path
        d="M20 45c-9 0-16-7-16-16s7-16 16-16c2 0 4 .4 6 1 3-9 11-15 21-15 11 0 21 8 23 19 1 0 2-.2 3-.2 9 0 16 7 16 16s-7 16-16 16H20z"
        fill="#fff"
        stroke="#B9E7FF"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function PlanePath({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none">
      <path
        d="M5 70 C 50 70, 60 10, 110 25 S 180 50, 195 12"
        stroke="#6EC6FF"
        strokeWidth="2.5"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <path
        d="M188 6l12 6-11 7-1-6-7-1 7-6z"
        fill="#2D2D2D"
        transform="rotate(8 190 12)"
      />
    </svg>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#FFD166">
      <path
        d="M12 2l2.5 6.5L21 9l-5 4 1.6 7L12 16.5 6.4 20 8 13 3 9l6.5-.5z"
        stroke="#2D2D2D"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#FFD166">
      <path d="M12 2c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9z" />
    </svg>
  );
}

export function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#FF8FA3">
      <path
        d="M12 21s-8-5.3-10-11C1 6 4 3 7.5 3 9.7 3 11.3 4.4 12 6c.7-1.6 2.3-3 4.5-3C20 3 23 6 22 10c-2 5.7-10 11-10 11z"
        stroke="#2D2D2D"
        strokeWidth="1.2"
      />
    </svg>
  );
}
