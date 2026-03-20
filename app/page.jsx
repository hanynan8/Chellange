"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

import { useCloudData, CACHE_KEY } from "./hooks/useCloudData";
import { useBreakpoint }           from "./hooks/useBreakpoint";
import { useDarkMode }             from "./hooks/useDarkMode";
import { VortexOrb }               from "./components/VortexOrb";
import { ProviderLogo }            from "./components/ProviderLogos";
import {
  MiniMetricBars,
  MicroVortex,
  ResourceMetricsCard,
  ZoomDataPanel,
} from "./components/DataPanel";
import { T, resolveColor } from "./styles/theme";
import "./styles/tokens.css";

// ══════════════════════════════════════════════════════════════════
//  Loading Skeleton
// ══════════════════════════════════════════════════════════════════
function LoadingSkeleton() {
  return (
    <div role="status" aria-live="polite" className="loading-skeleton">
      <div aria-hidden="true" className="spinner" />
      <p>Loading cloud data…</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Error State
// ════════════════════════════════════════════════════════════════
function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="error-state">
      <span aria-hidden="true" style={{ fontSize: 32 }}>⚠️</span>
      <p>Failed to load: {message}</p>
      <button onClick={onRetry} type="button" className="retry-btn">
        Retry
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  Dark Mode Toggle
// ══════════════════════════════════════════════════════════════════
function DarkToggle({ dark, onToggle, isMobile }) {
  return (
    <nav aria-label="Display preferences" style={{
      position:   "fixed",
      top:        isMobile ? "max(12px, calc(env(safe-area-inset-top) + 8px))" : "max(20px, calc(env(safe-area-inset-top) + 12px))",
      right:      isMobile ? "max(12px, env(safe-area-inset-right))" : "max(20px, env(safe-area-inset-right))",
      zIndex:     1000,
    }}>
      <button
        onClick={onToggle}
        type="button"
        aria-pressed={dark}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          background:   T.bgCard,
          border:       `1.5px solid ${T.borderStrong}`,
          borderRadius: 50,
          padding:      isMobile ? "6px 10px" : "8px 16px",
          cursor:       "pointer",
          display:      "flex", alignItems: "center", gap: 8,
          boxShadow:    `0 4px 20px ${T.accentGlow}`,
          transition:   "all 0.3s ease",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div aria-hidden="true" style={{ width: isMobile ? 28 : 36, height: isMobile ? 16 : 20, borderRadius: 10, background: dark ? T.accent : "rgba(148,163,184,0.3)", position: "relative", transition: "background 0.3s" }}>
          <div style={{ position: "absolute", top: 2, left: dark ? (isMobile ? 13 : 18) : 2, width: isMobile ? 12 : 16, height: isMobile ? 12 : 16, borderRadius: "50%", background: "#fff", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
        </div>
        {!isMobile && (
          <span aria-hidden="true" style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMid, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {dark ? "Dark" : "Light"}
          </span>
        )}
      </button>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════
//  Pricing Overlay Card
// ══════════════════════════════════════════════════════════════════
function PricingCard({ opacity, providers, isMobile }) {
  if (opacity <= 0 || !providers?.length) return null;
  const shown = providers.filter((p) => ["aws", "azure", "gcp"].includes(p.key));
  return (
    <aside
      aria-label="Cloud provider pricing overview"
      aria-hidden={opacity < 0.1 ? "true" : "false"}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, pointerEvents: "none", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
    >
      <div style={{ opacity, position: "relative", width: "100%", maxWidth: isMobile ? 300 : 580, padding: "0 24px" }}>
        <div style={{ position: "absolute", top: isMobile ? -38 : -52, right: isMobile ? 30 : 36, zIndex: 10 }}>
          <p aria-label="Pricing indicator" style={{ background: `linear-gradient(135deg, ${T.accent}, var(--color-azure))`, color: "#fff", fontWeight: 800, fontFamily: T.mono, fontSize: isMobile ? 14 : 19, padding: isMobile ? "7px 28px 7px 16px" : "10px 44px 10px 22px", borderRadius: 10, clipPath: "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)", boxShadow: `0 4px 22px ${T.accentGlow}`, letterSpacing: "0.04em", margin: 0 }}>
            $$$$
          </p>
          <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 1, height: isMobile ? 18 : 28, background: T.border }} />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.textSoft, marginTop: -3 }} />
          </div>
        </div>
        <ul role="list" style={{ background: T.bgCard, borderRadius: isMobile ? 16 : 22, border: `1.5px solid ${T.borderStrong}`, boxShadow: `0 16px 48px ${T.accentGlow}, 0 2px 0 rgba(255,255,255,0.15) inset`, padding: isMobile ? "18px 16px" : "30px 44px", display: "flex", alignItems: "center", justifyContent: "space-around", gap: isMobile ? 10 : 28, backdropFilter: "blur(12px)", margin: 0, listStyle: "none" }}>
          {shown.map((p, i) => (
            <li key={p.id} style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 28 }}>
              <ProviderLogo providerKey={p.key} size={isMobile ? 32 : 48} color={resolveColor(p.colorKey)} accent={T.accent} />
              {i < shown.length - 1 && <div aria-hidden="true" style={{ width: 1, height: isMobile ? 24 : 36, background: T.border }} />}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════
//  DESKTOP Section
// ══════════════════════════════════════════════════════════════════
function DesktopCombinedSection({ containerRef, externalSp, apiData }) {
  const sp = externalSp;
  const svgRef          = useRef(null);
  const targetCircleRef = useRef(null);
  const dataPanelRef    = useRef(null);
  const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [winW, setWinW] = useState(1280);

  useEffect(() => {
    const u = () => setWinW(window.innerWidth);
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  const sc      = Math.min(1, winW / 1000);
  const ORB     = Math.round(140 * sc);
  const LOGO    = Math.round(50  * sc);
  const LOGO_AZ = Math.round(44  * sc);

  const { zoomData = [], resourceMetrics = [], wasteDetected = {}, providers = [] } = apiData ?? {};

  const nodesOp    = Math.min(1, Math.max(0, (sp - 0.00) / 0.05));
  const nodesYTop  =  38 * (1 - nodesOp);
  const nodesYBot  = -38 * (1 - nodesOp);
  const labelOp    = Math.min(1, Math.max(0, (sp - 0.02) / 0.04));
  const beamP      = Math.min(1, Math.max(0, (sp - 0.04) / 0.06));
  const cardOp     = Math.min(1, Math.max(0, (sp - 0.02) / 0.05));
  const cardSc     = 0.65 + 0.35 * cardOp;
  const fadeOthers = Math.max(0, 1 - Math.max(0, (sp - 0.25) / 0.12));
  const zoomP      = Math.min(1, Math.max(0, (sp - 0.23) / 0.30));
  const azureSc    = 1 + zoomP * 0.9;
  const azureY     = zoomP * 90;
  const ih1 = Math.min(1, Math.max(0, (sp - 0.46) / 0.05));
  const ih2 = Math.min(1, Math.max(0, (sp - 0.51) / 0.05));
  const ih3 = Math.min(1, Math.max(0, (sp - 0.55) / 0.05));
  const ih4 = Math.min(1, Math.max(0, (sp - 0.59) / 0.05));
  const lineP  = Math.min(1, Math.max(0, (sp - 0.67) / 0.08));
  const rectOp = Math.min(1, Math.max(0, (sp - 0.80) / 0.07));
  const rectSc = 0.88 + 0.12 * rectOp;
  const dataItems = zoomData.map((_, i) => Math.min(1, Math.max(0, (sp - 0.80 - i * 0.018) / 0.06)));

  useEffect(() => {
    const update = () => {
      if (!svgRef.current || !targetCircleRef.current || !dataPanelRef.current) return;
      const svgRect    = svgRef.current.getBoundingClientRect();
      const circleRect = targetCircleRef.current.getBoundingClientRect();
      const panelRect  = dataPanelRef.current.getBoundingClientRect();
      const scaleX = 900 / svgRect.width;
      const scaleY = 560 / svgRect.height;
      setLineCoords({
        x1: (circleRect.left + circleRect.width  / 2 - svgRect.left) * scaleX,
        y1: (circleRect.top  + circleRect.height / 2 - svgRect.top)  * scaleY,
        x2: (panelRect.right - svgRect.left) * scaleX,
        y2: (panelRect.top   + panelRect.height / 2 - svgRect.top)   * scaleY,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [sp, azureSc, azureY, rectSc, ih4]);

  const currentX = lineCoords.x1 + (lineCoords.x2 - lineCoords.x1) * lineP;
  const currentY = lineCoords.y1 + (lineCoords.y2 - lineCoords.y1) * lineP;

  const getProvider = (key) =>
    providers.find((p) => p.key === key) ?? { barHeights: [55, 38, 70, 28, 50], colorKey: key, label: key, key };

  const aws    = getProvider("aws");
  const azure  = getProvider("azure");
  const gcp    = getProvider("gcp");
  const onprem = getProvider("onprem");

  return (
    <section
      ref={containerRef}
      aria-label="Cloud provider cost monitor"
      style={{ position: "relative", height: "1300vh", background: T.bg, transition: "background 0.4s" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.bg, transition: "background 0.4s" }}>

        {/* Glow bg */}
        <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* SVG connector lines */}
        <svg aria-hidden="true" ref={svgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={T.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-azure)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {beamP > 0 && fadeOthers > 0 &&
            [[215,175,410,262],[685,175,490,262],[215,390,410,300],[685,390,490,300]].map(([x1,y1,x2,y2], i) => {
              const p = Math.min(1, beamP * fadeOthers);
              return <line key={i} x1={x1} y1={y1} x2={x1+(x2-x1)*p} y2={y1+(y2-y1)*p} stroke={T.accent} strokeWidth="1.5" strokeDasharray="5 4" strokeLinecap="round" opacity={0.6} />;
            })
          }
          {lineP > 0 && lineCoords.x1 !== 0 && (
            <>
              <line x1={lineCoords.x1} y1={lineCoords.y1} x2={currentX} y2={currentY} stroke={T.accent} strokeWidth="2" strokeLinecap="round" opacity={0.9} />
              <circle cx={lineCoords.x1} cy={lineCoords.y1} r="5" fill={T.accent} opacity={lineP * 0.85} />
              {lineP >= 1 && <circle cx={lineCoords.x2} cy={lineCoords.y2} r="3.5" fill={T.accent} opacity={0.7} />}
            </>
          )}
        </svg>

        <div style={{ position: "relative", width: "min(900px, 95vw)", height: "min(560px, 85vh)" }}>

          {/* AWS */}
          <article aria-label="AWS provider metrics" style={{ position: "absolute", top: 20, left: 30, opacity: nodesOp * fadeOthers, transform: `translateY(${nodesYTop}px)` }}>
            <VortexOrb size={ORB} accentColor={resolveColor(aws.colorKey)} bgCard={T.bgCard}>
              <ProviderLogo providerKey="aws" size={LOGO} color={resolveColor(aws.colorKey)} accent={T.accent} />
              <MiniMetricBars sp={sp} startAt={0.0} color={resolveColor(aws.colorKey)} heights={aws.barHeights} />
            </VortexOrb>
            <h3 style={{ textAlign: "center", marginTop: 10, marginBottom: 0, opacity: labelOp * fadeOthers, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(aws.colorKey), letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {aws.label}
            </h3>
          </article>

          {/* AZURE */}
          <article aria-label="Azure provider metrics" style={{ position: "absolute", top: 20, right: 30, opacity: nodesOp, transform: `translateY(${nodesYTop*(1-zoomP)+azureY}px) scale(${azureSc})`, transformOrigin: "center top", zIndex: 10 }}>
            <VortexOrb size={ORB} accentColor={resolveColor(azure.colorKey)} bgCard={T.bgCard}>
              <div aria-hidden="true" style={{ opacity: Math.max(0,1-zoomP*4), position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ProviderLogo providerKey="azure" size={LOGO_AZ} color={resolveColor(azure.colorKey)} accent={T.accent} />
                <MiniMetricBars sp={sp} startAt={0.0} color={resolveColor(azure.colorKey)} heights={azure.barHeights} />
              </div>
              <div aria-hidden="true" style={{ opacity: zoomP > 0.35 ? 1 : 0, position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[ih1, ih2].map((op, i) => (
                    <div key={i} style={{ opacity: op, transform: `scale(${0.4+0.6*op})`, transformOrigin: "center" }}>
                      <MicroVortex size={30} accentColor={i===0 ? T.green : resolveColor(azure.colorKey)} bgCard={T.bgCard}>
                        <div style={{ width: 18 }}>
                          {i === 0
                            ? <div style={{ height: 12, background: T.green, borderRadius: 2, opacity: 0.7 }} />
                            : <div style={{ display: "flex", gap: 2 }}>{[13,7,17,9].map((h,j) => <div key={j} style={{ width: 3, height: h, background: resolveColor(azure.colorKey), borderRadius: 1, opacity: 0.7 }} />)}</div>
                          }
                        </div>
                      </MicroVortex>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {[ih3, ih4].map((op, i) => (
                    <div key={i} style={{ opacity: op, transform: `scale(${0.4+0.6*op})`, transformOrigin: "center" }}>
                      <MicroVortex size={30} accentColor={i===1 ? T.accent : T.onprem} bgCard={T.bgCard} innerRef={i===1 ? targetCircleRef : undefined}>
                        <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {i === 1
                            ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2.5px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent }} /></div>
                            : <div style={{ display: "flex", flexWrap: "wrap", gap: 2, width: 16 }}>{[0,1,2,3].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: 1, background: T.onprem, opacity: 0.45 }} />)}</div>
                          }
                        </div>
                      </MicroVortex>
                    </div>
                  ))}
                </div>
              </div>
            </VortexOrb>
            <h3 style={{ textAlign: "center", marginTop: 10, marginBottom: 0, opacity: labelOp, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(azure.colorKey), letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {azure.label}
            </h3>
          </article>

          {/* GCP */}
          <article aria-label="GCP provider metrics" style={{ position: "absolute", bottom: 20, left: 30, opacity: nodesOp * fadeOthers, transform: `translateY(${nodesYBot}px)` }}>
            <VortexOrb size={ORB} accentColor={resolveColor(gcp.colorKey)} bgCard={T.bgCard}>
              <ProviderLogo providerKey="gcp" size={LOGO} color={resolveColor(gcp.colorKey)} accent={T.accent} />
              <MiniMetricBars sp={sp} startAt={0.0} color={resolveColor(gcp.colorKey)} heights={gcp.barHeights} />
            </VortexOrb>
            <h3 style={{ textAlign: "center", marginTop: 10, marginBottom: 0, opacity: labelOp * fadeOthers, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(gcp.colorKey), letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {gcp.label}
            </h3>
          </article>

          {/* On-Prem */}
          <article aria-label="On-premise provider metrics" style={{ position: "absolute", bottom: 20, right: 30, opacity: nodesOp * fadeOthers, transform: `translateY(${nodesYBot}px)` }}>
            <VortexOrb size={ORB} accentColor={resolveColor(onprem.colorKey)} bgCard={T.bgCard}>
              <ProviderLogo providerKey="onprem" size={LOGO} color={resolveColor(onprem.colorKey)} accent={T.accent} />
              <MiniMetricBars sp={sp} startAt={0.0} color={resolveColor(onprem.colorKey)} heights={onprem.barHeights} />
            </VortexOrb>
            <h3 style={{ textAlign: "center", marginTop: 10, marginBottom: 0, opacity: labelOp * fadeOthers, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(onprem.colorKey), letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {onprem.label}
            </h3>
          </article>

          {/* Central Card */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${cardSc})`, opacity: cardOp * fadeOthers, width: "min(320px, 34vw)" }}>
            <ResourceMetricsCard
              resourceMetrics={resourceMetrics}
              wasteDetected={wasteDetected}
              sp={sp}
              cardOp={1}
              cardSc={1}
              fadeOthers={1}
              isMobile={false}
            />
          </div>

          {/* Data Panel */}
          <div style={{ position: "absolute", left: 28, top: "50%", zIndex: 5, transform: "translateY(-50%)", transformOrigin: "left center" }}>
            <ZoomDataPanel
              zoomData={zoomData}
              dataItems={dataItems}
              rectOp={rectOp}
              rectSc={rectSc}
              innerRef={dataPanelRef}
              isMobile={false}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MOBILE Section
// ══════════════════════════════════════════════════════════════════
function MobileCombinedSection({ containerRef, externalSp, apiData }) {
  const sp = externalSp;
  const { zoomData = [], resourceMetrics = [], wasteDetected = {}, providers = [] } = apiData ?? {};

  const { windowWidth } = useBreakpoint();
  const scaleFactor = Math.min(1, windowWidth / 420);
  const ORB        = Math.round(86  * scaleFactor);
  const LOGO       = Math.round(28  * scaleFactor);
  const MICRO      = Math.round(30  * scaleFactor);
  const BAR_HEIGHT = Math.round(16  * scaleFactor);

  const nodesOp    = Math.min(1, Math.max(0, (sp - 0.01) / 0.03));
  const labelOp    = Math.min(1, Math.max(0, (sp - 0.04) / 0.03));
  const cardOp     = Math.min(1, Math.max(0, (sp - 0.07) / 0.03));
  const cardSc     = 0.7 + 0.3 * cardOp;
  const fadeOthers = Math.max(0, 1 - Math.max(0, (sp - 0.18) / 0.08));
  const zoomP      = Math.min(1, Math.max(0, (sp - 0.18) / 0.08));
  const azureSc    = 1 + zoomP * 0.5;
  const azureShift = zoomP * 28;
  const ih1 = Math.min(1, Math.max(0, (sp - 0.22) / 0.03));
  const ih2 = Math.min(1, Math.max(0, (sp - 0.25) / 0.03));
  const ih3 = Math.min(1, Math.max(0, (sp - 0.28) / 0.03));
  const ih4 = Math.min(1, Math.max(0, (sp - 0.31) / 0.03));
  const rectOp         = Math.min(1, Math.max(0, (sp - 0.38) / 0.03));
  const rectSc         = 0.88 + 0.12 * rectOp;
  const GAP_ZOOM        = -60;
  const dataPanelMargin = zoomP * GAP_ZOOM;
  const dataItems      = zoomData.map((_, i) => Math.min(1, Math.max(0, (sp - 0.43 - i * 0.01) / 0.03)));

  const getProvider = (key) =>
    providers.find((p) => p.key === key) ?? { barHeights: [55,38,70,28,50], colorKey: key, label: key, shortLabel: key, key };

  const aws    = getProvider("aws");
  const azure  = getProvider("azure");
  const gcp    = getProvider("gcp");
  const onprem = getProvider("onprem");

  const MobileBar = ({ provider, heights }) => (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: BAR_HEIGHT }}>
      {heights.map((h, j) => {
        const p2 = Math.min(1, Math.max(0, (sp - j * 0.015) / 0.03));
        return <div key={j} style={{ width: 3, height: h * 0.16 * p2, background: resolveColor(provider.colorKey), borderRadius: 2, opacity: 0.75 }} />;
      })}
    </div>
  );

  return (
    <section
      ref={containerRef}
      aria-label="Cloud provider cost monitor"
      style={{ position: "relative", height: "900vh", background: T.bg, transition: "background 0.4s" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 10, paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: "max(16px, env(safe-area-inset-bottom))", paddingLeft: "max(14px, env(safe-area-inset-left))", paddingRight: "max(14px, env(safe-area-inset-right))", background: T.bg, transition: "background 0.4s", boxSizing: "border-box" }}>

        <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85vw", height: "85vw", maxWidth: 380, maxHeight: 380, borderRadius: "50%", background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Row 1: AWS + Azure */}
        <div role="list" style={{ display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "center", width: "100%", zIndex: 1, transform: `translateY(${18*(1-nodesOp)}px)` }}>

          <article role="listitem" aria-label="AWS metrics" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: nodesOp * fadeOthers, maxHeight: fadeOthers > 0 ? 160 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
            <VortexOrb size={ORB} accentColor={resolveColor(aws.colorKey)} bgCard={T.bgCard}>
              <ProviderLogo providerKey="aws" size={LOGO} color={resolveColor(aws.colorKey)} accent={T.accent} />
              <MobileBar provider={aws} heights={aws.barHeights} />
            </VortexOrb>
            <h3 style={{ margin: 0, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(aws.colorKey), letterSpacing: "0.08em", textTransform: "uppercase" }}>{aws.shortLabel}</h3>
          </article>

          <article role="listitem" aria-label="Azure metrics" style={{ zIndex: 10, flexShrink: 0, opacity: nodesOp, transform: `translateY(${azureShift}px) scale(${azureSc})`, transformOrigin: "center top", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <VortexOrb size={ORB} accentColor={resolveColor(azure.colorKey)} bgCard={T.bgCard}>
              <div aria-hidden="true" style={{ opacity: Math.max(0,1-zoomP*4), position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ProviderLogo providerKey="azure" size={LOGO} color={resolveColor(azure.colorKey)} accent={T.accent} />
                <MobileBar provider={azure} heights={azure.barHeights} />
              </div>
              <div aria-hidden="true" style={{ opacity: zoomP > 0.35 ? 1 : 0, position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[ih1, ih2].map((op, i) => (
                    <div key={i} style={{ opacity: op, transform: `scale(${0.4+0.6*op})`, transformOrigin: "center" }}>
                      <MicroVortex size={MICRO} accentColor={i===0 ? T.green : resolveColor(azure.colorKey)} bgCard={T.bgCard}>
                        <div style={{ width: 11 }}>
                          {i === 0
                            ? <div style={{ height: 8, background: T.green, borderRadius: 2, opacity: 0.7 }} />
                            : <div style={{ display: "flex", gap: 1 }}>{[7,5,10,6].map((h,j) => <div key={j} style={{ width: 2, height: h, background: resolveColor(azure.colorKey), borderRadius: 1, opacity: 0.7 }} />)}</div>
                          }
                        </div>
                      </MicroVortex>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[ih3, ih4].map((op, i) => (
                    <div key={i} style={{ opacity: op, transform: `scale(${0.4+0.6*op})`, transformOrigin: "center" }}>
                      <MicroVortex size={MICRO} accentColor={i===1 ? T.accent : T.onprem} bgCard={T.bgCard}>
                        <div style={{ width: 11, height: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {i === 1
                            ? <div style={{ width: 9, height: 9, borderRadius: "50%", border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 3, height: 3, borderRadius: "50%", background: T.accent }} /></div>
                            : <div style={{ display: "flex", flexWrap: "wrap", gap: 1, width: 9 }}>{[0,1,2,3].map(j => <div key={j} style={{ width: 3, height: 3, borderRadius: 1, background: T.onprem, opacity: 0.45 }} />)}</div>
                          }
                        </div>
                      </MicroVortex>
                    </div>
                  ))}
                </div>
              </div>
            </VortexOrb>
            <h3 style={{ margin: 0, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(azure.colorKey), letterSpacing: "0.08em", textTransform: "uppercase", opacity: labelOp }}>{azure.shortLabel}</h3>
          </article>

        </div>

        {/* Row 2: Cost Monitor */}
        <ResourceMetricsCard
          resourceMetrics={resourceMetrics}
          wasteDetected={wasteDetected}
          sp={sp}
          cardOp={cardOp}
          cardSc={cardSc}
          fadeOthers={fadeOthers}
          isMobile={true}
        />

        {/* Row 3: GCP + On-Prem */}
        <div role="list" style={{ display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "center", width: "100%", zIndex: 1, opacity: nodesOp * fadeOthers, transform: `translateY(${-18*(1-nodesOp)}px)`, maxHeight: fadeOthers > 0 ? 160 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
          {[gcp, onprem].map((n) => (
            <article role="listitem" key={n.key} aria-label={`${n.shortLabel} metrics`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <VortexOrb size={ORB} accentColor={resolveColor(n.colorKey)} bgCard={T.bgCard}>
                <ProviderLogo providerKey={n.key} size={LOGO} color={resolveColor(n.colorKey)} accent={T.accent} />
                <MobileBar provider={n} heights={n.barHeights} />
              </VortexOrb>
              <h3 style={{ margin: 0, fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: resolveColor(n.colorKey), letterSpacing: "0.08em", textTransform: "uppercase" }}>{n.shortLabel}</h3>
            </article>
          ))}
        </div>

        {/* Data Panel */}
        <div style={{ marginTop: dataPanelMargin }}>
          <ZoomDataPanel
            zoomData={zoomData}
            dataItems={dataItems}
            rectOp={rectOp}
            rectSc={rectSc}
            isMobile={true}
          />
        </div>

      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE
// ══════════════════════════════════════════════════════════════════
export default function Page() {
  const { dark, setDark, reducedMotion } = useDarkMode();
  const { isMobile } = useBreakpoint();

  const { data: apiData, loading, error } = useCloudData();

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const [cardOpacity,  setCardOpacity]  = useState(1);
  const [sec2Progress, setSec2Progress] = useState(0);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    if (isMobile) return;
    if (section1Ref.current) {
      const top = section1Ref.current.offsetTop;
      const h   = section1Ref.current.offsetHeight;
      const p   = (y - top) / h;
      setCardOpacity(p <= 0.70 ? 1 : p >= 0.95 ? 0 : 1 - (p - 0.70) / 0.25);
    }
    if (section2Ref.current) {
      const top = section2Ref.current.offsetTop;
      const h   = section2Ref.current.offsetHeight;
      setSec2Progress(Math.min(1, Math.max(0, (y - top) / h)));
    }
  });

  const rafRef = useRef(null);
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const y = window.scrollY;
        if (section1Ref.current) {
          const top = section1Ref.current.offsetTop;
          const h   = section1Ref.current.offsetHeight;
          const p   = (y - top) / h;
          setCardOpacity(p <= 0.70 ? 1 : p >= 0.95 ? 0 : 1 - (p - 0.70) / 0.25);
        }
        if (section2Ref.current) {
          const top = section2Ref.current.offsetTop;
          const h   = section2Ref.current.offsetHeight;
          setSec2Progress(Math.min(1, Math.max(0, (y - top) / h)));
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  const handleRetry = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    window.location.reload();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error)   return <ErrorState message={error} onRetry={handleRetry} />;

  return (
    <main style={{ background: T.bg, transition: "background 0.4s" }}>
      {reducedMotion && (
        <style>{`* { animation: none !important; transition: none !important; }`}</style>
      )}

      <DarkToggle dark={dark} onToggle={() => setDark(!dark)} isMobile={isMobile} />
      <PricingCard opacity={cardOpacity} providers={apiData?.providers ?? []} isMobile={isMobile} />

      {/* Spacer section */}
      <section
        ref={section1Ref}
        aria-hidden="true"
        style={{ height: "150vh", background: T.bg, transition: "background 0.4s" }}
      />

      {isMobile
        ? <MobileCombinedSection containerRef={section2Ref} externalSp={sec2Progress} apiData={apiData} />
        : <DesktopCombinedSection containerRef={section2Ref} externalSp={sec2Progress} apiData={apiData} />
      }
    </main>
  );
}