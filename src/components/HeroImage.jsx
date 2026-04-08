import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

/* Month-specific seeds reflecting Indian seasons & festivals */
const MONTH_SEEDS = [
  "mist",
  "marigold",
  "colors",
  "mango",
  "lotus",
  "monsoon",
  "waterfall",
  "harvest",
  "paddy",
  "festival",
  "golden",
  "fog",
];

/* Stable Picsum IDs (deterministic month images, less visual randomness) */
const MONTH_IMAGE_IDS = [1015, 1016, 1018, 1020, 1024, 1025, 1031, 1033, 1035, 1036, 1040, 1043];

/**
 * Premium wall-calendar hero image with robust fallback behavior.
 * Local fallback is always rendered so panel never goes blank in light/dark modes.
 */
export default function HeroImage({ currentDate, isDark, transitionPhase = "" }) {
  const monthIndex = currentDate.getMonth();
  const seed = MONTH_SEEDS[monthIndex];
  const year = format(currentDate, "yyyy");
  const month = format(currentDate, "MMMM");
  const weekdayLabel = format(currentDate, "EEEE, MMMM d");

  const publicBase = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  const localFallbackSrc = `${publicBase}/hero-fallback.jpg`;

  const remoteSources = useMemo(
    () => [
      `https://picsum.photos/id/${MONTH_IMAGE_IDS[monthIndex]}/720/1080`,
      `https://picsum.photos/seed/${seed}${year}/720/1080`,
      "https://picsum.photos/seed/picsum/720/1080",
      "https://picsum.photos/id/1018/720/1080",
    ],
    [monthIndex, seed, year]
  );

  const [sourceIndex, setSourceIndex] = useState(0);
  const [showRemote, setShowRemote] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const panelRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setSourceIndex(0);
    setShowRemote(true);
  }, [remoteSources]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleImageError = () => {
    setSourceIndex((prev) => {
      if (prev < remoteSources.length - 1) {
        return prev + 1;
      }
      setShowRemote(false);
      return prev;
    });
  };

  const handleMouseMove = (event) => {
    if (!panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const relX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const relY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const maxShift = 3.5;

    pendingRef.current = { x: relX * maxShift, y: relY * maxShift };

    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      setParallax(pendingRef.current);
      rafRef.current = 0;
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParallax({ x: 0, y: 0 });
  };

  const phaseClass =
    transitionPhase === "out"
      ? "opacity-0 -translate-y-2"
      : transitionPhase === "in"
      ? "opacity-0 translate-y-2"
      : "opacity-100 translate-y-0";

  const imageTransform = `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(${isHovered ? 1.05 : 1})`;

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full min-h-[260px] md:min-h-full overflow-hidden transition-all duration-[340ms] ease-in-out ${phaseClass}`}
    >
      {/* Always-visible local base fallback */}
      <img
        src={localFallbackSrc}
        alt={`${month} ${year} fallback`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: imageTransform,
          filter: isDark
            ? "brightness(1.18) contrast(1.08) saturate(1.08)"
            : "brightness(0.98) contrast(1.12) saturate(1.08)",
        }}
        loading="eager"
      />

      {/* Optional remote image overlay; failure never blanks the panel */}
      {showRemote && (
        <img
          src={remoteSources[sourceIndex]}
          alt={`${month} ${year} scenery`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform"
          style={{
            transform: imageTransform,
            filter: isDark
              ? "brightness(1.2) contrast(1.08) saturate(1.06)"
              : "brightness(0.98) contrast(1.12) saturate(1.08)",
            opacity: isDark ? 0.86 : 1,
          }}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      )}

      {/* Layered readability gradients */}
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-t ${
          isDark ? "from-black/16 via-black/5 to-transparent" : "from-black/30 via-black/10 to-transparent"
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-b ${
          isDark ? "from-black/2 via-transparent to-transparent" : "from-black/5 via-transparent to-transparent"
        }`}
      />

      {/* Subtle texture, low opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-soft-light bg-[radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[length:7px_7px]" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white select-none">
        <p
          className="text-[11px] font-semibold tracking-[0.34em] uppercase opacity-85 mb-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.82)]"
          aria-hidden="true"
        >
          {year}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-2 [text-shadow:0_6px_18px_rgba(0,0,0,0.85)]">
          {month}
        </h1>
        <p className="text-sm opacity-90 font-medium [text-shadow:0_2px_10px_rgba(0,0,0,0.82)]">
          {weekdayLabel}
        </p>
      </div>
    </div>
  );
}
