import React, { useState, useEffect, useCallback, useRef } from "react";
import { LIVE_ACTIVITY } from "../context/AuthContext";

const FLAG_MAP = {
  "United Kingdom": "🇬🇧",
  Nigeria: "🇳🇬",
  Singapore: "🇸🇬",
  Brazil: "🇧🇷",
  "United States": "🇺🇸",
  Japan: "🇯🇵",
  UAE: "🇦🇪",
  India: "🇮🇳",
  Spain: "🇪🇸",
  "South Africa": "🇿🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
};

const shuffleActivities = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const LiveActivityTicker = () => {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(true);
  const activityIndex = useRef(0);
  const activityOrder = useRef(shuffleActivities(LIVE_ACTIVITY));
  const timeoutId = useRef(null);

  const addItem = useCallback(() => {
    const activity =
      activityOrder.current[
        activityIndex.current % activityOrder.current.length
      ];
    const id = Date.now();
    setItems((prev) => [{ ...activity, id }, ...prev].slice(0, 4));
    activityIndex.current += 1;
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 2500 + Math.floor(Math.random() * 4000);
    timeoutId.current = setTimeout(() => {
      addItem();
      scheduleNext();
    }, delay);
  }, [addItem]);

  // Seed the feed with a few different activities, then update on a varied cadence.
  useEffect(() => {
    activityIndex.current = 0;
    activityOrder.current = shuffleActivities(LIVE_ACTIVITY);
    setItems([]);

    for (let i = 0; i < 4; i += 1) {
      const activity = activityOrder.current[i % activityOrder.current.length];
      setItems((prev) =>
        [{ ...activity, id: `${Date.now()}-${i}` }, ...prev].slice(0, 4),
      );
      activityIndex.current += 1;
    }

    scheduleNext();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [scheduleNext]);

  if (!visible) return null;

  return (
    <div className="ticker-wrap">
      <div className="ticker-header">
        <span className="ticker-dot" />
        <span className="ticker-label">Live Activity</span>
        <button className="ticker-close" onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>

      <div className="ticker-feed">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`ticker-item ${i === 0 ? "ticker-item--new" : ""}`}
          >
            <div className="ticker-flag">{FLAG_MAP[item.country] || "🌍"}</div>
            <div className="ticker-body">
              <span className="ticker-name">{item.name}</span>
              <span className="ticker-action">
                {item.type === "deposit"
                  ? " just deposited "
                  : " just invested "}
              </span>
              <span className="ticker-amount">
                ${item.amount.toLocaleString()}
              </span>
              {item.plan && (
                <span className="ticker-plan"> · {item.plan} Plan</span>
              )}
            </div>
            <div className="ticker-country">{item.country}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveActivityTicker;
