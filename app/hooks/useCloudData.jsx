import { useState, useEffect } from "react";

const CACHE_KEY = "atomity_challenge_data";
const CACHE_TTL = 5 * 60 * 1000;

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function useCloudData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch("/api/data?collection=Chellange")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const record  = Array.isArray(json) ? json[0] : json;
        const payload = record?.cloudMetrics ?? record;

        const safe = {
          zoomData:        payload?.zoomData        ?? [],
          resourceMetrics: payload?.resourceMetrics ?? [],
          wasteDetected:   payload?.wasteDetected   ?? { percentage: 0, trend: "down" },
          providers:       payload?.providers       ?? [],
        };

        setCache(safe);
        setData(safe);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export { CACHE_KEY };