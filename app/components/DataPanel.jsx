"use client";

import { T, resolveColor } from "../styles/theme";

// ── ArcProgress ────────────────────────────────────────────────────

/**
 * ArcProgress
 * SVG circular progress arc.
 *
 * Props:
 *   progress    {number} 0–1
 *   color       {string}
 *   r           {number} radius (default 18)
 *   strokeWidth {number} (default 3)
 *   size        {number} viewBox size (default 44)
 */
export function ArcProgress({ progress, color, r = 18, strokeWidth = 3, size = 44 }) {
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, Math.max(0, progress));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} opacity={0.15} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        opacity={0.9}
      />
    </svg>
  );
}

// ── MiniMetricBars ─────────────────────────────────────────────────

/**
 * MiniMetricBars
 * Animated bar chart that grows in as scroll progresses.
 *
 * Props:
 *   sp       {number} current scroll progress (0–1)
 *   startAt  {number} scroll progress at which bars begin appearing
 *   color    {string}
 *   heights  {number[]} raw height values per bar
 */
export function MiniMetricBars({ sp, startAt, color, heights }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28 }}>
      {heights.map((h, i) => {
        const p = Math.min(1, Math.max(0, (sp - startAt - i * 0.015) / 0.06));
        return (
          <div
            key={i}
            style={{
              width:        5,
              height:       h * 0.28 * p,
              background:   color,
              borderRadius: 2,
              opacity:      0.75,
            }}
          />
        );
      })}
    </div>
  );
}

// ── MicroVortex ────────────────────────────────────────────────────

/**
 * MicroVortex
 * Small circular container used inside the zoomed Azure orb.
 *
 * Props:
 *   size        {number}  (default 44)
 *   accentColor {string}
 *   bgCard      {string}
 *   children    {React.ReactNode}
 *   innerRef    {React.Ref}
 */
export function MicroVortex({ size = 44, accentColor, bgCard, children, innerRef }) {
  return (
    <div
      ref={innerRef}
      style={{
        position:       "relative",
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     bgCard,
        border:         `2px solid ${accentColor}`,
        boxShadow:      `0 0 0 3px ${accentColor}18, 0 0 18px ${accentColor}35, inset 0 0 12px ${accentColor}15`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
      }}
    >
      <div style={{
        position:     "absolute",
        inset:        "10px",
        borderRadius: "50%",
        border:       `1px solid ${accentColor}60`,
        pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}

// ── ResourceMetricsCard ────────────────────────────────────────────

/**
 * ResourceMetricsCard
 * Central card showing arc-progress gauges + waste detection.
 *
 * Props:
 *   T              {object}  theme tokens
 *   resourceMetrics {array}
 *   wasteDetected  {object}  { percentage, trend }
 *   sp             {number}  scroll progress
 *   resolveColor   {function}
 *   cardOp         {number}  opacity 0–1
 *   cardSc         {number}  scale 0–1
 *   fadeOthers     {number}  opacity multiplier
 *   isMobile       {boolean}
 */
export function ResourceMetricsCard({
  resourceMetrics, wasteDetected, sp,
  cardOp, cardSc, fadeOthers, isMobile,
}) {
  return (
    <div style={{
      opacity:         cardOp * fadeOthers,
      transform:       `scale(${cardSc})`,
      transformOrigin: "center center",
      ...(isMobile ? { width: "100%" } : {}),
    }}>
      <div style={{
        background:     `linear-gradient(145deg, ${T.bgCard}, rgba(255,255,255,0.06))`,
        borderRadius:   isMobile ? 18 : 28,
        border:         `2px solid ${T.borderStrong}`,
        boxShadow:      `0 20px 60px ${T.accentGlow}, inset 0 4px 16px rgba(255,255,255,0.14)`,
        padding:        isMobile ? "13px 16px" : "24px 28px",
        backdropFilter: "blur(14px)",
        transition:     "all 0.4s ease",
      }}>
        <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textSoft, letterSpacing: "0.11em", marginBottom: isMobile ? 9 : 16, textTransform: "uppercase" }}>
          Cost Monitor · Live
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 3 : 10, flexWrap: "wrap" }}>
          {resourceMetrics.map((item, i) => {
            const color = resolveColor(item.colorKey);
            const prog  = Math.min(1, Math.max(0, (sp - (0.075 + i * 0.01)) / 0.04));
            const arcSize = isMobile ? 34 : 52;
            const arcR    = isMobile ? 13 : 20;

            return (
              <div key={item.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 3 : 6, flex: "1 1 0" }}>
                <div style={{ position: "relative", width: arcSize, height: arcSize }}>
                  <ArcProgress progress={item.progress * prog} color={color} r={arcR} strokeWidth={isMobile ? 3 : 4} size={arcSize} />
                  <span style={{
                    position:  "absolute",
                    top:       "50%",
                    left:      "50%",
                    transform: "translate(-50%,-50%)",
                    fontSize:  11,
                    fontWeight: 800,
                    color,
                    fontFamily: T.mono,
                  }}>
                    {Math.round(item.progress * prog * 100)}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.textSoft, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: isMobile ? 9 : 18, height: 1, background: T.border }} />
        <div style={{ marginTop: isMobile ? 7 : 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Waste Detected
          </span>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: T.accent, fontWeight: 700 }}>
            {wasteDetected.trend === "up" ? "↑" : "↓"} {wasteDetected.percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── ZoomDataPanel ──────────────────────────────────────────────────

/**
 * ZoomDataPanel
 * Horizontal data strip that slides in on scroll.
 *
 * Props:
 *   T          {object}  theme tokens
 *   zoomData   {array}
 *   dataItems  {number[]} per-item opacity/progress
 *   rectOp     {number}
 *   rectSc     {number}
 *   innerRef   {React.Ref}
 *   isMobile   {boolean}
 */
export function ZoomDataPanel({ zoomData, dataItems, rectOp, rectSc, innerRef, isMobile }) {
  return (
    <div
      ref={innerRef}
      style={{
        opacity:         rectOp,
        transform:       `scale(${rectSc})`,
        transformOrigin: isMobile ? "center bottom" : "left center",
        width:           isMobile ? "100%" : "min(420px, 45vw)",
        zIndex:          5,
      }}
    >
      <div style={{
        background:     T.bgCard,
        borderRadius:   isMobile ? 12 : 18,
        border:         `1.5px solid ${T.borderStrong}`,
        boxShadow:      `0 14px 55px ${T.accentGlow}, inset 0 4px 14px rgba(255,255,255,0.12)`,
        display:        "flex",
        alignItems:     "stretch",
        overflow:       "hidden",
        backdropFilter: "blur(20px)",
        transition:     "all 0.4s ease",
        ...(isMobile ? {} : { clipPath: "polygon(0% 0%, 88% 0%, 100% 22%, 100% 78%, 88% 100%, 0% 100%)" }),
      }}>
        {zoomData.map((item, i) => (
          <div
            key={item.id}
            style={{
              flex:        1,
              display:     "flex",
              flexDirection: "column",
              alignItems:  "center",
              justifyContent: "center",
              gap:         isMobile ? 5 : 10,
              padding:     isMobile ? "11px 2px" : "22px 6px",
              borderRight: i < zoomData.length - 1 ? `1px solid ${T.border}` : "none",
              opacity:     dataItems[i] ?? 1,
              transform:   `translateY(${(isMobile ? 5 : 7) * (1 - (dataItems[i] ?? 1))}px)`,
              background:  item.highlight ? T.accentSoft : "transparent",
            }}
          >
            <span style={{
              fontSize:      isMobile ? 11 : 8,
              fontWeight:    700,
              color:         item.highlight ? T.accent : T.textSoft,
              letterSpacing: isMobile ? "0.05em" : "0.08em",
              textAlign:     "center",
              lineHeight:    1.5,
              textTransform: "uppercase",
              fontFamily:    T.sans,
            }}>
              {item.label}
            </span>
            <span style={{
              fontSize:   item.highlight ? (isMobile ? 14 : 17) : (isMobile ? 12 : 15),
              fontWeight: 800,
              color:      item.highlight ? T.accent : T.text,
              whiteSpace: "nowrap",
              fontFamily: T.mono,
            }}>
              {item.value}
            </span>
            {item.highlight && (
              <div style={{ width: isMobile ? 16 : 28, height: 2, background: T.accent, borderRadius: 1 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}