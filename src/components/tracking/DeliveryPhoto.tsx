import { cn } from '../../lib/ui'

export function DeliveryPhoto({ caption, className }: { caption?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label="Delivery photo: a package on the doormat outside a front door"
      className={cn('block h-auto w-full', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="240" fill="#d9cbb5" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} y={i * 20 + 8} width="320" height="2" fill="#cbbba2" />
      ))}
      <rect x="104" y="20" width="112" height="176" fill="#f4f1ea" />
      <rect x="114" y="30" width="92" height="166" fill="#2f4858" />
      <rect x="124" y="42" width="72" height="56" rx="3" fill="#29404f" stroke="#3a5a6d" strokeWidth="2" />
      <rect x="124" y="108" width="72" height="76" rx="3" fill="#29404f" stroke="#3a5a6d" strokeWidth="2" />
      <circle cx="194" cy="118" r="4" fill="#d4b26a" />
      <rect x="226" y="60" width="30" height="16" rx="2" fill="#2f4858" />
      <text x="241" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f4f1ea" fontFamily="system-ui">
        2145
      </text>
      <path d="M48 176 L78 176 L73 204 L53 204 Z" fill="#b5653b" />
      <ellipse cx="63" cy="160" rx="22" ry="20" fill="#5b8a4d" />
      <ellipse cx="52" cy="150" rx="11" ry="14" fill="#6b9c5a" />
      <rect y="196" width="320" height="44" fill="#9aa1a8" />
      <rect y="196" width="320" height="5" fill="#b3b9bf" />
      <rect x="112" y="204" width="96" height="22" rx="3" fill="#7a5436" />
      <rect x="130" y="172" width="62" height="42" rx="2" fill="#c89b6d" />
      <rect x="130" y="172" width="62" height="10" fill="#b8895a" />
      <rect x="157" y="172" width="8" height="42" fill="#e3c796" />
      <rect x="136" y="188" width="18" height="12" rx="1" fill="#fbfaf7" />
      {caption && (
        <>
          <rect x="0" y="212" width="320" height="28" fill="black" opacity="0.35" />
          <text x="12" y="230" fontSize="11" fill="white" fontFamily="system-ui" fontWeight="600">
            {caption}
          </text>
        </>
      )}
    </svg>
  )
}
