// GENERATED FILE - do not edit by hand.
// Regenerate with: npm run build:catalog  (see server/tools/)
// Source: https://open.moomoo.com/api (mirrored docs)

import type { Endpoint } from "./types";

export const ENDPOINTS: Endpoint[] = [
  {
    tool: "quote_analyst_consensus",
    title: "Analyst Consensus",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/research/analyst-consensus",
    risk: "read",
    doc: "api/quote/research/analyst-consensus",
    description: "Get the analyst consensus rating and target price for a stock (composite rating, number of covering analysts, rating tier proportions, target price range).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_buybacks",
    title: "Buybacks",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/corporate-actions/buybacks",
    risk: "read",
    doc: "api/quote/corporate-actions/buybacks",
    description: "Get the share buyback history for a company. Returns HK or A-share data depending on the market of the symbol.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." }
    ],
  },
  {
    tool: "quote_capital_distribution",
    title: "Capital Distribution",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/capital-distribution",
    risk: "read",
    doc: "api/quote/capital-flow/capital-distribution",
    description: "Get the current day's capital flow distribution by order size (super-large, large, medium, small) for an individual stock.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. SZ.000001." }
    ],
  },
  {
    tool: "quote_capital_flow",
    title: "Capital Flow (Intraday)",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/capital-flow",
    risk: "read",
    doc: "api/quote/capital-flow/capital-flow",
    description: "Get intraday (minute-level) capital flow in/out data for an individual stock.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, MARKET.CODE format, e.g. HK.00700 / US.AAPL / SZ.000001." },
      { name: "section", in: "query", type: "string", required: false, description: "Trading session, default NORMAL. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_capital_flow_history",
    title: "Capital Flow (History)",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/capital-flow/history",
    risk: "read",
    doc: "api/quote/capital-flow/capital-flow-history",
    description: "Get historical capital flow in/out data at day/week/month level for an individual stock.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, MARKET.CODE format, e.g. HK.00700 / US.AAPL / SZ.000001." },
      { name: "period_type", in: "query", type: "string", required: false, description: "Aggregation period, default DAY. See Naming Dictionary." },
      { name: "start", in: "query", type: "string", required: false, description: "Start date yyyy-MM-dd (inclusive), omit for no lower bound." },
      { name: "end", in: "query", type: "string", required: false, description: "End date yyyy-MM-dd (inclusive), omit to use current date." },
      { name: "count", in: "query", type: "integer", required: false, description: "Maximum number of data points to return, range 1~1000, default 365." }
    ],
  },
  {
    tool: "quote_combo_option_quote",
    title: "Combo Option Quote",
    method: "POST",
    path: "/api/v1.0/quote/combo-option-quote",
    risk: "read",
    doc: "api/quote/derivatives/combo-option-quote",
    description: "Quote combo option packages using caller-supplied legs (contract + BUY/SELL + quantity).",
    params: [
      { name: "combo_list", in: "body", type: "array", items: "string", required: true, description: "Combo list, 1~20 items. Each element is described below." },
      { name: "legs", in: "body", type: "array", items: "string", required: true, description: "Legs of this combo, at least 1." },
      { name: "code", in: "body", type: "string", required: true, description: "US or HK option contract, or the underlying stock for Covered. Option e.g. US.AAPL260821C110000; Covered adds US.AAPL BUY 100. At most one stock leg per combo." },
      { name: "side", in: "body", type: "string", required: true, description: "Trade side. See Naming Dictionary." },
      { name: "quantity", in: "body", type: "integer", required: true, description: "Quantity, a positive integer." }
    ],
  },
  {
    tool: "quote_company_executives",
    title: "Company Executives",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/company/executives",
    risk: "read",
    doc: "api/quote/company/executives",
    description: "Get the list of company executives (directors / management) and their basic appointment information: name, position, gender, age, appointment start date, highest education, shares held, annual salary.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_company_profile",
    title: "Company Profile",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/company/profile",
    risk: "read",
    doc: "api/quote/company/profile",
    description: "Get company detail labels (company overview, listing info, key metrics, etc.) displayed in a \"label name / label value\" format. ETF / REIT automatically routes to fund data source.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_cur_kline",
    title: "Current K-Line",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/cur-kline",
    risk: "read",
    doc: "api/quote/realtime/cur-kline",
    description: "Get real-time K-line (candlestick) data for a symbol, returning the latest num bars. Supports minute/day/week/month/year/quarter periods and adjustment types. Only returns the latest N bars.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "num", in: "query", type: "integer", required: true, description: "Number of K-line bars, 1~370." },
      { name: "ktype", in: "query", type: "integer", required: false, description: "K-line type, default 2. See ktype enum table below." },
      { name: "autype", in: "query", type: "integer", required: false, description: "Adjustment type, default 1. See autype enum table below." },
      { name: "extended_time", in: "query", type: "integer", required: false, description: "Pre/post market / night session toggle, default 0 (only effective for US 1-min K-line). See extended_time enum table below." }
    ],
  },
  {
    tool: "quote_dividends",
    title: "Dividends",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/corporate-actions/dividends",
    risk: "read",
    doc: "api/quote/corporate-actions/dividends",
    description: "Get the dividend payment history for a stock (sorted by time descending, max 100 records). Each record returns fiscal year, plan description, cash dividend per share with currency, payout ratio, dividend type, plan progress, and key dates.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_earnings_price_history",
    title: "Earnings Price History",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/financials/earnings-price-history",
    risk: "read",
    doc: "api/quote/financials/earnings-price-history",
    description: "Get the stock price performance on historical earnings release dates and surrounding offset days. Each earnings period returns: option predicted volatility, post-earnings IV crush, OHLC for the earnings trading day, and a daily close price series from -15 to +14 days centered on the disclosure date.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_earnings_price_move",
    title: "Earnings Price Move",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/financials/earnings-price-move",
    risk: "read",
    doc: "api/quote/financials/earnings-price-move",
    description: "Get the stock price movement around earnings disclosure dates. Returns daily quote sequences centered on the disclosure date across multiple reporting periods (open/close/high/low/previous close/volume, option IV/HV), along with an overview summary for the entire request (average earnings-day price change over recent N periods).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "count", in: "query", type: "integer", required: false, description: "Number of recent earnings periods to return. Default 10, max 50." },
      { name: "overview_count", in: "query", type: "integer", required: false, description: "Number of earnings periods for overview statistics. Default 8, max 50. Effective value = min(overview_count, count)." }
    ],
  },
  {
    tool: "quote_economic_calendar_hot",
    title: "Economic Calendar Hot",
    method: "GET",
    path: "/api/v1.0/quote/economic-calendar/hot",
    risk: "read",
    doc: "api/quote/basic-data/economic-calendar-hot",
    description: "Get a list of hot/recommended economic data for a specific date (sorted by importance). Returns major economic indicators scheduled for that day (e.g. CPI, GDP, non-farm payrolls, central bank rate decisions), including previous value, forecast, actual value, and importance star rating.",
    params: [
      { name: "limit", in: "query", type: "integer", required: false, description: "Items per page, range 1~20" },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for first page, pass previous pagination.next_key to continue" },
      { name: "date", in: "query", type: "string", required: false, description: "Query date, format yyyyMMdd, e.g. 20260618" },
      { name: "timezone", in: "query", type: "string", required: false, description: "Timezone for the date, e.g. America/New_York" }
    ],
  },
  {
    tool: "quote_economic_calendar_search",
    title: "Economic Calendar Search",
    method: "GET",
    path: "/api/v1.0/quote/economic-calendar/search",
    risk: "read",
    doc: "api/quote/basic-data/economic-calendar-search",
    description: "Search the economic calendar by keyword, supporting four types: economic data (CPI/GDP/non-farm payrolls and other macro indicators), market closures, economic events (central bank speeches/meetings), and corporate actions (dividends/splits). Returns matching event list with pagination and time sorting.",
    params: [
      { name: "keyword", in: "query", type: "string", required: true, description: "Search keyword, e.g. CPI, Fed, GDP" },
      { name: "search_type", in: "query", type: "integer", required: true, description: "Search type, see enum table below" },
      { name: "limit", in: "query", type: "integer", required: false, description: "Items per page, range 1~30" },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for first page, pass previous pagination.next_key to continue" },
      { name: "time_order_type", in: "query", type: "integer", required: false, description: "Sort order: 0=ascending (ASC), 1=descending (DESC); only applies when search_type=2/3" }
    ],
  },
  {
    tool: "quote_executive_background",
    title: "Executive Background",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/company/executive-background",
    risk: "read",
    doc: "api/quote/company/executive-background",
    description: "Get detailed background information for a specific executive. You must first obtain the leader_name from the Company Executives API, then pass it to this API to query a single executive's long-text background profile.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "leader_name", in: "query", type: "string", required: true, description: "Executive name, must exactly match the leader_name field returned by the Company Executives API." }
    ],
  },
  {
    tool: "quote_find_community",
    title: "find-community",
    method: "GET",
    path: "/api/v1.0/quote/find-community",
    risk: "read",
    doc: "api/quote/basic-data/search",
    description: "Search community discussions, topics, and live streams by keyword.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Search keyword" },
      { name: "size", in: "query", type: "integer", required: false, description: "Number of results, default 10, range 1~50" },
      { name: "community_type", in: "query", type: "integer", required: false, description: "Community type: 1=Discussion(FEED), 2=Topic(TOPIC), 3=Live(LIVE); omit for all" },
      { name: "sort_type", in: "query", type: "integer", required: false, description: "Sort: 1=by popularity, 2=by time (latest); omit for backend default" },
      { name: "lang", in: "query", type: "string", required: false, description: "Language filter: zh-CN / zh-HK / en / ja" }
    ],
  },
  {
    tool: "quote_find_news",
    title: "find-news",
    method: "GET",
    path: "/api/v1.0/quote/find-news",
    risk: "read",
    doc: "api/quote/basic-data/search",
    description: "Search news articles, announcements, and research reports by keyword.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Search keyword, e.g. Tencent, AAPL, new energy" },
      { name: "size", in: "query", type: "integer", required: false, description: "Number of results, default 10, range 1~50" },
      { name: "news_type", in: "query", type: "integer", required: false, description: "News type filter: 1=News(POST), 2=Announcement(NOTICE), 3=Report(REPORT); omit to return all" },
      { name: "sort_type", in: "query", type: "integer", required: false, description: "Sort: 1=by reads, 2=by time (latest); omit for backend default" },
      { name: "lang", in: "query", type: "string", required: false, description: "Language filter: zh-CN / zh-HK / en / ja" }
    ],
  },
  {
    tool: "quote_future_info",
    title: "Future Info",
    method: "POST",
    path: "/api/v1.0/quote/future-info",
    risk: "read",
    doc: "api/quote/derivatives/future-info",
    description: "Get basic information for futures contracts (exchange, trade time, contract size, price unit, min change, etc.).",
    params: [
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "Futures contract code list, max 400 per request; e.g. [\"HK.HSImain\", \"US.CLmain\"]." }
    ],
  },
  {
    tool: "quote_history_kline",
    title: "History K-Line",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/history-kline",
    risk: "read",
    doc: "api/quote/basic-data/history-kline",
    description: "Get historical K-line (candlestick) data with pagination support.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. US.FUTU." },
      { name: "start", in: "query", type: "string", required: false, description: "Start date (yyyy-MM-dd)." },
      { name: "end", in: "query", type: "string", required: true, description: "End date (yyyy-MM-dd)." },
      { name: "ktype", in: "query", type: "integer", required: false, description: "K-line type. Default 2. 1=1min, 2=Day, 3=Week, 4=Month, 5=Year, 6=5min, 7=15min, 8=30min, 9=60min. See Naming Dictionary." },
      { name: "autype", in: "query", type: "integer", required: false, description: "Adjustment type. Default 1. 0=None, 1=Forward, 2=Backward. See Naming Dictionary." },
      { name: "num", in: "query", type: "integer", required: false, description: "Number of bars. Default 370, max 370." },
      { name: "extended_time", in: "query", type: "integer", required: false, description: "Extended hours. Default 0. 0=Default, 1=Include pre/after market (US minute K), 2=Include overnight (US). See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_holder_detail",
    title: "Holder Detail",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/holder-detail",
    risk: "read",
    doc: "api/quote/shareholders/holder-detail",
    description: "Get the shareholder holding detail list for a stock, with filtering by holder type / reporting period / holder ID, and sorting by shares held or change amount.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "request_type", in: "query", type: "integer", required: false, description: "Holder type filter. Default 1000 (all). See Naming Dictionary." },
      { name: "period_id", in: "query", type: "integer", required: false, description: "Reporting period ID filter. Default 0 (latest)." },
      { name: "holder_id", in: "query", type: "integer", required: false, description: "Filter by holder ID. Default 0 (no filter)." },
      { name: "sort_column", in: "query", type: "integer", required: false, description: "Sort column. Default 61. 61=shares held, 62=shares change." },
      { name: "sort_type", in: "query", type: "integer", required: false, description: "Sort direction. 0=descending (default), 1=ascending." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." }
    ],
  },
  {
    tool: "quote_holding_changes",
    title: "Holding Changes",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/holding-changes",
    risk: "read",
    doc: "api/quote/shareholders/holding-changes",
    description: "Get the shareholder holding change records for a security, with filtering by increase/decrease direction, multi-dimensional sorting, and pagination.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 30, max 50." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." },
      { name: "sort_column", in: "query", type: "integer", required: false, description: "Sort column. Default 1. 1=change amount, 2=holding date, 3=change ratio, 4=change value, 5=holding ratio." },
      { name: "sort_type", in: "query", type: "integer", required: false, description: "Sort direction. Default 0. 0=descending, 1=ascending." },
      { name: "filter_type", in: "query", type: "integer", required: false, description: "Increase/decrease filter. Default 0. 0=no filter, 1=increase, 2=decrease, 3=new position, 4=full exit." },
      { name: "holder_category", in: "query", type: "string", required: false, description: "Holder scope. Default INSTITUTIONS. Options: INSTITUTIONS / INDIVIDUALS / CORPORATIONS / ALL." }
    ],
  },
  {
    tool: "quote_insider_holders",
    title: "Insider Holders",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/insider-holders",
    risk: "read",
    doc: "api/quote/shareholders/insider-holders",
    description: "Get the insider (directors / executives) holding list and summary statistics for a company.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. US.AAPL." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 30." }
    ],
  },
  {
    tool: "quote_insider_trades",
    title: "Insider Trades",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/insider-trades",
    risk: "read",
    doc: "api/quote/shareholders/insider-trades",
    description: "Get insider (directors, executives, 5%+ shareholders) trading records. Data is based on US SEC insider filings (Form 3/4/144).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. US.AAPL." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." },
      { name: "holder_id", in: "query", type: "integer", required: false, description: "Filter by insider ID. 0=no filter (default)." }
    ],
  },
  {
    tool: "quote_institutional_holders",
    title: "Institutional Shareholders",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/institutional",
    risk: "read",
    doc: "api/quote/shareholders/institutional",
    description: "Get the institutional holding summary (aggregated by reporting period) for a stock, returning institution count, total holdings and ratio with period-over-period changes, along with reporting period close/open/previous close prices.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Number of reporting periods per page. Default 10, max 50." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." }
    ],
  },
  {
    tool: "quote_ipo_list",
    title: "IPO List",
    method: "GET",
    path: "/api/v1.0/quote/ipo-list/{market}",
    risk: "read",
    doc: "api/quote/ipo/ipo-list",
    description: "Get the new stock IPO list. Supports Hong Kong / US / A-shares / Singapore / Malaysia \u2014 five markets, each with a separate endpoint. Returns recent subscribable and upcoming IPOs, excluding historical IPOs.",
    params: [
      { name: "market", in: "path", type: "string", required: true, description: "Path parameter market." }
    ],
  },
  {
    tool: "quote_market_snapshot",
    title: "Market Snapshot",
    method: "POST",
    path: "/api/v1.0/quote/snapshot",
    risk: "read",
    doc: "api/quote/realtime/market-snapshot",
    description: "Batch get real-time market snapshot for up to 400 symbols. Returns common fields (last/open/high/low/prev close, volume, turnover, turnover rate, etc.), financial fields (market cap, PE, PB, EPS, dividend yield, etc.) and category-specific fields (index component counts, futures settlement, options greeks, etc.).",
    params: [
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "List of symbol codes (min 1, max 400). Format: <MARKET>.<CODE>, e.g. HK.09988, US.AAPL, BMD.FCPOmain." }
    ],
  },
  {
    tool: "quote_market_state",
    title: "Market State",
    method: "POST",
    path: "/api/v1.0/quote/market-state",
    risk: "read",
    doc: "api/quote/basic-data/market-state",
    description: "Get the current market state (open / closed / pre-market / after-hours / overnight / closing auction, etc.) for a batch of symbols. Useful for determining quote availability and freshness.",
    params: [
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "List of symbol codes in {market}.{code} format, e.g. [\"HK.00700\",\"US.AAPL\",\"SH.600519\"]. Market prefix is required. Max 400 per batch." },
      { name: "is_contain_ba", in: "body", type: "boolean", required: false, description: "Whether to include US pre-market/after-hours sessions; true switches trade_section to the next trading day's schedule once pre/after-hours begins. Default false. Only affects US-related entries." },
      { name: "is_contain_overnight", in: "body", type: "boolean", required: false, description: "Whether to include US overnight session; true switches trade_section to the next trading day's schedule once overnight begins. Default false. Only affects US-related entries." },
      { name: "is_need_crypto_multi_broker", in: "body", type: "boolean", required: false, description: "Whether to return multi-broker data for crypto market; true expands multiple records per market_id by broker. Default false. Only affects CC. prefix entries." }
    ],
  },
  {
    tool: "quote_modify_user_security",
    title: "Modify User Security",
    method: "POST",
    path: "/api/v1.0/quote/modify-user-security",
    risk: "write",
    doc: "api/quote/watchlist/modify-user-security",
    description: "Modify user watchlist: add symbols to a group, remove from a specific group only, or delete from all groups entirely. Use user-security-group to query watchlist groups; use user-security to query symbols in a group.",
    params: [
      { name: "group_name", in: "body", type: "string", required: false, description: "Watchlist group name (first match if duplicate names), max 100 characters; only custom groups supported. Required for op=ADD/MOVE_OUT; optional for op=DEL." },
      { name: "op", in: "body", type: "string", required: true, description: "Operation type: ADD=add to specified group / DEL=delete from all groups entirely / MOVE_OUT=remove from specified group only." },
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "List of symbol codes, must not be empty, 1-200 per call. e.g. [\"HK.00700\",\"US.AAPL\"]." }
    ],
  },
  {
    tool: "quote_morningstar",
    title: "Morningstar Report",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/research/morningstar",
    risk: "read",
    doc: "api/quote/research/morningstar",
    description: "Get the Morningstar comprehensive rating report for a stock, including star rating, fair value, economic moat, uncertainty, capital allocation, financial health and other core ratings, as well as analyst text commentary for each dimension.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_operational_efficiency",
    title: "Operational Efficiency",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/company/operational-efficiency",
    risk: "read",
    doc: "api/quote/company/operational-efficiency",
    description: "Get historical operational efficiency metrics for a company (employee count, revenue per capita / operating profit per capita / net profit per capita and their respective YoY), returned by financial reporting period.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Number of records. Default 10, max 100." },
      { name: "financial_type", in: "query", type: "integer", required: false, description: "Default 7. Options: 7 (annual report) / 102 (all cumulative quarterly reports). See Naming Dictionary." },
      { name: "currency_code", in: "query", type: "string", required: false, description: "Currency code (ISO 4217), e.g. CNY. Defaults to the currency of the latest report." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." }
    ],
  },
  {
    tool: "quote_option_chain",
    title: "Option Chain",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-chain",
    risk: "read",
    doc: "api/quote/derivatives/option-chain",
    description: "Get the option chain for a given underlying symbol within a specified expiration date range. For US combo lists / spreads / quotes use Combo Option Strategy, Combo Option Spread, and Combo Option Quote.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option underlying code, e.g. HK.00700, US.AAPL, HK.800000 (HSI)." },
      { name: "start", in: "query", type: "string", required: false, description: "Start expiration date yyyy-MM-dd (inclusive), omit for no lower bound." },
      { name: "end", in: "query", type: "string", required: false, description: "End expiration date yyyy-MM-dd (inclusive), omit for no upper bound." },
      { name: "index_option_type", in: "query", type: "integer", required: false, description: "Index option type, required only for index underlyings, omit for regular stocks. See Naming Dictionary." },
      { name: "filter_standard", in: "query", type: "string", required: false, description: "Filter by standard/non-standard options, default ALL. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_option_exercise_probability",
    title: "Option Exercise Probability",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-exercise-probability",
    risk: "read",
    doc: "api/quote/derivatives/option-exercise-probability",
    description: "Get the exercise probability analysis for an option contract.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option contract code (must be an option contract, not an underlying stock code), e.g. HK.TCH260528C230000." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Maximum number of records to return, range 1~1000; omit to return full history for the contract." }
    ],
  },
  {
    tool: "quote_option_expiration",
    title: "Option Expiration Date",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-expiration",
    risk: "read",
    doc: "api/quote/derivatives/option-expiration",
    description: "Get the list of option expiration dates for a given underlying symbol. For US combo options, take strike_time from this API as expire_time / far_expire_time, then call Combo Option Strategy.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option underlying code, e.g. HK.00700, US.AAPL, HK.800000 (HSI)." },
      { name: "index_option_type", in: "query", type: "integer", required: false, description: "Index option type, required only for index underlyings, omit for regular stocks. See Naming Dictionary." },
      { name: "filter_standard", in: "query", type: "string", required: false, description: "Filter by standard/non-standard, default ALL. See Naming Dictionary." },
      { name: "filter_expiration_cycles", in: "query", type: "string", required: false, description: "Filter by expiration cycle, comma-separated (e.g. MONTH,QUARTERLY), omit or empty string = no filter. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_option_screen",
    title: "Option Screen",
    method: "POST",
    path: "/api/v1.0/quote/option-screen",
    risk: "read",
    doc: "api/quote/screening/option-screen",
    description: "Option screener: within a specified market category (US/HK/JP stocks x stocks/indices/futures), filter option contracts from the entire market using multi-group conditions expressed by strategy (underlying, strike price, expiration date, option direction, Greeks, implied volatility, chain statistics, etc.). Supports sorting and pagination.",
    params: [
      { name: "strategy", in: "body", type: "object", required: true, description: "Screening strategy. Structure: {market_category_list, filter_group_list}. market_category_list values: 0=US_STOCK / 1=US_INDEX / 2=US_FUTURE / 3=HK_STOCK / 4=HK_INDEX / 5=JP_STOCK / 6=JP_INDEX (multiple elements form a union). filter_group_list multiple groups intersect; within a single group, same-field indicator arrays form a union; each group must have exactly one non-empty list among underlying_list / option_list / chain_list / combo_list." },
      { name: "strategy_param", in: "body", type: "object", required: false, description: "Strategy additional parameters. Required only when the strategy uses watchlist or stock screener results as underlying source: watch_stock_id_list:[uint64] / stock_screener_stock_id_list:[uint64]." },
      { name: "field_filter", in: "body", type: "object", required: false, description: "Declare which indicator fields to return. When not provided, only the default 4 fields (volume / price / chg_ratio / implied_volatility) + option_id are returned. Use 1 as placeholder for int fields, string placeholder (e.g. \"x\") for string fields. Nested fields use proto field names, e.g. underlying_info:{iv:1, hv:1}." },
      { name: "sort_obj", in: "body", type: "object", required: false, description: "Sort method: {sort_field: OptionItem, is_asc}. sort_field sets only 1 field (e.g. {\"volume\":1}). is_asc non-zero for ascending, 0/omit for descending. Default: by volume descending." },
      { name: "next_key", in: "body", type: "string", required: false, description: "Pagination cursor. Leave empty for first page; pass back previous page's pagination.next_key." },
      { name: "limit", in: "body", type: "integer", required: false, description: "Page size. Default 100, max 1000; can pass 0 (query total count only, used with request_exact_data=0)." },
      { name: "request_exact_data", in: "body", type: "integer", required: false, description: "Whether to return exact detail: 0=return total count only (option_list is empty), 1=return detail list (default)." }
    ],
  },
  {
    tool: "quote_option_strategy",
    title: "Combo Option Strategy",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-strategy",
    risk: "read",
    doc: "api/quote/derivatives/option-strategy",
    description: "Query combo option lists by underlying, strategy type and expiry date. Returns combo_list[]: each item is one combo, with all legs in legs[] (instrument=OPTION for option contracts; Covered/Collar also include the path underlying as instrument=STOCK).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option underlying code, US or HK equity/ETF. e.g. US.AAPL / HK.00700." },
      { name: "strategy", in: "query", type: "integer", required: true, description: "Combo strategy type. See Naming Dictionary. HK does not support Covered(2) / Collar(8)." },
      { name: "expire_time", in: "query", type: "string", required: true, description: "Near expiry date yyyy-MM-dd, e.g. 2026-08-21." },
      { name: "far_expire_time", in: "query", type: "string", required: false, description: "Far expiry date yyyy-MM-dd. Required for CalendarSpread(15) / DiagonalSpread(16), and must be later than expire_time." },
      { name: "spread", in: "query", type: "number", required: false, description: "Spread in real price (0~9223372036). Required for 4/7/8/9/11/13/14/16; omitting it returns -5. Call Combo Option Spread first and pass default_spread or a spread_list value. Optional for 1/2/6/15/100. See Naming Dictionary." },
      { name: "index_option_type", in: "query", type: "integer", required: false, description: "US index option type; required only for US index underlyings, omit for equities. Use the US block (1000+) in the Naming Dictionary." },
      { name: "filter_standard", in: "query", type: "string", required: false, description: "Filter by standard/non-standard, default ALL. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_option_strategy_spread",
    title: "Combo Option Spread",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-strategy-spread",
    risk: "read",
    doc: "api/quote/derivatives/option-strategy-spread",
    description: "Query the backend spread list and default spread for an underlying + strategy + expiry. Returns spread_list (already restored to real prices) and default_spread.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option underlying code, US only. e.g. US.AAPL." },
      { name: "strategy", in: "query", type: "integer", required: true, description: "Combo strategy type. See Naming Dictionary." },
      { name: "expire_time", in: "query", type: "string", required: true, description: "Near expiry date yyyy-MM-dd, e.g. 2026-08-21." },
      { name: "far_expire_time", in: "query", type: "string", required: false, description: "Far expiry date yyyy-MM-dd. Required for CalendarSpread(15) / DiagonalSpread(16), and must be later than expire_time." },
      { name: "index_option_type", in: "query", type: "integer", required: false, description: "US index option type; required only for US index underlyings. Use the US block (1000+) in the Naming Dictionary." },
      { name: "filter_standard", in: "query", type: "string", required: false, description: "Filter by standard/non-standard, default ALL. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_option_volatility",
    title: "Option Volatility",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/option-volatility",
    risk: "read",
    doc: "api/quote/derivatives/option-volatility",
    description: "Get implied volatility (IV), historical volatility (HV), volatility premium analysis and text analysis for an option contract.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Option contract code (must be an option contract, not an underlying stock code), e.g. HK.TCH260629C470000." },
      { name: "query_time_period", in: "query", type: "integer", required: false, description: "Query time period, default 2. 1=1 week, 2=1 month, 3=3 months, 4=6 months, 5=1 year. See Naming Dictionary." },
      { name: "hv_time_period", in: "query", type: "integer", required: false, description: "Historical volatility period (calendar days), default 30, range 5~250." }
    ],
  },
  {
    tool: "quote_order_book",
    title: "Order Book",
    method: "POST",
    path: "/api/v1.0/quote/order-book",
    risk: "read",
    doc: "api/quote/realtime/order-book",
    description: "Get real-time bid/ask order book for a symbol. The number of levels and book shape are determined jointly by the user's market data permission level (LV1/LV2/LV3) and category; the gateway automatically selects the fetch method and level count based on permissions.",
    params: [
      { name: "code", in: "body", type: "string", required: true, description: "Symbol code, format <MARKET>.<SYMBOL>, e.g. HK.00700." },
      { name: "num", in: "body", type: "integer", required: false, description: "Maximum number of price levels to return, range 1~60; if not provided, returns the maximum levels allowed by the user's permission." }
    ],
  },
  {
    tool: "quote_owner_plate",
    title: "Owner Plate",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/owner-plate",
    risk: "read",
    doc: "api/quote/basic-data/owner-plate",
    description: "Get the industry / concept sectors (plates) that a stock belongs to.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_plate_list",
    title: "Plate List",
    method: "GET",
    path: "/api/v1.0/quote/plate-list",
    risk: "read",
    doc: "api/quote/plate/plate-list",
    description: "Get all plates (sectors) under a specified market and plate class.",
    params: [
      { name: "market", in: "query", type: "string", required: true, description: "Market prefix. See Naming Dictionary." },
      { name: "plate_class", in: "query", type: "string", required: true, description: "Plate class: ALL / INDUSTRY / REGION / CONCEPT / OTHER. See Naming Dictionary." }
    ],
  },
  {
    tool: "quote_plate_stock",
    title: "Plate Stock",
    method: "GET",
    path: "/api/v1.0/quote/plate-stock",
    risk: "read",
    doc: "api/quote/plate/plate-stock",
    description: "Get the list of stock members under a specified plate (sector), with sorting and pagination support.",
    params: [
      { name: "plate_code", in: "query", type: "string", required: true, description: "Plate code (from the plate list API), e.g. HK.LIST1045." },
      { name: "sort_field", in: "query", type: "string", required: false, description: "Sort field. Default NONE. See Naming Dictionary." },
      { name: "ascend", in: "query", type: "boolean", required: false, description: "Ascending order. Default true." },
      { name: "price_type", in: "query", type: "string", required: false, description: "Value source for price-type sort fields. Default NORMAL. Values: NORMAL / BEFORE / AFTER / OVERNIGHT." },
      { name: "leverage_direction", in: "query", type: "integer", required: false, description: "ETF leverage direction filter (only effective for ETF plates): 0=all / 1=long / 2=short. Default 0." },
      { name: "leverage_multiple", in: "query", type: "integer", required: false, description: "ETF leverage multiple filter (only effective for ETF plates), scaled by 10^3, e.g. 2000=2x. Default 0=all." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor. Leave empty for the first page; pass the previous page's pagination.next_key." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 200, max 1000." }
    ],
  },
  {
    tool: "quote_rating_summary",
    title: "Rating Summary",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/research/rating-summary",
    risk: "read",
    doc: "api/quote/research/rating-summary",
    description: "Get the analyst rating summary for a stock, providing per-institution / per-analyst rating details (rating, target price, recommendation date, report link). Supports institution-level and analyst-level views.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. US.AAPL (only US/CA stocks have data)." },
      { name: "rating_dimension_type", in: "query", type: "integer", required: false, description: "Rating dimension. 1=Institution (default), 2=Analyst." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor; leave empty for the first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 20." }
    ],
  },
  {
    tool: "quote_reference_future",
    title: "Reference Future",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/reference-future",
    risk: "read",
    doc: "api/quote/derivatives/reference-future",
    description: "Get reference future contract information for a symbol.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, typically a futures front-month/continuous contract (e.g. HK.HSImain, US.CLmain, SG.NKmain). Non-futures symbols are valid but return an empty list." }
    ],
  },
  {
    tool: "quote_rehab",
    title: "Rehabilitation Factor",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/corporate-actions/rehab",
    risk: "read",
    doc: "api/quote/basic-data/rehab",
    description: "Get the adjustment (rehabilitation) factors for a stock, including forward/backward adjustment factors, dividend, split, and allotment ratios.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700 / US.AAPL" },
      { name: "divi_mode", in: "query", type: "string", required: false, description: "Dividend handling mode for adjustment factors. See Naming Dictionary > divi_mode" }
    ],
  },
  {
    tool: "quote_revenue_breakdown",
    title: "Revenue Breakdown",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/financials/revenue-breakdown",
    risk: "read",
    doc: "api/quote/financials/revenue-breakdown",
    description: "Get a company's revenue composition breakdown by product / industry / region / business dimension for a specified financial period, along with an available period dropdown list.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "date", in: "query", type: "integer", required: false, description: "Financial period end date (second-level timestamp); 0 = latest period. Default 0." },
      { name: "financial_type", in: "query", type: "integer", required: false, description: "Financial period type selector. Default 0. See Naming Dictionary." },
      { name: "currency_code", in: "query", type: "string", required: false, description: "Currency code (ISO 4217), e.g. USD. If not provided, returns in the original report currency." }
    ],
  },
  {
    tool: "quote_rt_data",
    title: "Real-time Data",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/rt-data",
    risk: "read",
    doc: "api/quote/realtime/rt-data",
    description: "Get intraday time-sharing data for a symbol. Supports NORMAL (default; HK automatically includes dark pool) / FULL (complete including pre/post market, US only) / PREMARKET / AFTERHOURS (US pre/post market) / HK_DARK (HK dark pool) / OVERNIGHT (night session). Current day trading sessions only, no cross-day history.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, format {market}.{code}, e.g. HK.00700." },
      { name: "request_section", in: "query", type: "string", required: false, description: "Trading session, default NORMAL. See request_section enum table below." }
    ],
  },
  {
    tool: "quote_rt_ticker",
    title: "Real-time Ticker",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/rt-ticker",
    risk: "read",
    doc: "api/quote/realtime/rt-ticker",
    description: "Get tick-by-tick trade data for a symbol. Returns the latest N trade details, including price, volume, buy/sell direction, trade type and session.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "num", in: "query", type: "integer", required: false, description: "Number of ticks to return, default 500, range 1~750." },
      { name: "period", in: "query", type: "array", items: "string", required: false, description: "Filter by session; pass multiple values with the same key, e.g. ?period=BEFORE&period=AFTER; omit for all sessions. See enum period_type." }
    ],
  },
  {
    tool: "quote_shareholders_overview",
    title: "Shareholders Overview",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/shareholders/overview",
    risk: "read",
    doc: "api/quote/shareholders/overview",
    description: "Get the shareholder holding overview for a company. Returns the top 5 shareholders, holder type distribution percentages, and available holding period list.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Security code, e.g. HK.00700." },
      { name: "period_id", in: "query", type: "integer", required: false, description: "Holding period ID. Default 0 (latest period)." }
    ],
  },
  {
    tool: "quote_short_daily_volume",
    title: "Daily Short Volume",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/short/daily-volume",
    risk: "read",
    doc: "api/quote/short/daily-volume",
    description: "Get daily short selling trade data for a symbol, sorted by date from newest to oldest. HK returns trade-level short data (short selling turnover, daily average ratio, etc.). US returns position-level short data (total short shares, Nasdaq/NYSE short shares, short ratio, etc.).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700 or US.AAPL." },
      { name: "count", in: "query", type: "integer", required: false, description: "Number of records. Default 30, max 90." }
    ],
  },
  {
    tool: "quote_short_interest",
    title: "Short Interest",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/short/interest",
    risk: "read",
    doc: "api/quote/short/interest",
    description: "Get short interest data for a stock (HK / US). Data is returned sorted by trading day from newest to oldest. HK returns short position details (outstanding short shares, percentage of float). US returns monthly short reports (short shares, short ratio, days to cover).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700 or US.AAPL." },
      { name: "count", in: "query", type: "integer", required: false, description: "Number of records. Default 30, max 90." }
    ],
  },
  {
    tool: "quote_splits",
    title: "Stock Splits",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/corporate-actions/splits",
    risk: "read",
    doc: "api/quote/corporate-actions/splits",
    description: "Get detailed records of HK stock split/consolidation events (split / consolidation / consolidation-then-split / split-then-consolidation). Only HK market is supported.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code (HK stocks only have data), e.g. HK.00700." }
    ],
  },
  {
    tool: "quote_statements",
    title: "Financial Statements",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/financials/statements",
    risk: "read",
    doc: "api/quote/financials/statements",
    description: "Get the income statement / balance sheet / cash flow statement / key metrics data for a company, returned by reporting period. Each record includes report period, fiscal year, financial period type, currency and accounting standards, as well as item_list (each field contains field_id, English field name display_name, value, YoY, QoQ).",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700." },
      { name: "statement_type", in: "query", type: "integer", required: false, description: "Report type. Default 1. 1=Income Statement, 2=Balance Sheet, 3=Cash Flow Statement, 4=Key Metrics." },
      { name: "financial_type", in: "query", type: "integer", required: false, description: "Financial period type. Default 10. See Naming Dictionary." },
      { name: "currency_code", in: "query", type: "string", required: false, description: "Currency code (ISO 4217), e.g. CNY, USD. Default is the report's native currency." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor. Leave empty for first page; pass the pagination.next_key from last response for next page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." }
    ],
  },
  {
    tool: "quote_stock_basicinfo",
    title: "Stock Basic Info",
    method: "POST",
    path: "/api/v1.0/quote/stock-basicinfo",
    risk: "read",
    doc: "api/quote/basic-data/stock-basicinfo",
    description: "Get basic static information for stocks (listing date, lot size, stock type, etc.).",
    params: [
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "List of symbol codes, 1-400 per request, e.g. [\"HK.00700\",\"US.AAPL\"]" }
    ],
  },
  {
    tool: "quote_stock_quote",
    title: "Stock Quote",
    method: "POST",
    path: "/api/v1.0/quote/stock-quote",
    risk: "read",
    doc: "api/quote/realtime/stock-quote",
    description: "Batch get real-time stock quotes (lightweight snapshot), aligned with the Quote base quote pushed via subscription. Compared to get_market_snapshot, the field set is more compact and suitable for multi-symbol polling.",
    params: [
      { name: "code_list", in: "body", type: "array", items: "string", required: true, description: "List of symbol codes." }
    ],
  },
  {
    tool: "quote_stock_screen",
    title: "Stock Screen",
    method: "POST",
    path: "/api/v1.0/quote/stock-screen",
    risk: "read",
    doc: "api/quote/screening/stock-screen",
    description: "Conditional stock screening: combine N filter conditions to filter, sort, and paginate across the entire market, returning multiple columns for each matched security based on specified retrieval factors. For warrant screening use warrant-screen; for option screening use option-screen.",
    params: [
      { name: "screen_queries", in: "body", type: "array", items: "string", required: true, description: "Filter condition array. Each element is a \"1-of-11\" query object -- simple_field_query (market/exchange/index/northbound sector enum field IN list) / plate_query (plate filter) / simple_property_query (quote/valuation factor range) / cumulative_property_query (cumulative quote range, requires period) / financial_property_query (financial factor range, requires fiscal period) / indicator_positional_query (technical indicator positional relationship) / indicator_pattern_query (technical pattern) / featured_property_query (featured factor) / broker_holdings_query (broker holdings, HK only) / kline_shape_query (K-line pattern) / option_query (option indicator). Ranges use lower={value, includes} / upper={value, includes}, where value is pre-multiplied by the field's multiplier." },
      { name: "retrieve_queries", in: "body", type: "array", items: "string", required: false, description: "Retrieval factor array. Each element is a \"1-of-9\" retrieve object -- basic_property / simple_property / cumulative_property / financial_property / featured_property / indicator_property / broker_property / kline_shape_property / option_property. Return order aligns exactly with retrieve_queries." },
      { name: "sort", in: "body", type: "object", required: false, description: "Single-field sort (mutually exclusive with sorts; sorts takes priority). Structure: {direction, simple_property:{name}} (can also use cumulative_property / financial_property / featured_property). direction: 1=ASC, 2=DESC, 3=ASC by absolute value, 4=DESC by absolute value." },
      { name: "sorts", in: "body", type: "array", items: "string", required: false, description: "Multi-field sort, priority by array order. Each element has the same structure as sort." },
      { name: "next_key", in: "body", type: "string", required: false, description: "Pagination cursor. Leave empty for the first page; pass back the previous page's pagination.next_key." },
      { name: "limit", in: "body", type: "integer", required: false, description: "Page size. Default 200, max 300." },
      { name: "watchlist_stock_ids", in: "body", type: "array", items: "integer", required: false, description: "Watchlist stock_id list. Used with user_stock_list_mode=1 to screen within watchlist scope." },
      { name: "holding_stock_ids", in: "body", type: "array", items: "integer", required: false, description: "Holdings stock_id list. Used with user_stock_list_mode=2 to screen within holdings scope." },
      { name: "user_stock_list_mode", in: "body", type: "integer", required: false, description: "User stock list filter mode: 0=unrestricted (default) / 1=watchlist only / 2=holdings only." }
    ],
  },
  {
    tool: "quote_top_brokers",
    title: "Top Buy/Sell Brokers",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/top-brokers",
    risk: "read",
    doc: "api/quote/top-brokers/top-brokers",
    description: "Get the top 10 buy/sell brokers for HK stocks, split into net buy and net sell groups. Provides both real-time and historical dimensions.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "HK stock code, e.g. HK.00700." },
      { name: "date", in: "query", type: "string", required: false, description: "Trading date to query (YYYY-MM-DD). Defaults to latest trading day." },
      { name: "days_before", in: "query", type: "integer", required: true, description: "Number of days before current trading day, range 1-365." }
    ],
  },
  {
    tool: "quote_trading_days",
    title: "Trading Days",
    method: "GET",
    path: "/api/v1.0/quote/trading-days",
    risk: "read",
    doc: "api/quote/basic-data/trading-days",
    description: "Get the trading calendar for a specified market within a date range.",
    params: [
      { name: "market", in: "query", type: "string", required: true, description: "Market code, e.g. HK, US, SH. See Naming Dictionary." },
      { name: "start", in: "query", type: "string", required: true, description: "Start date (yyyy-MM-dd)." },
      { name: "end", in: "query", type: "string", required: true, description: "End date (yyyy-MM-dd)." }
    ],
  },
  {
    tool: "quote_user_security",
    title: "Get User Security",
    method: "GET",
    path: "/api/v1.0/quote/user-security",
    risk: "read",
    doc: "api/quote/watchlist/user-security",
    description: "Get the watchlist (user security list) for a specified group. Returns each security's code, name, lot size, security type, and derivative information.",
    params: [
      { name: "group_name", in: "query", type: "string", required: true, description: "Group name (URL-encoded), max 100 characters. Group names can be obtained from user-security-group." }
    ],
  },
  {
    tool: "quote_user_security_group",
    title: "Get User Security Group",
    method: "GET",
    path: "/api/v1.0/quote/user-security-group",
    risk: "read",
    doc: "api/quote/watchlist/user-security-group",
    description: "Get the user's watchlist group list (including system preset groups and user custom groups). Use user-security to get symbols in a group; use modify-user-security to add/remove symbols.",
    params: [
      { name: "group_type", in: "query", type: "string", required: false, description: "Group type filter. Default ALL. Values: ALL=all / SYSTEM=system preset / CUSTOM=user custom." }
    ],
  },
  {
    tool: "quote_valuation_detail",
    title: "Valuation Detail",
    method: "GET",
    path: "/api/v1.0/quote/{symbol}/valuation/detail",
    risk: "read",
    doc: "api/quote/valuation/detail",
    description: "Get valuation metrics (PE/PB/PS) and historical trend for a stock or index. Stocks return full valuation (trend + market distribution + plate distribution + profit growth rate); indices return trend + constituent valuation distribution.",
    params: [
      { name: "symbol", in: "path", type: "string", required: true, description: "Symbol code, e.g. HK.00700 (stock) or HK.800700 (index)." },
      { name: "valuation_type", in: "query", type: "integer", required: false, description: "Valuation type. Default 1. 1=PE, 2=PB, 3=PS." },
      { name: "interval_type", in: "query", type: "integer", required: false, description: "Time span. Default 3. 1=3 months, 2=6 months, 3=1 year, 4=3 years, 5=Since May 2019, 6=5 years, 7=10 years, 8=2 years, 9=20 years, 10=30 years." }
    ],
  },
  {
    tool: "quote_valuation_index_stock_plates",
    title: "Index Related Plates",
    method: "GET",
    path: "/api/v1.0/quote/valuation/index-stock-plates",
    risk: "read",
    doc: "api/quote/valuation/index-stock-plates",
    description: "Get plates related to an index; usable as filter_security candidates for index constituent valuation.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Index symbol, e.g. HK.800000." }
    ],
  },
  {
    tool: "quote_valuation_index_stocks",
    title: "Index Component Valuation",
    method: "GET",
    path: "/api/v1.0/quote/valuation/index-stocks",
    risk: "read",
    doc: "api/quote/valuation/index-stocks",
    description: "Get valuation list of index constituents, with pagination, sorting and optional plate filter.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Index symbol, e.g. HK.800000 (HSI)." },
      { name: "valuation_type", in: "query", type: "integer", required: false, description: "Valuation type. Default 1. 1=PE, 2=PB, 3=PS." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor. Leave empty for first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." },
      { name: "sort_type", in: "query", type: "string", required: false, description: "Sort direction. Same as plate valuation API." },
      { name: "sort_id", in: "query", type: "string", required: false, description: "Sort field. Same as plate valuation API." },
      { name: "filter_security", in: "query", type: "string", required: false, description: "Filter index constituents by plate; leave empty for no filter. Use index-stock-plates API for candidates." }
    ],
  },
  {
    tool: "quote_valuation_plate_stocks",
    title: "Valuation Plate Stocks",
    method: "GET",
    path: "/api/v1.0/quote/valuation/plate-stocks",
    risk: "read",
    doc: "api/quote/valuation/plate-stocks",
    description: "Get the constituent stock list for a plate with valuation data, supporting pagination by valuation type, sort field and direction.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Industry plate code, e.g. HK.LIST1003." },
      { name: "valuation_type", in: "query", type: "integer", required: false, description: "Valuation type. Default 1. 1=PE, 2=PB, 3=PS." },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor, leave empty for first page." },
      { name: "limit", in: "query", type: "integer", required: false, description: "Page size. Default 10, max 50." },
      { name: "sort_type", in: "query", type: "string", required: false, description: "Sort direction. Default asc. asc=ascending, desc=descending." },
      { name: "sort_id", in: "query", type: "string", required: false, description: "Sort field. Default market_cap. Options: market_cap / valuation / forward_valuation / historical_percentile." }
    ],
  },
  {
    tool: "quote_warrant_screen",
    title: "Warrant Screen",
    method: "POST",
    path: "/api/v1.0/quote/warrant-screen",
    risk: "read",
    doc: "api/quote/screening/warrant-screen",
    description: "Warrant screening -- filter within the warrant market (CALL warrants / PUT warrants / BULL CBBCs / BEAR CBBCs / INLINE warrants) by combining dimensions such as issuer, underlying, price, strike price, maturity date, street ratio, implied volatility, leverage, delta, warrant status, etc. Supports multi-level sorting and pagination.",
    params: [
      { name: "market_type", in: "body", type: "integer", required: false, description: "Default 1 (HK). Allowed values: 1=HK (Hong Kong), 4=SG (Singapore), 15=MY (Malaysia)." },
      { name: "is_delay", in: "body", type: "boolean", required: false, description: "Whether to use delayed data. Default false." },
      { name: "only_count", in: "body", type: "boolean", required: false, description: "Return count only without detail list. Default false." },
      { name: "stock_owner", in: "body", type: "string", required: false, description: "Underlying code (convenience parameter, auto-converted to a single screen_groups condition, e.g. HK.00700). Use screen_groups for complex filtering." },
      { name: "screen_groups", in: "body", type: "array", items: "string", required: false, description: "Filter condition list. Each element structure: {field_id, interval{lower{value,is_included}, upper{value,is_included}}, choices[{content_type, value}]}. Discrete selection uses choices (multiple elements = OR); range filtering uses interval. See the wrnt_field enum table below for field_id values." },
      { name: "sorts", in: "body", type: "array", items: "string", required: false, description: "Sort condition list. Each element: {sort_field_id, sort_flag}. sort_flag=true for descending, false for ascending." },
      { name: "next_key", in: "body", type: "string", required: false, description: "Pagination cursor. Leave empty for first page; pass back previous page's pagination.next_key." },
      { name: "limit", in: "body", type: "integer", required: false, description: "Page size. Default 200, max 1000." }
    ],
  },
  {
    tool: "sim_accounts",
    title: "Account List",
    method: "GET",
    path: "/api/v1.0/sim-trade/accounts",
    risk: "sim",
    doc: "api/sim-trade/account-list",
    description: "Get the list of simulated trading accounts for the current logged-in user. Accounts are automatically created on the first call. The returned account_id is used as a path parameter for all subsequent trading endpoints.",
    params: [

    ],
  },
  {
    tool: "sim_cancel_order",
    title: "Cancel Order",
    method: "POST",
    path: "/api/v1.0/sim-trade/{acc_id}/orders/{order_id}/cancel",
    risk: "sim",
    doc: "api/sim-trade/cancel-order",
    description: "Cancel an unfilled order. Only orders with status=2 (Submitted) can be cancelled.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "order_id", in: "path", type: "string", required: true, description: "Order ID to cancel" }
    ],
  },
  {
    tool: "sim_funds",
    title: "Account Cash Info",
    method: "GET",
    path: "/api/v1.0/sim-trade/{acc_id}/cash-info",
    risk: "sim",
    doc: "api/sim-trade/cash-info",
    description: "Get account cash/asset information (balance, frozen amount, buying power, market value, P&L).",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" }
    ],
  },
  {
    tool: "sim_history_orders",
    title: "History Orders",
    method: "GET",
    path: "/api/v1.0/sim-trade/{acc_id}/history-orders",
    risk: "sim",
    doc: "api/sim-trade/history-order-list",
    description: "Get historical orders (supports time range + pagination).",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "time_begin", in: "query", type: "integer", required: false, description: "Start time (microseconds)" },
      { name: "time_end", in: "query", type: "integer", required: false, description: "End time (microseconds)" },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Page size (default 50)" },
      { name: "next_key", in: "query", type: "string", required: false, description: "Pagination cursor" }
    ],
  },
  {
    tool: "sim_max_qty",
    title: "Max Buy/Sell Quantity",
    method: "GET",
    path: "/api/v1.0/sim-trade/{acc_id}/max-buy-sell",
    risk: "sim",
    doc: "api/sim-trade/max-buy-sell",
    description: "Query the maximum buy/sell quantity for a security.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "symbol", in: "query", type: "string", required: true, description: "Security symbol" },
      { name: "order_type", in: "query", type: "integer", required: true, description: "1=Limit 3=Market" },
      { name: "price", in: "query", type: "string", required: false, description: "Price (required for limit orders)" },
      { name: "order_id", in: "query", type: "string", required: false, description: "Original order ID (for modification)" }
    ],
  },
  {
    tool: "sim_modify_order",
    title: "Modify Order",
    method: "POST",
    path: "/api/v1.0/sim-trade/{acc_id}/orders/{order_id}/modify",
    risk: "sim",
    doc: "api/sim-trade/modify-order",
    description: "Modify the quantity or price of an unfilled order. Only orders with status=2 (Submitted) can be modified.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "order_id", in: "path", type: "string", required: true, description: "Original order ID" },
      { name: "new_qty", in: "body", type: "string", required: false, description: "New quantity (must be a multiple of board lot)" },
      { name: "new_price", in: "body", type: "string", required: false, description: "New price" }
    ],
  },
  {
    tool: "sim_open_orders",
    title: "Today's Orders",
    method: "GET",
    path: "/api/v1.0/sim-trade/{acc_id}/orders",
    risk: "sim",
    doc: "api/sim-trade/order-list",
    description: "Get today's order list.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" }
    ],
  },
  {
    tool: "sim_place_order",
    title: "Place Order",
    method: "POST",
    path: "/api/v1.0/sim-trade/{acc_id}/orders",
    risk: "sim",
    doc: "api/sim-trade/input-order",
    description: "Place a simulated trade order. Limit orders require a price; orders priced above market price are filled immediately. HK stock quantities must be multiples of the board lot size.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "market", in: "body", type: "integer", required: true, description: "Market (from market_id in account list)" },
      { name: "symbol", in: "body", type: "string", required: true, description: "Security symbol" },
      { name: "order_type", in: "body", type: "integer", required: true, description: "1=Limit 3=Market" },
      { name: "order_side", in: "body", type: "integer", required: true, description: "1=Buy 2=Sell 3=Short Sell 4=Buy Back" },
      { name: "qty", in: "body", type: "string", required: true, description: "Quantity" },
      { name: "price", in: "body", type: "string", required: false, description: "Price (required for limit orders)" },
      { name: "text", in: "body", type: "string", required: false, description: "Remark (\u2264100 bytes)" }
    ],
  },
  {
    tool: "sim_positions",
    title: "Position List",
    method: "GET",
    path: "/api/v1.0/sim-trade/{acc_id}/positions",
    risk: "sim",
    doc: "api/sim-trade/position-list",
    description: "Get the position list (symbol, direction, quantity, cost, market value, P&L).",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID" },
      { name: "market", in: "query", type: "integer", required: false, description: "Market filter" }
    ],
  },
  {
    tool: "trade_accounts",
    title: "Get Authorized Trading Accounts",
    method: "GET",
    path: "/api/v1.0/accounts/authorized_trd_accs",
    risk: "read",
    doc: "api/trading/account/get-accounts",
    description: "Query the authorized trading accounts of uid.",
    params: [

    ],
  },
  {
    tool: "trade_cancel_order",
    title: "Cancel Order",
    method: "DELETE",
    path: "/api/v1.0/accounts/{acc_id}/orders/{order_id}",
    risk: "live_trade",
    doc: "api/trading/trade/cancel-order",
    description: "Cancel an existing order.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID." },
      { name: "order_id", in: "path", type: "string", required: true, description: "Order ID." },
      { name: "exchange", in: "query", type: "string", required: true, description: "Exchange. See Naming Dictionary - exchange." }
    ],
  },
  {
    tool: "trade_funds",
    title: "Get Account Funds",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/funds",
    risk: "read",
    doc: "api/trading/account/get-funds",
    description: "Query the net asset value, securities market value, cash, purchasing power and other fund data of the trading business account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "currency", in: "query", type: "string", required: true, description: "Display currency of funds. Only applicable to futures accounts and comprehensive securities accounts; this parameter will be ignored for other account types. In the returned data, except for fields that clearly indicate the currency, other fund-related fields are converted with this parameter." }
    ],
  },
  {
    tool: "trade_history_deals",
    title: "Get Historical Deals",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/fills_history",
    risk: "read",
    doc: "api/trading/deal/get-history-deals",
    description: "Query the historical transaction list of the specified trading business account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "trd_market", in: "query", type: "string", required: true, description: "Trading market. See Naming Dictionary" },
      { name: "code", in: "query", type: "string", required: false, description: "Code filtering. Return the data of the specified code. By default, return all data." },
      { name: "start", in: "query", type: "integer", required: false, description: "Start time of update time. Timestamp, in microseconds." },
      { name: "end", in: "query", type: "integer", required: false, description: "End time of update time, which should be after start time. Timestamp, in microseconds." },
      { name: "page_flag", in: "query", type: "string", required: true, description: "Empty string, which means starting from the beginning, otherwise using the page_flag returned by the server." },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Page size. Default is 50. Range: 10-50." }
    ],
  },
  {
    tool: "trade_history_orders",
    title: "Get Historical Orders",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/orders_history",
    risk: "read",
    doc: "api/trading/order/get-history-orders",
    description: "Query the historical order list of the specified trading business account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "trd_market", in: "query", type: "string", required: true, description: "Trading market. See Naming Dictionary" },
      { name: "code", in: "query", type: "string", required: false, description: "Code filtering. Return the data of the specified code. By default, return all data." },
      { name: "start", in: "query", type: "integer", required: false, description: "Start time of create time. Timestamp, in microseconds." },
      { name: "end", in: "query", type: "integer", required: false, description: "End time of create time, which should be after start time. Timestamp, in microseconds." },
      { name: "page_flag", in: "query", type: "string", required: true, description: "Empty string, which means starting from the beginning, otherwise using the page_flag returned by the server." },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Page size. Default is 50. Range: 10-100." }
    ],
  },
  {
    tool: "trade_max_qty",
    title: "Query Max Tradable Quantity",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/acctradinginfo",
    risk: "read",
    doc: "api/trading/trade/get-max-qty",
    description: "Query the maximum quantity that can be bought or sold under a specific trading account, and you can also query the maximum changeable quantity of a specific order.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "code", in: "query", type: "string", required: true, description: "Symbol code. Format: exchange.symbol, e.g. US.AAPL" },
      { name: "price", in: "query", type: "string", required: false, description: "Price of a non-market order. For securities accounts, accurate to 3 decimal places. For futures accounts, accurate to 9 decimal places. Excess will be discarded." },
      { name: "order_type", in: "query", type: "string", required: true, description: "Order type. See Naming Dictionary" },
      { name: "order_id", in: "query", type: "string", required: false, description: "Order ID. By default, using empty string to query the maximum available quantity for new orders. If an order needs modifying, the order_id needs to be transmitted. If you use this parameter to query the maximum quantity, you need to call this interface again after placing an order, with an interval of more than 0.5 seconds." }
    ],
  },
  {
    tool: "trade_modify_order",
    title: "Modify Order",
    method: "PUT",
    path: "/api/v1.0/accounts/{acc_id}/orders/{order_id}",
    risk: "live_trade",
    doc: "api/trading/trade/modify-order",
    description: "Modify an existing order.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID." },
      { name: "order_id", in: "path", type: "string", required: true, description: "Order ID." },
      { name: "exchange", in: "body", type: "string", required: true, description: "Exchange. See Naming Dictionary - exchange." },
      { name: "qty", in: "body", type: "string", required: true, description: "The quantity after the order is changed. The unit of options and futures is \"contract\"." },
      { name: "price", in: "body", type: "string", required: true, description: "The price after the order is changed. 9 decimal places for futures, 4 for others; excess is discarded." },
      { name: "aux_price", in: "body", type: "string", required: false, description: "Trigger price. Required when order type is STOP, STOP_LIMIT, MARKET_IF_TOUCHED, or LIMIT_IF_TOUCHED. The price will be rounded to 3 decimals for securities account, and 9 decimals for futures account." }
    ],
  },
  {
    tool: "trade_open_orders",
    title: "Get Open Orders",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/orders",
    risk: "read",
    doc: "api/trading/order/get-open-orders",
    description: "Query the list of open orders for a specified account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "trd_market", in: "query", type: "string", required: true, description: "Trading market. See Naming Dictionary" },
      { name: "page_flag", in: "query", type: "string", required: true, description: "Empty string, which means starting from the beginning, otherwise using the page_flag returned by the server." },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Page size. Default is 50. Range: 10-100." }
    ],
  },
  {
    tool: "trade_order_confirm",
    title: "Order Confirm",
    method: "POST",
    path: "/api/v1.0/accounts/{acc_id}/order_confirm",
    risk: "live_trade",
    doc: "api/trading/trade/order-confirm",
    description: "Confirm an order. This endpoint needs to be called when need_order_confirm is returned as true after placing or modifying an order.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID." },
      { name: "confirm_id", in: "body", type: "string", required: true, description: "Order confirm ID, from the confirm_id of place order or modify order response." }
    ],
  },
  {
    tool: "trade_order_detail",
    title: "Get Order Details",
    method: "POST",
    path: "/api/v1.0/accounts/{acc_id}/orders/detail",
    risk: "live_trade",
    doc: "api/trading/order/get-order-details",
    description: "Query the details of specified orders.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "exchange", in: "body", type: "string", required: true, description: "Exchange. If querying multiple orders, these orders must be in the same exchange. See Naming Dictionary" },
      { name: "order_ids", in: "body", type: "array", items: "string", required: true, description: "Order ID list. The length of order_ids should be less than 50." }
    ],
  },
  {
    tool: "trade_place_order",
    title: "Place Order",
    method: "POST",
    path: "/api/v1.0/accounts/{acc_id}/orders",
    risk: "live_trade",
    doc: "api/trading/trade/place-order",
    description: "Place a new order.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Business account ID." },
      { name: "code", in: "body", type: "string", required: true, description: "Tradable symbol. Format: exchange.symbol, e.g. US.AAPL, US.AAPL250926C235000" },
      { name: "qty", in: "body", type: "string", required: true, description: "Order quantity. The unit of options and futures is \"contract\"." },
      { name: "price", in: "body", type: "string", required: false, description: "Order price. 4 decimal place accuracy (9 for futures), excess part will be rounded." },
      { name: "side", in: "body", type: "string", required: true, description: "Trading direction. Values: BUY, SELL, SELL_SHORT, BUY_BACK" },
      { name: "order_type", in: "body", type: "string", required: true, description: "Order type. Values: LIMIT, MARKET, AUCTION, AUCTION_LIMIT, STOP, STOP_LIMIT, MARKET_IF_TOUCHED, LIMIT_IF_TOUCHED" },
      { name: "time_in_force", in: "body", type: "string", required: true, description: "Valid period. Values: DAY (good for the day), GTC (good until cancel)" },
      { name: "session", in: "body", type: "string", required: false, description: "Trading session (US stocks only). Values: RTH (regular trading hours), RTH+Pre/Post-Mkt, OVERNIGHT (night trading only), ALL_DAY. Market orders only support RTH." },
      { name: "aux_price", in: "body", type: "string", required: false, description: "Trigger price. Required when order type is STOP, STOP_LIMIT, MARKET_IF_TOUCHED, or LIMIT_IF_TOUCHED. The price will be rounded to 3 decimals for securities account, and 9 decimals for futures account." },
      { name: "lot_type", in: "body", type: "string", required: false, description: "Lot type, default round lot. Used for HK stock trading." },
      { name: "remark", in: "body", type: "string", required: false, description: "Remark. Maximum length after converting to UTF-8 is 64 bytes." },
      { name: "order_class", in: "body", type: "string", required: false, description: "Order class. Specify as MLEG for multi-leg orders." },
      { name: "multi_leg_info", in: "body", type: "string", required: false, description: "Multi-leg order info. Required when placing multi-leg orders." }
    ],
  },
  {
    tool: "trade_positions",
    title: "Get Positions",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/positions",
    risk: "read",
    doc: "api/trading/account/get-positions",
    description: "Query the holding position list of a specific trading account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "code", in: "query", type: "string", required: false, description: "Only return positions matching these codes. If not passed, return all. For futures positions, you need to pass the contract code with a specific month; filtering by the main contract code is not supported." },
      { name: "pl_ratio_min", in: "query", type: "string", required: false, description: "Lower limit of current P&L ratio filter. e.g. When 10 is passed, positions with P&L ratio \u2265 +10% will be returned." },
      { name: "pl_ratio_max", in: "query", type: "string", required: false, description: "Upper limit of current P&L ratio filter. e.g. When 20 is passed, positions with P&L ratio \u2264 +20% will be returned." }
    ],
  },
  {
    tool: "trade_today_deals",
    title: "Get Today's Deals",
    method: "GET",
    path: "/api/v1.0/accounts/{acc_id}/order_fills",
    risk: "read",
    doc: "api/trading/deal/get-today-deals",
    description: "Query the daily transaction list of the specified trading business account.",
    params: [
      { name: "acc_id", in: "path", type: "string", required: true, description: "Trading business account ID." },
      { name: "trd_market", in: "query", type: "string", required: true, description: "Trading market. See Naming Dictionary" },
      { name: "page_flag", in: "query", type: "string", required: true, description: "Empty string, which means starting from the beginning, otherwise using the page_flag returned by the server." },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Page size. Default is 50. Range: 10-100." }
    ],
  },
];
