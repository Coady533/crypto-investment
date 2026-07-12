import { useEffect, useState } from "react";
import axios from "axios";

const COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
};

const FALLBACK_PRICES = {
  BTC: 67420,
  ETH: 3812,
  BNB: 542,
  USDT: 1,
};

export const formatUsdPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(Number(value) || 0);

export const useCryptoMarket = (refreshMs = 60000) => {
  const [market, setMarket] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const loadMarket = async () => {
      try {
        const ids = Object.values(COINGECKO_IDS).join(",");
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        );

        if (cancelled) return;

        setMarket({
          BTC: {
            price: res.data.bitcoin?.usd,
            change: res.data.bitcoin?.usd_24h_change,
          },
          ETH: {
            price: res.data.ethereum?.usd,
            change: res.data.ethereum?.usd_24h_change,
          },
          BNB: {
            price: res.data.binancecoin?.usd,
            change: res.data.binancecoin?.usd_24h_change,
          },
          USDT: {
            price: res.data.tether?.usd,
            change: res.data.tether?.usd_24h_change,
          },
        });
      } catch {
        if (!cancelled) setMarket({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMarket();
    intervalId = setInterval(loadMarket, refreshMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [refreshMs]);

  return { market, loading, fallbackPrices: FALLBACK_PRICES };
};
