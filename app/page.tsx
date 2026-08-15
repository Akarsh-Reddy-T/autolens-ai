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
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  vin: string;
  serviceRecords: number;
  lastServiceMiles: number;
  firstRegistered: string;
  listings: Listing[];
  prices: number[];
};

type ServiceMilestone = {
  atMiles: number;
  title: string;
  detail: string;
  low: number;
  high: number;
};

type MaintenanceProfile = {
  annual: number[];
  classAnnual: number[];
  milestones: ServiceMilestone[];
};

type CatalogModel = {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
};

type RecallCampaign = {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Remedy?: string;
};

type CatalogVehicle = {
  year: number;
  make: string;
  model: string;
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
    vin: "2T3P1RFV•••18462",
    serviceRecords: 8,
    lastServiceMiles: 4_120,
    firstRegistered: "Jun 2021",
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
    vin: "7FARW2H5•••93108",
    serviceRecords: 7,
    lastServiceMiles: 3_740,
    firstRegistered: "Aug 2021",
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
    vin: "JM3KFBCM•••52741",
    serviceRecords: 9,
    lastServiceMiles: 2_880,
    firstRegistered: "May 2021",
    prices: [26_880, 26_610, 26_320, 25_940, 25_570, 25_190, 24_920],
    listings: [
      { id: 21, dealer: "McDonald Mazda", distance: 9, price: 23_780, miles: 46_140, badge: "Great", history: "Clean · 1 owner" },
      { id: 22, dealer: "Foothills Auto", distance: 16, price: 24_250, miles: 50_061, badge: "Good", history: "Clean · 2 owners" },
      { id: 23, dealer: "Urban Motors", distance: 24, price: 24_870, miles: 43_505, badge: "Good", history: "Clean · 1 owner" },
      { id: 24, dealer: "Red Rocks Cars", distance: 31, price: 25_490, miles: 40_220, badge: "Fair", history: "Minor damage" },
    ],
  },
};

const maintenanceProfiles: Record<VehicleKey, MaintenanceProfile> = {
  rav4: {
    annual: [820, 1_050, 1_480, 910, 1_670],
    classAnnual: [980, 1_240, 1_690, 1_160, 1_920],
    milestones: [
      { atMiles: 50_000, title: "50k-mile service", detail: "Oil, rotation and full inspection", low: 180, high: 310 },
      { atMiles: 60_000, title: "Tires and alignment", detail: "Four all-season tires installed", low: 860, high: 1_180 },
      { atMiles: 75_000, title: "Fluids and filters", detail: "Brake fluid, cabin and engine filters", low: 290, high: 460 },
    ],
  },
  crv: {
    annual: [860, 1_120, 1_560, 980, 1_810],
    classAnnual: [980, 1_240, 1_690, 1_160, 1_920],
    milestones: [
      { atMiles: 50_000, title: "Maintenance Minder service", detail: "Oil, rotation, filters and inspection", low: 190, high: 330 },
      { atMiles: 60_000, title: "CVT fluid service", detail: "Transmission fluid and inspection", low: 210, high: 340 },
      { atMiles: 65_000, title: "Tires and alignment", detail: "Four all-season tires installed", low: 880, high: 1_220 },
    ],
  },
  cx5: {
    annual: [900, 1_180, 1_640, 1_010, 1_890],
    classAnnual: [980, 1_240, 1_690, 1_160, 1_920],
    milestones: [
      { atMiles: 50_000, title: "Scheduled service", detail: "Oil, rotation, filters and inspection", low: 200, high: 350 },
      { atMiles: 60_000, title: "Tires and alignment", detail: "Four all-season tires installed", low: 900, high: 1_240 },
      { atMiles: 75_000, title: "Spark plugs and fluids", detail: "Ignition, brake fluid and inspection", low: 420, high: 680 },
    ],
  },
};

const alternatives = [
  { key: "cx5" as VehicleKey, strength: "Premium interior" },
  { key: "crv" as VehicleKey, strength: "More cargo room" },
  { key: "rav4" as VehicleKey, strength: "Strong resale value" },
];

const popularMakes = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "Genesis",
  "GMC", "Honda", "Hyundai", "INFINITI", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda",
  "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Porsche", "RAM", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const newestCatalogYear = new Date().getFullYear() + 1;
const catalogYears = Array.from({ length: newestCatalogYear - 1980 }, (_, index) => newestCatalogYear - index);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

async function fetchNhtsaModels(make: string, year: number, signal?: AbortSignal) {
  const endpoint = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const response = await fetch(endpoint, { signal });
  if (!response.ok) throw new Error("Catalog unavailable");
  const data = await response.json() as { Results?: CatalogModel[] };
  return Array.from(
    new Map((data.Results ?? []).map((item) => [`${item.Make_Name}:${item.Model_Name}`, item])).values(),
  ).sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
}

function listingForCondition(listing: Listing, condition: "new" | "used", index: number): Listing {
  if (condition === "used") return listing;
  const deliveryMiles = [18, 11, 26, 7];
  return {
    ...listing,
    price: listing.price + 10_500,
    miles: deliveryMiles[index] ?? 15,
    history: "New · 0 owners",
  };
}

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
  const [searchYear, setSearchYear] = useState(2021);
  const [catalogModels, setCatalogModels] = useState<CatalogModel[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadedCatalogKey, setLoadedCatalogKey] = useState("");
  const [catalogVehicle, setCatalogVehicle] = useState<CatalogVehicle | null>(null);
  const [catalogRecalls, setCatalogRecalls] = useState<RecallCampaign[]>([]);
  const [recallStatus, setRecallStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const catalogCache = useRef(new Map<string, CatalogModel[]>());
  const [selectedListingId, setSelectedListingId] = useState(1);
  const [zip, setZip] = useState("80206");
  const [radius, setRadius] = useState(50);
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isReliabilityOpen, setIsReliabilityOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlerted, setIsAlerted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [sort, setSort] = useState("best");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [maintenanceHorizon, setMaintenanceHorizon] = useState<1 | 3 | 5>(3);
  const [notice, setNotice] = useState("Sample market data");
  const vehicle = vehicles[vehicleKey];
  const marketListings = useMemo(
    () => vehicle.listings.map((listing, index) => listingForCondition(listing, condition, index)),
    [vehicle.listings, condition],
  );
  const selectedListing = marketListings.find((listing) => listing.id === selectedListingId) ?? marketListings[0];
  const displayYear = condition === "new" ? 2026 : vehicle.year;
  const hasReportedDamage = condition === "used" && selectedListing.history.includes("Minor");
  const ownerCount = condition === "new" ? 0 : selectedListing.history.includes("2 owners") ? 2 : 1;
  const comparisonListing = [...marketListings]
    .filter((listing) => listing.id !== selectedListing.id)
    .sort((a, b) => a.price - b.price)[0];
  const defaultValuation = useMemo(
    () => scoreValuation({
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: displayYear,
      mileage: selectedListing.miles,
      askingPrice: selectedListing.price,
      zip,
      radius,
      condition,
      accidentCount: hasReportedDamage ? 1 : 0,
    }),
    [vehicle, selectedListing, zip, radius, condition, displayYear, hasReportedDamage],
  );
  const [valuation, setValuation] = useState<ValuationResult>(() => defaultValuation);
  const [targetPrice, setTargetPrice] = useState(defaultValuation.targetPrice);
  const targetMin = Math.floor((valuation.targetPrice * 0.96) / 10) * 10;
  const targetMax = Math.ceil((Math.max(valuation.highRange, selectedListing.price) * 1.01) / 10) * 10;

  const sortedListings = useMemo(() => {
    const items = [...marketListings];
    if (sort === "price") return items.sort((a, b) => a.price - b.price);
    if (sort === "mileage") return items.sort((a, b) => a.miles - b.miles);
    return items;
  }, [marketListings, sort]);

  const makeSuggestions = useMemo(() => {
    const query = searchMake.trim().toLowerCase();
    return Array.from(new Set([...popularMakes, ...catalogModels.map((item) => item.Make_Name)]))
      .filter((make) => !query || make.toLowerCase().includes(query))
      .slice(0, 40);
  }, [catalogModels, searchMake]);

  const modelSuggestions = useMemo(() => {
    const make = searchMake.trim().toLowerCase();
    const model = searchModel.trim().toLowerCase();
    const exactMake = catalogModels.filter((item) => item.Make_Name.toLowerCase() === make);
    const pool = exactMake.length ? exactMake : catalogModels;
    return pool
      .filter((item) => !model || item.Model_Name.toLowerCase().includes(model));
  }, [catalogModels, searchMake, searchModel]);

  useEffect(() => {
    const make = searchMake.trim();
    const cacheKey = `${searchYear}:${make.toLowerCase()}`;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (make.length < 2) {
        setCatalogModels([]);
        setCatalogStatus("idle");
        setLoadedCatalogKey("");
        return;
      }

      const cached = catalogCache.current.get(cacheKey);
      if (cached) {
        setCatalogModels(cached);
        setCatalogStatus("ready");
        setLoadedCatalogKey(cacheKey);
        return;
      }

      setCatalogModels([]);
      setCatalogStatus("loading");
      setLoadedCatalogKey("");
      try {
        const unique = await fetchNhtsaModels(make, searchYear, controller.signal);
        catalogCache.current.set(cacheKey, unique);
        setCatalogModels(unique);
        setCatalogStatus("ready");
        setLoadedCatalogKey(cacheKey);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setCatalogModels([]);
        setCatalogStatus("error");
        setLoadedCatalogKey("");
      }
    }, make.length < 2 || catalogCache.current.has(cacheKey) ? 0 : 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchMake, searchYear]);

  const maintenanceForecast = useMemo(() => {
    const profile = maintenanceProfiles[vehicleKey];
    const annual = profile.annual.slice(0, maintenanceHorizon);
    const total = annual.reduce((sum, value) => sum + value, 0);
    const classTotal = profile.classAnnual.slice(0, maintenanceHorizon).reduce((sum, value) => sum + value, 0);
    const annualMiles = 11_500;
    return {
      annual,
      total,
      low: Math.round((total * 0.84) / 10) * 10,
      high: Math.round((total * 1.23) / 10) * 10,
      monthly: Math.round(total / (maintenanceHorizon * 12)),
      savings: classTotal - total,
      routine: Math.round(total * 0.47),
      wear: Math.round(total * 0.36),
      reserve: Math.round(total * 0.17),
      milestones: profile.milestones.map((item) => {
        const milesAway = Math.max(0, item.atMiles - selectedListing.miles);
        const monthsAway = Math.round((milesAway / annualMiles) * 12);
        return { ...item, timing: monthsAway <= 1 ? "Due soon" : `About ${monthsAway} months` };
      }),
    };
  }, [vehicleKey, selectedListing.miles, maintenanceHorizon]);

  async function searchMarket(event: FormEvent) {
    event.preventDefault();
    const normalizedMake = searchMake.trim().toLowerCase();
    const normalizedModel = searchModel.trim().toLowerCase();
    const requestedCatalogKey = `${searchYear}:${normalizedMake}`;
    const match = (Object.values(vehicles) as Vehicle[]).find(
      (item) => item.make.toLowerCase() === normalizedMake &&
        item.model.toLowerCase() === normalizedModel &&
        (condition === "new" ? searchYear === 2026 : item.year === searchYear),
    );
    if (match) {
      setCatalogVehicle(null);
      setCatalogRecalls([]);
      setRecallStatus("idle");
      chooseVehicle(match.key);
      setNotice(`${match.make} ${match.model} market loaded`);
      return;
    }

    let searchableCatalog = catalogModels;
    if (catalogStatus !== "ready" || loadedCatalogKey !== requestedCatalogKey || searchableCatalog.length === 0) {
      setCatalogStatus("loading");
      try {
        searchableCatalog = await fetchNhtsaModels(searchMake.trim(), searchYear);
        catalogCache.current.set(requestedCatalogKey, searchableCatalog);
        setCatalogModels(searchableCatalog);
        setCatalogStatus("ready");
        setLoadedCatalogKey(requestedCatalogKey);
      } catch {
        setCatalogStatus("error");
        setLoadedCatalogKey("");
        setNotice("The official NHTSA catalog is temporarily unavailable—please try again");
        return;
      }
    }

    const catalogMatch = searchableCatalog.find(
      (item) => item.Make_Name.toLowerCase() === normalizedMake && item.Model_Name.toLowerCase() === normalizedModel,
    ) ?? searchableCatalog.find(
      (item) => item.Make_Name.toLowerCase().includes(normalizedMake) && item.Model_Name.toLowerCase() === normalizedModel,
    );

    if (!catalogMatch) {
      setNotice(catalogStatus === "loading" ? "NHTSA catalog is still loading—try again in a moment" : "Choose a make and model from the NHTSA catalog suggestions");
      return;
    }

    const selection = {
      year: searchYear,
      make: catalogMatch.Make_Name,
      model: catalogMatch.Model_Name,
    };
    setCatalogVehicle(selection);
    setCatalogRecalls([]);
    setRecallStatus("loading");
    setNotice(`${selection.year} ${selection.make} ${selection.model} found in the NHTSA catalog`);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const params = new URLSearchParams({
        make: selection.make,
        model: selection.model,
        modelYear: String(selection.year),
      });
      const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?${params.toString()}`);
      if (!response.ok) throw new Error("Recall lookup unavailable");
      const data = await response.json() as { results?: RecallCampaign[]; Results?: RecallCampaign[] };
      setCatalogRecalls(data.results ?? data.Results ?? []);
      setRecallStatus("ready");
    } catch {
      setRecallStatus("error");
    }
  }

  async function analyzeVehicle(event?: FormEvent) {
    event?.preventDefault();
    setIsAnalyzing(true);
    const payload = {
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: displayYear,
      mileage: selectedListing.miles,
      askingPrice: selectedListing.price,
      zip,
      radius,
      condition,
      accidentCount: hasReportedDamage ? 1 : 0,
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
    const listing = listingForCondition(next.listings[0], condition, 0);
    const nextValuation = scoreValuation({
      make: next.make,
      model: next.model,
      trim: next.trim,
      year: condition === "new" ? 2026 : next.year,
      mileage: listing.miles,
      askingPrice: listing.price,
      zip,
      radius,
      condition,
    });
    setVehicleKey(key);
    setSearchMake(next.make);
    setSearchModel(next.model);
    setSearchYear(condition === "new" ? 2026 : next.year);
    setCatalogVehicle(null);
    setCatalogRecalls([]);
    setRecallStatus("idle");
    setSelectedListingId(listing.id);
    setValuation(nextValuation);
    setTargetPrice(nextValuation.targetPrice);
    setIsSaved(false);
    setIsHistoryOpen(false);
    setIsMethodologyOpen(false);
    setIsReliabilityOpen(false);
    setSort("best");
    setIsSearchOpen(false);
    setNotice(`${next.make} ${next.model} comparison loaded`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectListing(listing: Listing) {
    setSelectedListingId(listing.id);
    const nextValuation = scoreValuation({
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: displayYear,
      mileage: listing.miles,
      askingPrice: listing.price,
      zip,
      radius,
      condition,
      accidentCount: listing.history.includes("Minor") ? 1 : 0,
    });
    setValuation(nextValuation);
    setTargetPrice(nextValuation.targetPrice);
    setIsHistoryOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AutoLens home">
          <span className="brand-mark"><CarFront size={21} strokeWidth={2.4} /></span>
          <span>AutoLens<em>AI</em></span>
        </a>
        <nav className={`main-nav ${isMenuOpen ? "open" : ""}`} aria-label="Main navigation">
          <a className="active" href="#market" onClick={() => setIsMenuOpen(false)}>Market</a>
          <a href="#history" onClick={() => setIsMenuOpen(false)}>History</a>
          <a href="#alternatives" onClick={() => setIsMenuOpen(false)}>Compare</a>
          <a href="#maintenance" onClick={() => setIsMenuOpen(false)}>Ownership cost</a>
          <a href="#playbook" onClick={() => setIsMenuOpen(false)}>Buy smarter</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label={isAlerted ? "Disable price alerts" : "Enable price alerts"} onClick={() => { setIsAlerted(!isAlerted); setNotice(isAlerted ? "Price alerts paused" : "Price alerts enabled for this search"); }}><Bell size={18} fill={isAlerted ? "currentColor" : "none"} /></button>
          <button className="user-button" aria-label="Account status" onClick={() => setNotice("Demo profile active—connect authentication for saved vehicles across devices")}><span><UserRound size={16} /></span><ChevronDown size={15} /></button>
          <button className="mobile-menu" aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <div className="demo-strip">
        <span><Sparkles size={14} /> {notice}</span>
        <p>Connect licensed listing and vehicle-history providers for production decisions.</p>
        <button onClick={() => setIsSearchOpen(true)}>Data plan <ArrowRight size={13} /></button>
      </div>

      <main id="top">
        <form className="car-search-bar" onSubmit={searchMarket}>
          <div className="search-lead"><span><Search size={19} /></span><div><strong>Search any car</strong><small>Official catalog + local market</small></div></div>
          <label><span>Make</span><input list="car-make-options" value={searchMake} onChange={(event) => { setSearchMake(event.target.value); setSearchModel(""); }} placeholder="Type any make" autoComplete="off" aria-label="Car make" /><datalist id="car-make-options">{makeSuggestions.map((make) => <option value={make} key={make} />)}</datalist></label>
          <label className="model-search"><span>Model</span><input list="car-model-options" value={searchModel} onChange={(event) => setSearchModel(event.target.value)} placeholder={catalogStatus === "loading" ? "Loading models…" : "Type or choose model"} autoComplete="off" aria-label="Car model" /><datalist id="car-model-options">{modelSuggestions.map((item) => <option value={item.Model_Name} key={`${item.Make_ID}-${item.Model_ID}`} />)}</datalist><em className={`catalog-state ${catalogStatus}`}>{catalogStatus === "loading" ? "Checking NHTSA…" : catalogStatus === "ready" ? `${catalogModels.length} official matches` : catalogStatus === "error" ? "Catalog temporarily unavailable" : "Type a make to search"}</em></label>
          <label><span>Year</span><select value={searchYear} onChange={(event) => setSearchYear(Number(event.target.value))} aria-label="Model year">{catalogYears.map((year) => <option value={year} key={year}>{year}</option>)}</select></label>
          <label><span>Condition</span><select value={condition} onChange={(event) => setCondition(event.target.value as "new" | "used")} aria-label="New or used"><option value="used">Used</option><option value="new">New</option></select></label>
          <label><span>ZIP code</span><div className="compact-input"><MapPin size={14} /><input value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="Search ZIP code" /></div></label>
          <label><span>Radius</span><select value={radius} onChange={(event) => setRadius(Number(event.target.value))} aria-label="Search radius"><option value={25}>25 mi</option><option value={50}>50 mi</option><option value={100}>100 mi</option><option value={250}>250 mi</option></select></label>
          <button className="primary-button" disabled={zip.length !== 5 || !searchMake.trim() || !searchModel.trim()}><Search size={16} />Search market</button>
        </form>

        {catalogVehicle ? (
          <section className="catalog-result" aria-live="polite">
            <div className="catalog-result-heading">
              <div>
                <span className="catalog-badge"><ShieldCheck size={15} />NHTSA catalog match</span>
                <p className="section-label">NATIONAL VEHICLE CATALOG</p>
                <h1>{catalogVehicle.year} {catalogVehicle.make} {catalogVehicle.model}</h1>
                <p>We found this make and model in the official U.S. vehicle catalog. The three original vehicles are no longer the search limit.</p>
              </div>
              <div className="catalog-location"><MapPin size={16} /><span>{zip}<small>{radius}-mile market · {condition}</small></span></div>
            </div>

            <div className="catalog-readiness">
              <article><span className="catalog-signal good"><Check size={17} /></span><p><small>Make and model</small><strong>Official catalog record</strong><em>Manufacturer-submitted NHTSA data</em></p></article>
              <article><span className={`catalog-signal ${recallStatus === "error" ? "warn" : "good"}`}>{recallStatus === "loading" ? <span className="spinner dark" /> : recallStatus === "error" ? <AlertTriangle size={17} /> : <ShieldCheck size={17} />}</span><p><small>Model recall campaigns</small><strong>{recallStatus === "loading" ? "Checking NHTSA…" : recallStatus === "error" ? "Temporarily unavailable" : `${catalogRecalls.length} returned`}</strong><em>Confirm applicability using the complete VIN</em></p></article>
              <article><span className="catalog-signal warn"><CircleDollarSign size={17} /></span><p><small>Local prices and listings</small><strong>Provider connection needed</strong><em>We will not invent a market price</em></p></article>
              <article><span className="catalog-signal warn"><FileCheck2 size={17} /></span><p><small>Accident and service history</small><strong>VIN provider needed</strong><em>Unknown until a licensed report is returned</em></p></article>
            </div>

            {recallStatus === "ready" && catalogRecalls.length > 0 && (
              <div className="catalog-recalls">
                <div className="subsection-heading"><strong>Recent recall campaigns returned by NHTSA</strong><span>Model-level results, not a VIN clearance</span></div>
                <div>{catalogRecalls.slice(0, 3).map((recall, index) => <article key={recall.NHTSACampaignNumber ?? index}><span>{recall.NHTSACampaignNumber ?? `Campaign ${index + 1}`}</span><strong>{recall.Component ?? "Vehicle safety campaign"}</strong><p>{recall.Summary ?? "Open the NHTSA record for full campaign details."}</p></article>)}</div>
              </div>
            )}

            <div className="catalog-actions">
              <button className="outline-button" onClick={() => { setCatalogVehicle(null); setCatalogRecalls([]); setRecallStatus("idle"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Search size={16} />Edit search</button>
              <button className="primary-button" onClick={() => chooseVehicle("rav4")}><CarFront size={16} />Explore the full RAV4 demo</button>
            </div>
            <p className="catalog-source"><Info size={14} />Vehicle identity and recall results come from public NHTSA APIs. Accurate local pricing, title, accident, service, and maintenance data still require licensed providers.</p>
          </section>
        ) : <>
        <section className="vehicle-toolbar">
          <div>
            <div className="eyebrow"><span>{condition.toUpperCase()}</span><span className="dot" />{vehicle.body}<span className="dot" />Updated 11 min ago</div>
            <h1>{displayYear} {vehicle.make} {vehicle.model} <span>{vehicle.trim}</span></h1>
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
            <button className="text-button" onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}>{isMethodologyOpen ? "Hide calculation method" : "See how we calculated this"} <ArrowRight size={15} /></button>
            {isMethodologyOpen && <div className="method-detail"><strong>Deterministic, explainable estimate</strong><p>Starts with model MSRP and retained value, then adjusts for age, mileage, trim, ZIP region, search radius, condition, and reported damage. This demo uses modeled—not live—comparables.</p></div>}
          </article>

          <article className="card history-card" id="history">
            <div className="card-heading">
              <div><p className="section-label">VEHICLE TRUST</p><h2>History snapshot</h2></div>
              <span className={`clean-badge ${hasReportedDamage ? "review" : ""}`}>{hasReportedDamage ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{hasReportedDamage ? "Review damage" : "Low risk"}</span>
            </div>
            <div className="vin-line"><span>VIN</span><strong>{vehicle.vin}</strong><button aria-label="Vehicle information" onClick={() => setNotice("Masked demo VIN—verify the complete VIN with a licensed history provider")}><Info size={15} /></button></div>
            <div className="trust-list">
              <div><span className="trust-icon good"><Check size={17} /></span><p><strong>Clean title</strong><small>No salvage, flood, or lemon record</small></p></div>
              <div><span className={`trust-icon ${hasReportedDamage ? "alert" : "good"}`}>{hasReportedDamage ? <AlertTriangle size={17} /> : <ShieldCheck size={17} />}</span><p><strong>{hasReportedDamage ? "Minor damage reported" : "No accidents reported"}</strong><small>{hasReportedDamage ? "Inspect the event and repair quality" : "Across available demo sources"}</small></p></div>
              <div><span className="trust-icon neutral"><UserRound size={17} /></span><p><strong>{ownerCount} previous {ownerCount === 1 ? "owner" : "owners"}</strong><small>{condition === "new" ? "Factory-new demo listing" : "Personal use · Colorado"}</small></p></div>
              <div><span className="trust-icon neutral"><Wrench size={17} /></span><p><strong>{condition === "new" ? "Pre-delivery inspection" : `${vehicle.serviceRecords} service records`}</strong><small>{condition === "new" ? "Dealer preparation expected" : `Last serviced ${formatNumber(vehicle.lastServiceMiles)} miles ago`}</small></p></div>
            </div>
            <button className="outline-button full" onClick={() => setIsHistoryOpen(!isHistoryOpen)}><FileCheck2 size={16} />{isHistoryOpen ? "Hide detailed history" : "Review detailed history"}<ChevronRight size={16} /></button>
            {isHistoryOpen && <div className="history-detail">{condition === "new" ? <><div><span>Current</span><p><strong>Factory-new listing</strong>No prior-owner history expected</p></div><div><span>Delivery</span><p><strong>Inspection due</strong>Verify recall remedies and dealer preparation</p></div></> : <><div><span>{vehicle.firstRegistered}</span><p><strong>First registered</strong>Denver, CO</p></div><div><span>Jan 2024</span><p><strong>Scheduled service</strong>Dealer maintenance record</p></div>{hasReportedDamage && <div><span>Reported</span><p><strong>Minor damage event</strong>Obtain repair invoice and independent inspection</p></div>}<div><span>Apr 2026</span><p><strong>Offered for sale</strong>{selectedListing.dealer}</p></div></>}</div>}
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
              <div className="trend-summary"><strong>{formatCurrency(vehicle.fairValue + (condition === "new" ? 10_500 : 0))}</strong><span>Median list price · {radius} mi</span><p><ArrowDownRight size={16} /> Buyers have gained about <b>$710</b> of leverage since February.</p></div>
              <PriceHistory values={vehicle.prices.map((price) => price + (condition === "new" ? 10_500 : 0))} />
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
                    <span className="listing-name"><i><CarFront size={20} /></i><span><strong>{displayYear} {vehicle.make} {vehicle.model}</strong><small>{listing.dealer} · {listing.distance} mi</small></span></span>
                    <span><strong>{formatNumber(listing.miles)}</strong><small>miles</small></span>
                    <span><strong>{listing.history.split(" · ")[0]}</strong><small>{listing.history.split(" · ")[1] ?? "History available"}</small></span>
                    <span className="listing-price"><strong>{formatCurrency(listing.price)}</strong><small className={`deal-${listing.badge.toLowerCase()}`}>{listing.badge} price</small></span>
                    <span className="row-chevron"><ChevronRight size={17} /></span>
                  </button>
                ))}
              </div>
              <button className="text-button centered" onClick={() => setNotice("Live inventory pagination is ready for a licensed listings provider")}>View all 43 local listings <ArrowRight size={15} /></button>
            </article>

            <article className="card maintenance-card" id="maintenance">
              <div className="card-heading maintenance-heading">
                <div><p className="section-label">SERVICE &amp; MAINTENANCE FORECAST</p><h2>Plan the cost after you buy</h2><p>Projected from mileage, vehicle age and segment-level service patterns.</p></div>
                <div className="horizon-tabs" aria-label="Maintenance forecast period">
                  {([1, 3, 5] as const).map((years) => <button key={years} className={maintenanceHorizon === years ? "active" : ""} onClick={() => setMaintenanceHorizon(years)}>{years} yr</button>)}
                </div>
              </div>

              <div className="maintenance-summary">
                <div className="projected-total"><span>Projected total</span><strong>{formatCurrency(maintenanceForecast.total)}</strong><small>Likely range {formatCurrency(maintenanceForecast.low)}–{formatCurrency(maintenanceForecast.high)}</small></div>
                <div><span>Monthly reserve</span><strong>{formatCurrency(maintenanceForecast.monthly)}</strong><small>Set aside per month</small></div>
                <div><span>Vs. similar SUVs</span><strong className="positive">{formatCurrency(Math.max(0, maintenanceForecast.savings))} less</strong><small>Across the selected period</small></div>
              </div>

              <div className="maintenance-body">
                <div className="annual-forecast">
                  <div className="subsection-heading"><strong>Annual forecast</strong><span>Service + wear + repair reserve</span></div>
                  <div className="annual-bars">
                    {maintenanceForecast.annual.map((cost, index) => (
                      <div key={`${maintenanceHorizon}-${index}`}><span>Year {index + 1}</span><div><i style={{ width: `${Math.max(28, (cost / Math.max(...maintenanceForecast.annual)) * 100)}%` }} /></div><strong>{formatCurrency(cost)}</strong></div>
                    ))}
                  </div>
                  <div className="cost-mix">
                    <div className="subsection-heading"><strong>What the budget covers</strong><span>Not fuel, insurance or financing</span></div>
                    <div className="mix-track"><span style={{ width: "47%" }} /><span style={{ width: "36%" }} /><span style={{ width: "17%" }} /></div>
                    <div className="mix-legend"><span><i className="routine" />Routine service <strong>{formatCurrency(maintenanceForecast.routine)}</strong></span><span><i className="wear" />Wear items <strong>{formatCurrency(maintenanceForecast.wear)}</strong></span><span><i className="reserve" />Repair reserve <strong>{formatCurrency(maintenanceForecast.reserve)}</strong></span></div>
                  </div>
                </div>

                <div className="service-schedule">
                  <div className="subsection-heading"><strong>Likely upcoming service</strong><span>Based on {formatNumber(selectedListing.miles)} miles today</span></div>
                  <div className="milestone-list">
                    {maintenanceForecast.milestones.map((item) => (
                      <div key={item.title}><span className="service-icon"><Wrench size={15} /></span><p><strong>{item.title}</strong><small>{item.detail}</small><em>{item.timing}</em></p><b>{formatCurrency(item.low)}–{formatCurrency(item.high)}</b></div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="maintenance-note"><Info size={13} /><span><strong>Model-based demo estimate.</strong> Actual costs depend on condition, labor rates, service history and driving. Connect a licensed maintenance-cost dataset and the manufacturer schedule before presenting this as live vehicle-specific data.</span></p>
            </article>

            <article className="card alternatives-card" id="alternatives">
              <div className="card-heading"><div><p className="section-label">SMARTER SHORTLIST</p><h2>Smart alternatives to compare</h2></div><button className="text-button" onClick={() => setNotice("Showing every comparable model available in the demo catalog")}>Compare all <ArrowRight size={15} /></button></div>
              <div className="alternative-grid">
                {alternatives.filter((item) => item.key !== vehicleKey).map((item, index) => {
                  const option = vehicles[item.key];
                  const optionPrice = option.fairValue + (condition === "new" ? 10_500 : 0);
                  const delta = optionPrice - selectedListing.price;
                  return <button className="alternative" key={item.key} onClick={() => chooseVehicle(item.key)}>
                    <div className={`alt-visual alt-${index + 1}`}><CarFront size={46} strokeWidth={1.3} /><span>{option.reliability} reliability</span></div>
                    <div className="alt-copy"><h3>{condition === "new" ? 2026 : option.year} {option.make} {option.model} {option.trim}</h3><p>{item.strength}</p><div><strong>{formatCurrency(optionPrice)}</strong><span>{formatCurrency(Math.abs(delta))} {delta <= 0 ? "less" : "more"}</span></div></div>
                  </button>;
                })}
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
              <button className="text-button" onClick={() => setIsReliabilityOpen(!isReliabilityOpen)}>{isReliabilityOpen ? "Hide reliability report" : "Explore reliability report"} <ArrowRight size={15} /></button>
              {isReliabilityOpen && <div className="method-detail"><strong>Reliability context</strong><p>The score combines modeled repair frequency, severity, longevity, and recall count. Verify open campaigns against the complete VIN through NHTSA before purchase.</p></div>}
            </article>

            <article className="card target-card" id="playbook">
              <div className="target-heading"><span><Target size={20} /></span><div><p className="section-label">YOUR BUYING TARGET</p><h2>{formatCurrency(targetPrice)}</h2></div></div>
              <p className="target-intro">A realistic opening target based on this vehicle, local inventory, and recent price movement.</p>
              <label className="target-slider">
                <span><small>Aggressive</small><small>Easy close</small></span>
                <div className="target-adjust"><button type="button" aria-label="Decrease target price" disabled={targetPrice <= targetMin} onClick={() => setTargetPrice(Math.max(targetMin, targetPrice - 100))}>−</button><input type="range" aria-label="Negotiation target price" min={targetMin} max={targetMax} step="10" value={targetPrice} onChange={(event) => setTargetPrice(Number(event.target.value))} /><button type="button" aria-label="Increase target price" disabled={targetPrice >= targetMax} onClick={() => setTargetPrice(Math.min(targetMax, targetPrice + 100))}>+</button></div>
              </label>
              <div className="target-savings"><span>Potential savings</span><strong>{formatCurrency(Math.max(0, selectedListing.price - targetPrice))}</strong></div>
              <div className="playbook">
                <h3>Your 3-step playbook</h3>
                <ol>
                  <li><span>1</span><p><strong>Anchor with the closest comparable</strong>{comparisonListing ? `${formatCurrency(Math.abs(selectedListing.price - comparisonListing.price))} ${comparisonListing.price <= selectedListing.price ? "less" : "more"} within ${radius} miles.` : "Ask the dealer to match the local market."}</p></li>
                  <li><span>2</span><p><strong>Ask for out-the-door price</strong>Keep fees from hiding in the monthly payment.</p></li>
                  <li><span>3</span><p><strong>Time the offer</strong>Try Monday evening or the final 3 days of the month.</p></li>
                </ol>
              </div>
              <button className="primary-button full" onClick={() => { navigator.clipboard?.writeText(`I’m ready to buy today at ${formatCurrency(targetPrice)} before taxes, with no dealer add-ons. Can you send the out-the-door breakdown?`); setNotice("Negotiation script copied"); }}><Sparkles size={16} />Copy negotiation script</button>
              <p className="tiny-note">Guidance only. Taxes, fees, inspection results, and financing affect your final price.</p>
            </article>
          </aside>
        </section>
        </>}
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
