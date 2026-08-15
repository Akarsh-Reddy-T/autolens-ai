"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Bell,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  Heart,
  Info,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { scoreValuation, type ValuationResult } from "../lib/market-engine";

type VehicleKey = "rav4" | "crv" | "cx5";

type Listing = {
  id: number;
  dealer: string;
  distance: number;
  price: number;
  miles: number;
  badge: "Great" | "Good" | "Fair";
  history: string;
};

type Vehicle = {
  key: VehicleKey;
  year: number;
  make: string;
  model: string;
  trim: string;
  body: string;
  drivetrain: string;
  mpg: string;
  reliability: number;
  fairValue: number;
  trend: number;
  recallCount: number;
  listings: Listing[];
  prices: number[];
};

const vehicles: Record<VehicleKey, Vehicle> = {
  rav4: {
    key: "rav4",
    year: 2021,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE",
    body: "Compact SUV",
    drivetrain: "AWD",
    mpg: "28 combined",
    reliability: 88,
    fairValue: 26_240,
    trend: -2.8,
    recallCount: 1,
    prices: [27_950, 27_620, 27_410, 26_980, 26_730, 26_510, 26_240],
    listings: [
      { id: 1, dealer: "Mile High Toyota", distance: 8, price: 24_890, miles: 47_281, badge: "Great", history: "Clean · 1 owner" },
      { id: 2, dealer: "Peak Auto Collective", distance: 14, price: 25_450, miles: 51_103, badge: "Good", history: "Clean · 2 owners" },
      { id: 3, dealer: "Front Range Motors", distance: 21, price: 26_150, miles: 42_860, badge: "Good", history: "Minor damage" },
      { id: 4, dealer: "Aspen Grove Auto", distance: 33, price: 26_980, miles: 39_442, badge: "Fair", history: "Clean · 1 owner" },
    ],
  },
  crv: {
    key: "crv",
    year: 2021,
    make: "Honda",
    model: "CR-V",
    trim: "EX",
    body: "Compact SUV",
    drivetrain: "AWD",
    mpg: "29 combined",
    reliability: 84,
    fairValue: 25_780,
    trend: -2.1,
    recallCount: 2,
    prices: [27_210, 27_020, 26_860, 26_490, 26_170, 25_960, 25_780],
    listings: [
      { id: 11, dealer: "Schomp Honda", distance: 11, price: 24_990, miles: 49_822, badge: "Good", history: "Clean · 1 owner" },
      { id: 12, dealer: "Centennial Auto", distance: 18, price: 25_290, miles: 45_231, badge: "Good", history: "Clean · 2 owners" },
      { id: 13, dealer: "Altitude Motors", distance: 26, price: 25_940, miles: 41_780, badge: "Fair", history: "Minor damage" },
      { id: 14, dealer: "Boulder Imports", distance: 37, price: 26_430, miles: 38_912, badge: "Fair", history: "Clean · 1 owner" },
    ],
  },
  cx5: {
    key: "cx5",
    year: 2021,
    make: "Mazda",
    model: "CX-5",
    trim: "Touring",
    body: "Compact SUV",
    drivetrain: "AWD",
    mpg: "27 combined",
    reliability: 86,
    fairValue: 24_920,
    trend: -3.3,
    recallCount: 0,
    prices: [26_880, 26_610, 26_320, 25_940, 25_570, 25_190, 24_920],
    listings: [
      { id: 21, dealer: "McDonald Mazda", distance: 9, price: 23_780, miles: 46_140, badge: "Great", history: "Clean · 1 owner" },
      { id: 22, dealer: "Foothills Auto", distance: 16, price: 24_250, miles: 50_061, badge: "Good", history: "Clean · 2 owners" },
      { id: 23, dealer: "Urban Motors", distance: 24, price: 24_870, miles: 43_505, badge: "Good", history: "Clean · 1 owner" },
      { id: 24, dealer: "Red Rocks Cars", distance: 31, price: 25_490, miles: 40_220, badge: "Fair", history: "Minor damage" },
    ],
  },
};

const alternatives = [
  { key: "cx5" as VehicleKey, name: "2021 Mazda CX-5 Touring", price: 24_920, delta: -1_320, strength: "Premium interior", score: 86 },
  { key: "crv" as VehicleKey, name: "2021 Honda CR-V EX", price: 25_780, delta: -460, strength: "More cargo room", score: 84 },
  { key: "rav4" as VehicleKey, name: "2020 Subaru Forester Premium", price: 24_580, delta: -1_660, strength: "Best visibility", score: 82 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function PriceHistory({ values }: { values: number[] }) {
  const min = Math.min(...values) - 400;
  const max = Math.max(...values) + 200;
  return (
    <div className="history-chart" aria-label="Seven month average listing price trend">
      <div className="chart-grid"><span>{formatCurrency(max)}</span><span>{formatCurrency((min + max) / 2)}</span><span>{formatCurrency(min)}</span></div>
      <div className="chart-bars">
        {values.map((value, index) => (
          <div className="bar-slot" key={value + index}>
            <div className="bar" style={{ height: `${32 + ((value - min) / (max - min)) * 62}%` }}><span className="bar-point" /></div>
          </div>
        ))}
      </div>
      <div className="chart-labels"><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
    </div>
  );
}

export default function Home() {
  const [vehicleKey, setVehicleKey] = useState<VehicleKey>("rav4");
  const [searchMake, setSearchMake] = useState("Toyota");
  const [searchModel, setSearchModel] = useState("RAV4");
  const [selectedListingId, setSelectedListingId] = useState(1);
  const [zip, setZip] = useState("80206");
  const [radius, setRadius] = useState(50);
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [sort, setSort] = useState("best");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notice, setNotice] = useState("Sample market data");
  const vehicle = vehicles[vehicleKey];
  const selectedListing = vehicle.listings.find((listing) => listing.id === selectedListingId) ?? vehicle.listings[0];
  const defaultValuation = useMemo(
    () => scoreValuation({
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      mileage: selectedListing.miles,
      askingPrice: selectedListing.price,
      zip,
      radius,
      condition,
      accidentCount: selectedListing.history.includes("Minor") ? 1 : 0,
    }),
    [vehicle, selectedListing, zip, radius, condition],
  );
  const [valuation, setValuation] = useState<ValuationResult>(() => defaultValuation);
  const [targetPrice, setTargetPrice] = useState(defaultValuation.targetPrice);

  const sortedListings = useMemo(() => {
    const items = [...vehicle.listings];
    if (sort === "price") return items.sort((a, b) => a.price - b.price);
    if (sort === "mileage") return items.sort((a, b) => a.miles - b.miles);
    return items;
  }, [vehicle.listings, sort]);

  const availableModels = useMemo(
    () => (Object.values(vehicles) as Vehicle[]).filter((item) => item.make === searchMake),
    [searchMake],
  );

  function searchMarket(event: FormEvent) {
    event.preventDefault();
    const match = (Object.values(vehicles) as Vehicle[]).find(
      (item) => item.make === searchMake && item.model === searchModel,
    );
    if (match) {
      chooseVehicle(match.key);
      setNotice(`${match.make} ${match.model} market loaded`);
    } else {
      setNotice("That vehicle needs the live catalog—showing the closest demo market");
    }
  }

  async function analyzeVehicle(event?: FormEvent) {
    event?.preventDefault();
    setIsAnalyzing(true);
    const payload = {
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: condition === "new" ? 2026 : vehicle.year,
      mileage: condition === "new" ? 18 : selectedListing.miles,
      askingPrice: condition === "new" ? selectedListing.price + 10_500 : selectedListing.price,
      zip,
      radius,
      condition,
      accidentCount: selectedListing.history.includes("Minor") ? 1 : 0,
    } as const;
    let result = scoreValuation(payload);
    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json() as { valuation: ValuationResult };
        result = data.valuation;
        setNotice("Analysis refreshed");
      } else {
        setNotice("Analysis refreshed locally");
      }
    } catch {
      setNotice("Analysis refreshed locally");
    }
    setValuation(result);
    setTargetPrice(result.targetPrice);
    setIsAnalyzing(false);
    setIsSearchOpen(false);
  }

  function chooseVehicle(key: VehicleKey) {
    const next = vehicles[key];
    const listing = next.listings[0];
    const nextValuation = scoreValuation({
      make: next.make,
      model: next.model,
      trim: next.trim,
      year: next.year,
      mileage: listing.miles,
      askingPrice: listing.price,
      zip,
      radius,
      condition,
    });
    setVehicleKey(key);
    setSearchMake(next.make);
    setSearchModel(next.model);
    setSelectedListingId(listing.id);
    setValuation(nextValuation);
    setTargetPrice(nextValuation.targetPrice);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectListing(listing: Listing) {
    setSelectedListingId(listing.id);
    const nextValuation = scoreValuation({
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      mileage: listing.miles,
      askingPrice: listing.price,
      zip,
      radius,
      condition,
      accidentCount: listing.history.includes("Minor") ? 1 : 0,
    });
    setValuation(nextValuation);
    setTargetPrice(nextValuation.targetPrice);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AutoLens home">
          <span className="brand-mark"><CarFront size={21} strokeWidth={2.4} /></span>
          <span>AutoLens<em>AI</em></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="active" href="#market">Market</a>
          <a href="#history">History</a>
          <a href="#alternatives">Compare</a>
          <a href="#playbook">Buy smarter</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Price alerts"><Bell size={18} /></button>
          <button className="user-button"><span>AR</span><ChevronDown size={15} /></button>
          <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
        </div>
      </header>

      <div className="demo-strip">
        <span><Sparkles size={14} /> {notice}</span>
        <p>Connect licensed listing and vehicle-history providers for production decisions.</p>
        <button onClick={() => setIsSearchOpen(true)}>Data plan <ArrowRight size={13} /></button>
      </div>

      <main id="top">
        <form className="car-search-bar" onSubmit={searchMarket}>
          <div className="search-lead"><span><Search size={19} /></span><div><strong>Search a car</strong><small>Compare the local market</small></div></div>
          <label><span>Brand</span><select value={searchMake} onChange={(event) => { const make = event.target.value; const first = (Object.values(vehicles) as Vehicle[]).find((item) => item.make === make); setSearchMake(make); setSearchModel(first?.model ?? ""); }} aria-label="Car brand">{Array.from(new Set((Object.values(vehicles) as Vehicle[]).map((item) => item.make))).map((make) => <option key={make}>{make}</option>)}</select></label>
          <label><span>Model</span><select value={searchModel} onChange={(event) => setSearchModel(event.target.value)} aria-label="Car model">{availableModels.map((item) => <option key={item.key} value={item.model}>{item.model} {item.trim}</option>)}</select></label>
          <label><span>Condition</span><select value={condition} onChange={(event) => setCondition(event.target.value as "new" | "used")} aria-label="New or used"><option value="used">Used</option><option value="new">New</option></select></label>
          <label><span>ZIP code</span><div className="compact-input"><MapPin size={14} /><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="Search ZIP code" /></div></label>
          <label><span>Radius</span><select value={radius} onChange={(event) => setRadius(Number(event.target.value))} aria-label="Search radius"><option value={25}>25 mi</option><option value={50}>50 mi</option><option value={100}>100 mi</option><option value={250}>250 mi</option></select></label>
          <button className="primary-button" disabled={zip.length !== 5}><Search size={16} />Search market</button>
        </form>

        <section className="vehicle-toolbar">
          <div>
            <div className="eyebrow"><span>USED</span><span className="dot" />{vehicle.body}<span className="dot" />Updated 11 min ago</div>
            <h1>{vehicle.year} {vehicle.make} {vehicle.model} <span>{vehicle.trim}</span></h1>
            <div className="vehicle-meta">
              <span><MapPin size={14} /> {zip} · {radius} miles</span>
              <span><Gauge size={14} /> {formatNumber(selectedListing.miles)} mi</span>
              <span>{vehicle.drivetrain}</span>
              <span>{vehicle.mpg} mpg</span>
            </div>
          </div>
          <div className="toolbar-actions">
            <button className={`save-button ${isSaved ? "saved" : ""}`} onClick={() => setIsSaved(!isSaved)}>
              <Heart size={17} fill={isSaved ? "currentColor" : "none"} />{isSaved ? "Saved" : "Save search"}
            </button>
            <button className="primary-button" onClick={() => setIsSearchOpen(true)}><Search size={17} />Change vehicle</button>
          </div>
        </section>

        <section className="hero-grid" id="market">
          <article className="card valuation-card">
            <div className="card-topline">
              <div>
                <p className="section-label">AUTOLENS ESTIMATE</p>
                <div className="value-line"><strong>{formatCurrency(valuation.fairValue)}</strong><span>fair value</span></div>
              </div>
              <div className="confidence"><ShieldCheck size={16} />{valuation.confidence}% confidence</div>
            </div>

            <div className="deal-summary">
              <div className="score-ring" style={{ "--score": `${valuation.dealScore * 3.6}deg` } as React.CSSProperties}>
                <div><strong>{valuation.dealScore}</strong><span>/100</span></div>
              </div>
              <div className="deal-copy">
                <span className={`deal-pill ${valuation.verdict.startsWith("Great") ? "great" : "good"}`}><BadgeCheck size={15} />{valuation.verdict}</span>
                <h2>{formatCurrency(selectedListing.price)} asking</h2>
                <p>{valuation.savingsVsMarket >= 0 ? `${formatCurrency(valuation.savingsVsMarket)} below` : `${formatCurrency(Math.abs(valuation.savingsVsMarket))} above`} the adjusted local market.</p>
              </div>
            </div>

            <div className="market-range">
              <div className="range-labels"><span>Low {formatCurrency(valuation.lowRange)}</span><span>Fair range</span><span>High {formatCurrency(valuation.highRange)}</span></div>
              <div className="range-track"><span className="fair-zone" /><span className="price-pin" style={{ left: `${Math.max(8, Math.min(92, ((selectedListing.price - valuation.lowRange) / (valuation.highRange - valuation.lowRange)) * 100))}%` }}><i>{formatCurrency(selectedListing.price)}</i></span></div>
            </div>

            <div className="factor-grid">
              {valuation.factors.slice(0, 3).map((factor) => (
                <div key={factor.label}><span>{factor.label}</span><strong className={factor.impact >= 0 ? "positive" : "negative"}>{factor.impact >= 0 ? "+" : ""}{formatCurrency(factor.impact)}</strong></div>
              ))}
            </div>
            <button className="text-button">See how we calculated this <ArrowRight size={15} /></button>
          </article>

          <article className="card history-card" id="history">
            <div className="card-heading">
              <div><p className="section-label">VEHICLE TRUST</p><h2>History snapshot</h2></div>
              <span className="clean-badge"><CheckCircle2 size={16} />Low risk</span>
            </div>
            <div className="vin-line"><span>VIN</span><strong>2T3P1RFV•••18462</strong><button aria-label="Vehicle information"><Info size={15} /></button></div>
            <div className="trust-list">
              <div><span className="trust-icon good"><Check size={17} /></span><p><strong>Clean title</strong><small>No salvage, flood, or lemon record</small></p></div>
              <div><span className="trust-icon good"><ShieldCheck size={17} /></span><p><strong>No accidents reported</strong><small>Across available sources</small></p></div>
              <div><span className="trust-icon neutral"><UserRound size={17} /></span><p><strong>1 previous owner</strong><small>Personal use · Colorado</small></p></div>
              <div><span className="trust-icon neutral"><Wrench size={17} /></span><p><strong>8 service records</strong><small>Last serviced 4,120 miles ago</small></p></div>
            </div>
            <button className="outline-button full" onClick={() => setIsHistoryOpen(!isHistoryOpen)}><FileCheck2 size={16} />{isHistoryOpen ? "Hide detailed history" : "Review detailed history"}<ChevronRight size={16} /></button>
            {isHistoryOpen && <div className="history-detail"><div><span>Jun 2021</span><p><strong>First registered</strong>Denver, CO</p></div><div><span>Jan 2024</span><p><strong>30k-mile service</strong>Dealer maintenance record</p></div><div><span>Apr 2026</span><p><strong>Offered for sale</strong>Mile High Toyota</p></div></div>}
            <p className="source-note"><Info size={13} />Demo record. A licensed NMVTIS/history feed is required before purchase.</p>
          </article>
        </section>

        <section className="content-grid">
          <div className="main-column">
            <article className="card trend-card">
              <div className="card-heading">
                <div><p className="section-label">PRICE MOMENTUM</p><h2>Local prices are cooling</h2></div>
                <span className="trend-badge"><TrendingDown size={15} />{Math.abs(vehicle.trend)}% in 6 months</span>
              </div>
              <div className="trend-summary"><strong>{formatCurrency(vehicle.fairValue)}</strong><span>Median list price · {radius} mi</span><p><ArrowDownRight size={16} /> Buyers have gained about <b>$710</b> of leverage since February.</p></div>
              <PriceHistory values={vehicle.prices} />
              <div className="chart-footer"><span><i className="legend-dot market" />Median listing price</span><span><i className="legend-dot selected" />Selected vehicle</span><small>43 comparable listings</small></div>
            </article>

            <article className="card listings-card">
              <div className="card-heading listing-heading">
                <div><p className="section-label">LOCAL INVENTORY</p><h2>Best comparable listings</h2></div>
                <label className="sort-control"><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort listings"><option value="best">Best match</option><option value="price">Lowest price</option><option value="mileage">Lowest miles</option></select></label>
              </div>
              <div className="listing-table">
                <div className="listing-row listing-header"><span>Vehicle & dealer</span><span>Mileage</span><span>History</span><span>Price</span><span /></div>
                {sortedListings.map((listing) => (
                  <button key={listing.id} className={`listing-row ${listing.id === selectedListing.id ? "selected" : ""}`} onClick={() => selectListing(listing)}>
                    <span className="listing-name"><i><CarFront size={20} /></i><span><strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong><small>{listing.dealer} · {listing.distance} mi</small></span></span>
                    <span><strong>{formatNumber(listing.miles)}</strong><small>miles</small></span>
                    <span><strong>{listing.history.split(" · ")[0]}</strong><small>{listing.history.split(" · ")[1] ?? "History available"}</small></span>
                    <span className="listing-price"><strong>{formatCurrency(listing.price)}</strong><small className={`deal-${listing.badge.toLowerCase()}`}>{listing.badge} price</small></span>
                    <span className="row-chevron"><ChevronRight size={17} /></span>
                  </button>
                ))}
              </div>
              <button className="text-button centered">View all 43 local listings <ArrowRight size={15} /></button>
            </article>

            <article className="card alternatives-card" id="alternatives">
              <div className="card-heading"><div><p className="section-label">SMARTER SHORTLIST</p><h2>Strong alternatives for less</h2></div><button className="text-button">Compare all <ArrowRight size={15} /></button></div>
              <div className="alternative-grid">
                {alternatives.map((item, index) => (
                  <button className="alternative" key={item.name} onClick={() => chooseVehicle(item.key)}>
                    <div className={`alt-visual alt-${index + 1}`}><CarFront size={46} strokeWidth={1.3} /><span>{item.score} reliability</span></div>
                    <div className="alt-copy"><h3>{item.name}</h3><p>{item.strength}</p><div><strong>{formatCurrency(item.price)}</strong><span>{formatCurrency(Math.abs(item.delta))} less</span></div></div>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <aside className="side-column">
            <article className="card ownership-card">
              <div className="card-heading"><div><p className="section-label">OWNERSHIP SIGNAL</p><h2>Built to go the distance</h2></div><span className="reliability-score">{vehicle.reliability}</span></div>
              <div className="meter"><span style={{ width: `${vehicle.reliability}%` }} /></div>
              <div className="rating-labels"><span>Model reliability</span><strong>Very good</strong></div>
              <div className="ownership-stats">
                <div><Wrench size={18} /><p><span>10-year repairs</span><strong>$5,210</strong><small>$1,180 below class avg.</small></p></div>
                <div><AlertTriangle size={18} /><p><span>Open recalls</span><strong>{vehicle.recallCount}</strong><small>{vehicle.recallCount ? "Free dealer remedy available" : "No open campaigns found"}</small></p></div>
                <div><Gauge size={18} /><p><span>Expected lifespan</span><strong>200k+ mi</strong><small>With routine maintenance</small></p></div>
              </div>
              <button className="text-button">Explore reliability report <ArrowRight size={15} /></button>
            </article>

            <article className="card target-card" id="playbook">
              <div className="target-heading"><span><Target size={20} /></span><div><p className="section-label">YOUR BUYING TARGET</p><h2>{formatCurrency(targetPrice)}</h2></div></div>
              <p className="target-intro">A realistic opening target based on this vehicle, local inventory, and recent price movement.</p>
              <label className="target-slider">
                <span><small>Aggressive</small><small>Easy close</small></span>
                <input type="range" min={Math.round(valuation.lowRange * 0.98)} max={Math.round(selectedListing.price * 1.01)} step="50" value={targetPrice} onChange={(event) => setTargetPrice(Number(event.target.value))} />
              </label>
              <div className="target-savings"><span>Potential savings</span><strong>{formatCurrency(Math.max(0, selectedListing.price - targetPrice))}</strong></div>
              <div className="playbook">
                <h3>Your 3-step playbook</h3>
                <ol>
                  <li><span>1</span><p><strong>Lead with comparable #2</strong>It is {formatCurrency(Math.max(0, selectedListing.price - 24_250))} less within {radius} miles.</p></li>
                  <li><span>2</span><p><strong>Ask for out-the-door price</strong>Keep fees from hiding in the monthly payment.</p></li>
                  <li><span>3</span><p><strong>Time the offer</strong>Try Monday evening or the final 3 days of the month.</p></li>
                </ol>
              </div>
              <button className="primary-button full" onClick={() => { navigator.clipboard?.writeText(`I’m ready to buy today at ${formatCurrency(targetPrice)} before taxes, with no dealer add-ons. Can you send the out-the-door breakdown?`); setNotice("Negotiation script copied"); }}><Sparkles size={16} />Copy negotiation script</button>
              <p className="tiny-note">Guidance only. Taxes, fees, inspection results, and financing affect your final price.</p>
            </article>
          </aside>
        </section>
      </main>

      <footer><div className="brand"><span className="brand-mark"><CarFront size={18} /></span><span>AutoLens<em>AI</em></span></div><p>Transparent car intelligence for confident decisions.</p><div><a href="#top">Methodology</a><a href="#top">Data sources</a><a href="#top">Privacy</a></div></footer>

      {isSearchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsSearchOpen(false)}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading"><div><p className="section-label">MARKET SEARCH</p><h2 id="search-title">Find your next car</h2><p>Compare a new or used vehicle against the local market.</p></div><button className="icon-button" onClick={() => setIsSearchOpen(false)} aria-label="Close search"><X size={19} /></button></div>
            <div className="condition-toggle"><button className={condition === "used" ? "active" : ""} onClick={() => setCondition("used")}>Used</button><button className={condition === "new" ? "active" : ""} onClick={() => setCondition("new")}>New</button></div>
            <div className="quick-vehicles">
              {(Object.values(vehicles) as Vehicle[]).map((item) => <button key={item.key} className={item.key === vehicleKey ? "active" : ""} onClick={() => chooseVehicle(item.key)}><CarFront size={21} /><span><strong>{item.year} {item.make}</strong><small>{item.model} {item.trim}</small></span><Check size={16} /></button>)}
            </div>
            <form onSubmit={analyzeVehicle} className="search-form">
              <label><span>ZIP code</span><div className="input-wrap"><MapPin size={16} /><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="ZIP code" /></div></label>
              <label><span>Search radius</span><div className="input-wrap"><CircleDollarSign size={16} /><select value={radius} onChange={(event) => setRadius(Number(event.target.value))} aria-label="Search radius"><option value={25}>25 miles</option><option value={50}>50 miles</option><option value={100}>100 miles</option><option value={250}>250 miles</option></select></div></label>
              <button className="primary-button full" disabled={zip.length !== 5 || isAnalyzing}>{isAnalyzing ? <><span className="spinner" />Analyzing market…</> : <><Sparkles size={17} />Analyze this market</>}</button>
            </form>
            <div className="provider-note"><ShieldCheck size={18} /><p><strong>Production data architecture ready</strong><span>NHTSA VIN/recall data plus adapters for licensed listings and history providers.</span></p></div>
          </section>
        </div>
      )}
    </div>
  );
}
