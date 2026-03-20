"use client";

/**
 * VortexOrb
 * Circular orb container with layered glow rings.
 * Wraps provider logos + metric bars.
 *
 * Props:
 *   size        {number}          — diameter in px (default 140)
 *   accentColor {string}          — border / glow color
 *   bgCard      {string}          — fill color
 *   children    {React.ReactNode}
 *   innerRef    {React.Ref}       — optional ref forwarded to the div
 */
export function VortexOrb({ size = 140, accentColor, bgCard, children, innerRef }) {
  return (
    <div
      ref={innerRef}
      style={{
        position:       "relative",
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     bgCard,
        border:         `3px solid ${accentColor}`,
        boxShadow:      `0 0 0 8px ${accentColor}12, 0 0 35px ${accentColor}40, 0 0 65px ${accentColor}22, inset 0 0 25px ${accentColor}18`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexDirection:  "column",
        gap:            8,
        overflow:       "hidden",
        flexShrink:     0,
      }}
    >
      {/* outer ring */}
      <div style={{
        position:     "absolute",
        inset:        "-4px",
        borderRadius: "50%",
        border:       `1.5px solid ${accentColor}`,
        boxShadow:    `0 0 25px ${accentColor}55`,
        pointerEvents: "none",
      }} />
      {/* inner ring */}
      <div style={{
        position:     "absolute",
        inset:        "22px",
        borderRadius: "50%",
        border:       `1px solid ${accentColor}70`,
        pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}