# Dynamic payout engine

Code: `src/payout-engine/`. Tests: `test/payout-engine*.spec.ts`, `test/payout-lock.spec.ts`.

## Flow

```
OTC price engine ─► candle aggregator ─► MarketConditionService (every 60 s)
   ─► risk model (target) ─► EMA + review slot + hold + hysteresis + rate limits
   ─► published payout (versioned, stored, audited) ─► asset:payout-updated ─► clients
```

## Inputs (per asset, measured, never invented)

| Metric | Source |
| --- | --- |
| Short vs hourly volatility | stdev of 5 s log returns, last 10 min vs last 60 min |
| Movement intensity | mean absolute 5 s return, same windows |
| Candle range | mean M1 high-low range, last 10 vs last 60 candles |
| Trend strength | efficiency ratio of the last 10 min (net move / total path) |
| Fluctuation frequency | share of 5 s moves that reverse direction |
| Generation regime | share of 100 ms generator decisions in HIGH_VOLATILITY/BREAKOUT |
| Data quality | ≥120 closed 5 s candles and a tick within 15 s, else no target |
| Liquidity | `null`: synthetic OTC markets have no order book |

All current assets are synthetic OTC (`source: OTC_SYNTHETIC_ENGINE`). A
real-market asset would feed the same model from its provider's candles with
`source: REAL_MARKET_FEED`; none is configured today.

## Model

Baseline = the asset's previous fixed 60-second payout (`83 + payoutBoost`).
Target = baseline − (4·vol + 2·range + 3·trend + 3·regime) with each factor
clipped, the total adjustment limited to −6/+3 pp and the result to 20–92 %.
See the header of `payout-model.ts`.

## Smoothing and limits (configurable, `.env.example`)

EMA (α 0.2 per minute) · one review per asset per 10 min at the asset's own
phase · 10 min minimum hold · 0.75 pp hysteresis · ≤2 pp per change ·
≤6 pp per rolling hour · 20–92 % bounds.

## Trades

`quote(asset, expiry)` = published payout + expiry adjustment (≤15 s −3,
≤30 s −2, ≥300 s +1), clamped. The trade stores that percent and its
version; settlement uses the stored values only. A client may send
`quotedPayoutPercent`; if it differs from the current quote the order is
refused with HTTP 409 `PAYOUT_CHANGED` and the new quote.

The engine has no access to users, balances or trade outcomes.

## Several instances

Each evaluation, the instance that wins `pg_try_advisory_xact_lock` writes;
each change is a version compare-and-set and history is unique on
(asset, version). The other instances adopt the stored state and broadcast it
to their own clients. State and the rolling-hour budget survive restarts.

## Endpoints

- `GET /market-data/payouts` — all payouts, expiry rules, bounds
- `GET /market-data/payouts/quote?asset=&expirySeconds=`
- `GET /market-data/payouts/diagnostics?asset=` — metrics, target, smoothing
- `GET /market-data/payouts/history?asset=&limit=` — audit trail
- Socket `/market`: `asset:payout-snapshot` on connect, `asset:payout-updated`
