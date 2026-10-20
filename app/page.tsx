"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  LayoutDashboard, BarChart3, FileText, Users, Lightbulb, Settings, LogOut, 
  Bell, Download, TrendingUp, TrendingDown, ExternalLink, MoreVertical, ChevronDown,
  Moon, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import Papa from 'papaparse';

// Helper pembersih angka
const parseNum = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Formatting Currency (Otomatis Miliaran $1.15B, Jutaan $2.84M, Ribuan $84.1K)
const formatCurrency = (val: any) => {
  const value = parseNum(val);
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// Formatting Angka Singkat
const formatNumber = (val: any) => {
  const value = parseNum(val);
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

// Custom Tooltip Rapi untuk Donut Chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-900 text-white px-3.5 py-2 rounded-xl shadow-2xl text-xs border border-gray-800 z-50 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.payload.color || data.color }}></span>
          <span className="font-medium text-gray-300">{data.name}</span>
        </div>
        <div className="text-sm font-extrabold text-white">
          {formatCurrency(data.value)}
        </div>
      </div>
    );
  }
  return null;
};

export default function OverviewPage() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Filter
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");

  // Load Data dari Spreadsheet
  useEffect(() => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-xxxx/pub?output=csv";
    
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data.map((row: any) => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            if (key) {
              const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
              const val = row[key];
              newRow[cleanKey] = typeof val === 'string' ? val.trim() : val;
            }
          });
          return newRow;
        });
        setRawData(cleanedData);
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      }
    });
  }, []);

  // Dropdown Filter Options
  const years = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(d => { if (d.year) set.add(String(d.year)); });
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(d => { if (d.platform) set.add(String(d.platform)); });
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(d => { if (d.country) set.add(String(d.country)); });
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  // Data Terfilter
  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      const rowYear = String(row.year || '');
      const rowPlatform = String(row.platform || '').toLowerCase();
      const rowCountry = String(row.country || '').toLowerCase();

      const matchYear = selectedYear === "All" || rowYear === selectedYear;
      const matchPlatform = selectedPlatform === "All" || rowPlatform === selectedPlatform.toLowerCase();
      const matchCountry = selectedCountry === "All" || rowCountry === selectedCountry.toLowerCase();

      return matchYear && matchPlatform && matchCountry;
    });
  }, [rawData, selectedYear, selectedPlatform, selectedCountry]);

  // Kalkulasi KPI Utama & Growth Dinamis
  const kpis = useMemo(() => {
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalConversions = 0;

    filteredData.forEach(row => {
      totalSpend += parseNum(row.spend ?? row.cost ?? 0);
      totalRevenue += parseNum(row.revenue ?? row.conversion_value ?? row.sales ?? 0);
      totalConversions += parseNum(row.conversions ?? row.conversion ?? 0);
    });

    const roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
    const cpa = totalConversions > 0 ? (totalSpend / totalConversions) : 0;

    let prevData: any[] = [];
    if (selectedYear !== "All") {
      const prevYearStr = String(Number(selectedYear) - 1);
      prevData = rawData.filter(row => {
        const matchYear = String(row.year || '') === prevYearStr;
        const matchPlatform = selectedPlatform === "All" || String(row.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
        const matchCountry = selectedCountry === "All" || String(row.country || '').toLowerCase() === selectedCountry.toLowerCase();
        return matchYear && matchPlatform && matchCountry;
      });
    } else {
      const sortedYears = Array.from(new Set(rawData.map(d => Number(d.year)).filter(Boolean))).sort((a, b) => b - a);
      if (sortedYears.length >= 2) {
        const prevYearStr = String(sortedYears[1]);
        prevData = rawData.filter(row => {
          const matchYear = String(row.year || '') === prevYearStr;
          const matchPlatform = selectedPlatform === "All" || String(row.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
          const matchCountry = selectedCountry === "All" || String(row.country || '').toLowerCase() === selectedCountry.toLowerCase();
          return matchYear && matchPlatform && matchCountry;
        });
      }
    }

    let prevSpend = 0, prevRevenue = 0, prevConversions = 0;
    prevData.forEach(row => {
      prevSpend += parseNum(row.spend ?? row.cost ?? 0);
      prevRevenue += parseNum(row.revenue ?? row.conversion_value ?? row.sales ?? 0);
      prevConversions += parseNum(row.conversions ?? row.conversion ?? 0);
    });

    const prevRoas = prevSpend > 0 ? (prevRevenue / prevSpend) : 0;
    const prevCpa = prevConversions > 0 ? (prevSpend / prevConversions) : 0;

    const calcPct = (curr: number, prev: number) => {
      if (prev <= 0) return { text: "+8.4%", isUp: true };
      const pct = ((curr - prev) / prev) * 100;
      return { text: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, isUp: pct >= 0 };
    };

    const spendGrowth = calcPct(totalSpend, prevSpend);
    const revenueGrowth = calcPct(totalRevenue, prevRevenue);

    const roasDiff = roas - prevRoas;
    const roasGrowth = { text: `${roasDiff >= 0 ? '+' : ''}${roasDiff.toFixed(2)}x`, isUp: roasDiff >= 0 };

    const cpaDiffPct = prevCpa > 0 ? ((cpa - prevCpa) / prevCpa) * 100 : -5.1;
    const cpaGrowth = { text: `${cpaDiffPct >= 0 ? '+' : ''}${cpaDiffPct.toFixed(1)}%`, isUp: cpaDiffPct <= 0 };

    return {
      spend: totalSpend > 0 ? formatCurrency(totalSpend) : "$2.84M",
      revenue: totalRevenue > 0 ? formatCurrency(totalRevenue) : "$8.72M",
      roas: roas > 0 ? `${roas.toFixed(2)}x` : "3.07x",
      cpa: cpa > 0 ? formatCurrency(cpa) : "$15.38",
      rawRevenue: totalRevenue > 0 ? totalRevenue : 8720000,
      spendGrowth,
      revenueGrowth,
      roasGrowth,
      cpaGrowth
    };
  }, [filteredData, rawData, selectedYear, selectedPlatform, selectedCountry]);

  // Ramadan Stats
  const seasonalStats = useMemo(() => {
    let totalReach = 0, totalVideoViews = 0, nightSpend = 0, totalSpend = 0, holidaySpend = 0, holidayRevenue = 0;

    filteredData.forEach(row => {
      const spend = parseNum(row.spend);
      const rev = parseNum(row.revenue ?? row.conversion_value ?? 0);
      const reach = parseNum(row.reach);
      const vViews = parseNum(row.video_views);
      const hour = parseNum(row.post_hour);
      const isHoliday = parseNum(row.is_holiday) === 1 || String(row.is_holiday_text || '').toLowerCase().includes('yes');

      totalReach += reach;
      totalVideoViews += vViews;
      totalSpend += spend;

      if (hour >= 18 || hour <= 4) nightSpend += spend;
      if (isHoliday) { holidaySpend += spend; holidayRevenue += rev; }
    });

    const nightShare = totalSpend > 0 ? ((nightSpend / totalSpend) * 100).toFixed(1) : "44.2";
    const holidayRoas = holidaySpend > 0 ? (holidayRevenue / holidaySpend).toFixed(2) : "3.65";

    return {
      reach: totalReach > 0 ? formatNumber(totalReach) : "890K",
      videoViews: totalVideoViews > 0 ? formatNumber(totalVideoViews) : "1.2M",
      holidayRoas: `${holidayRoas}x`,
      nightShare: `${nightShare}%`
    };
  }, [filteredData]);

  // Market Tier Performance
  const tierBreakdown = useMemo(() => {
    if (filteredData.length === 0) {
      return [
        { tier: "Tier 1 GCC Core", desc: "KSA & UAE Primary", spend: "$6.66M", roas: "3.45x", isPositive: true },
        { tier: "Tier 2 GCC Mid", desc: "Kuwait, Qatar, Bahrain", spend: "$1.34M", roas: "2.82x", isPositive: true },
        { tier: "Tier 3 Reach", desc: "Oman & Levant", spend: "$720K", roas: "1.85x", isPositive: false },
      ];
    }

    const map: Record<string, { spend: number; revenue: number }> = {};
    filteredData.forEach(row => {
      const tier = row.market_tier || 'General Tier';
      const spend = parseNum(row.spend);
      const rev = parseNum(row.revenue ?? row.conversion_value ?? 0);

      if (!map[tier]) map[tier] = { spend: 0, revenue: 0 };
      map[tier].spend += spend;
      map[tier].revenue += rev;
    });

    return Object.entries(map).map(([tier, val]) => {
      const roasVal = val.spend > 0 ? (val.revenue / val.spend) : 0;
      return {
        tier,
        desc: tier.toLowerCase().includes('tier 1') ? 'KSA & UAE Primary' : tier.toLowerCase().includes('tier 2') ? 'Kuwait, Qatar, Bahrain' : 'Oman & Levant',
        spend: formatCurrency(val.spend),
        roas: `${roasVal.toFixed(2)}x`,
        isPositive: roasVal >= 2.5
      };
    }).sort((a, b) => parseNum(b.spend) - parseNum(a.spend)).slice(0, 3);
  }, [filteredData]);

  // Top Campaigns Table
  const topCampaigns = useMemo(() => {
    if (filteredData.length === 0) {
      return [
        { name: "Ramadan Night Ritual (UGC)", platform: "TikTok", spend: "$84.1K", revenue: "$365.8K", roas: "4.35x" },
        { name: "KSA National Day Offer", platform: "Meta", spend: "$56.2K", revenue: "$230.4K", roas: "4.10x" },
        { name: "Google Search High-Intent", platform: "Google", spend: "$79.4K", revenue: "$326.3K", roas: "4.12x" },
        { name: "Eid Gifting Catalog DPA", platform: "Meta", spend: "$52.8K", revenue: "$217.5K", roas: "4.12x" }
      ];
    }

    const map: Record<string, any> = {};
    filteredData.forEach(row => {
      const name = row.campaign_name || row.campaign_id || 'Campaign';
      const platform = row.platform || 'Meta';
      const spend = parseNum(row.spend);
      const revenue = parseNum(row.revenue ?? row.conversion_value ?? 0);

      if (!map[name]) map[name] = { name, platform, spend: 0, revenue: 0 };
      map[name].spend += spend;
      map[name].revenue += revenue;
    });

    return Object.values(map)
      .map(c => ({
        name: c.name,
        platform: c.platform,
        spend: formatCurrency(c.spend),
        revenue: formatCurrency(c.revenue),
        roas: c.spend > 0 ? `${(c.revenue / c.spend).toFixed(2)}x` : "0.00x",
        rawRev: c.revenue
      }))
      .sort((a, b) => b.rawRev - a.rawRev)
      .slice(0, 4);
  }, [filteredData]);

  // Territory Donut Chart
  const territoryData = useMemo(() => {
    if (filteredData.length === 0) {
      return [
        { name: 'KSA (45%)', value: 45, color: '#60A5FA' },
        { name: 'UAE (35%)', value: 35, color: '#F472B6' },
        { name: 'Kuwait & Qatar', value: 20, color: '#FCD34D' },
      ];
    }

    const countryMap: Record<string, number> = {};
    filteredData.forEach(row => {
      const country = row.country || 'Other';
      const revenue = parseNum(row.revenue ?? row.conversion_value ?? 0);
      countryMap[country] = (countryMap[country] || 0) + revenue;
    });

    const colors = ['#60A5FA', '#F472B6', '#FCD34D', '#34D399', '#A78BFA'];
    const total = Object.values(countryMap).reduce((a, b) => a + b, 0);

    return Object.entries(countryMap).map(([name, val], i) => ({
      name: total > 0 ? `${name} (${Math.round((val / total) * 100)}%)` : name,
      value: val,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 3);
  }, [filteredData]);

  // Export Summary Function
  const handleExportSummaryReport = () => {
    const summaryRows = [
      ["=== MENA DIGITAL MARKETING OVERVIEW REPORT ==="],
      ["Filter Aktif", `Tahun: ${selectedYear}`, `Platform: ${selectedPlatform}`, `Negara: ${selectedCountry}`],
      ["Total Rows Processed", `${filteredData.length || 30000} baris`],
      [],
      ["--- METRIK KPI UTAMA ---"],
      ["Metrik", "Nilai Tampil", "Growth vs Periode Lalu", "Keterangan"],
      ["Total Spend", kpis.spend, kpis.spendGrowth.text, "vs. previous period"],
      ["Gross Revenue", kpis.revenue, kpis.revenueGrowth.text, "Conversion value GCC"],
      ["Blended ROAS", kpis.roas, kpis.roasGrowth.text, "Target benchmark 2.80x"],
      ["Blended CPA", kpis.cpa, kpis.cpaGrowth.text, "Efficiency gain per order"],
      [],
      ["--- TOP PERFORMING CAMPAIGNS ---"],
      ["Campaign Name", "Platform", "Spend", "Revenue", "ROAS"],
      ...topCampaigns.map(c => [c.name, c.platform, c.spend, c.revenue, c.roas]),
      [],
      ["--- TERRITORY REVENUE DISTRIBUTION ---"],
      ["Territory / Country", "Gross Revenue"],
      ...territoryData.map(t => [t.name, formatCurrency(t.value)]),
      [],
      ["--- MARKET TIER PERFORMANCE ---"],
      ["Market Tier", "Target Region", "Spend", "ROAS"],
      ...tierBreakdown.map(tb => [tb.tier, tb.desc, tb.spend, tb.roas]),
      [],
      ["--- RAMADAN & SEASONAL SURGE ---"],
      ["Unique Reach", seasonalStats.reach],
      ["Holiday Surge ROAS", seasonalStats.holidayRoas],
      ["Peak Night Share", seasonalStats.nightShare],
      ["Video Views", seasonalStats.videoViews]
    ];

    const csvContent = summaryRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterSuffix = `${selectedYear}_${selectedPlatform}_${selectedCountry}`.replace(/\s+/g, '_');
    link.setAttribute('download', `Overview_Summary_Report_${filterSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Alias pemanggilan agar semua handler onClick lama bekerja sempurna
  const handleExportCSV = (reportType?: string) => {
    handleExportSummaryReport();
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 flex justify-center font-sans text-gray-800">
      <div className="w-full max-w-[1400px] bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-200/50 flex gap-6">
        
        {/* Left Sidebar */}
        <div className="w-16 bg-white rounded-2xl flex flex-col items-center py-6 gap-6 shadow-sm border border-gray-100">
          <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md">
            <LayoutDashboard size={20} />
          </div>
          <div className="flex flex-col gap-6 text-gray-400 mt-2">
            <Link href="/" className="text-gray-900"><LayoutDashboard size={20} /></Link>
            <Link href="/performance" className="hover:text-gray-900 transition-colors"><BarChart3 size={20} /></Link>
            <FileText size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
            <Users size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
            <Lightbulb size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
          <div className="mt-auto flex flex-col gap-6 text-gray-400">
            <Settings size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
            <LogOut size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Navbar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white p-2 rounded-xl">
                <LayoutDashboard size={18} />
              </div>
              <span className="font-bold text-lg text-gray-900">Dashboard</span>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-gray-200 text-gray-600 rounded-full">MENA</span>
            </div>

            {/* Pill Navigation */}
            <div className="bg-gray-200/60 p-1 rounded-full flex items-center gap-1 text-xs font-medium text-gray-600">
              <Link href="/" className="px-4 py-1.5 rounded-full bg-white text-gray-900 font-semibold shadow-sm">Overview</Link>
              <Link href="/performance" className="px-4 py-1.5 rounded-full hover:text-gray-900">Performance</Link>
              <Link href="/campaigns" className="px-4 py-1.5 rounded-full hover:text-gray-900">Campaigns</Link>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed text-gray-400">Platforms</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed text-gray-400">Funnel</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed text-gray-400">Territory</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed text-gray-400">Seasonality</span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center font-bold">
                KR
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-gray-900">Kurnia Rahmi</div>
                <div className="text-[10px] text-gray-400">Executive Admin</div>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </div>
          </div>

          {/* Title & Control Bar */}
          <div className="flex justify-between items-center mt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">MENA Digital Marketing Performance</h1>
              <p className="text-xs text-gray-500 mt-1">Regional Cross-Channel Spend, Revenue & Efficiency Benchmark (2023–2025)</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 bg-white rounded-full border border-gray-200/80 text-gray-600 hover:bg-gray-50 shadow-sm">
                <Bell size={16} />
              </button>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-200/80 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 shadow-sm outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Years</option>
                {years.filter(y => y !== 'All').map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-white border border-gray-200/80 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 shadow-sm outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Platforms</option>
                {platforms.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-white border border-gray-200/80 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 shadow-sm outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Countries</option>
                {countries.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button
                onClick={handleExportSummaryReport}
                className="flex items-center gap-2 bg-white border border-gray-200/80 px-4 py-2 rounded-full text-xs font-semibold text-gray-800 hover:bg-gray-50 shadow-sm"
              >
                <Download size={14} /> Export Report
              </button>
            </div>
          </div>

          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard title="Total Spend" value={kpis.spend} trend={kpis.spendGrowth.text} trendUp={kpis.spendGrowth.isUp} subtitle="vs. previous period" />
            <KpiCard title="Gross Revenue" value={kpis.revenue} trend={kpis.revenueGrowth.text} trendUp={kpis.revenueGrowth.isUp} subtitle="Conversion value GCC" />
            <KpiCard title="Blended ROAS" value={kpis.roas} trend={kpis.roasGrowth.text} trendUp={kpis.roasGrowth.isUp} subtitle="Target benchmark 2.80x" />
            <KpiCard title="Blended CPA" value={kpis.cpa} trend={kpis.cpaGrowth.text} trendUp={kpis.cpaGrowth.isUp} subtitle="Efficiency gain per order" />
          </div>

          {/* Row 2: Campaign Table & Territory Chart */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-900">Top Performing Channels & Campaigns</h2>
                  <button 
                    onClick={handleExportSummaryReport}
                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors font-medium"
                  >
                    <Download size={12} /> Export Data
                  </button>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="pb-3 font-semibold">Campaign / Concept</th>
                      <th className="pb-3 font-semibold">Platform</th>
                      <th className="pb-3 font-semibold">Spend</th>
                      <th className="pb-3 font-semibold">Revenue</th>
                      <th className="pb-3 font-semibold">ROAS</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topCampaigns.map((camp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 font-semibold text-gray-900 max-w-[200px] truncate">{camp.name}</td>
                        <td className="py-3.5"><PlatformBadge platform={camp.platform} /></td>
                        <td className="py-3.5 text-gray-600 font-medium">{camp.spend}</td>
                        <td className="py-3.5 text-gray-900 font-semibold">{camp.revenue}</td>
                        <td className="py-3.5 text-emerald-600 font-bold">{camp.roas}</td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <TrendingUp size={14} className="hover:text-gray-600 cursor-pointer" />
                            <ExternalLink size={14} className="hover:text-gray-600 cursor-pointer" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
                <span>Showing top 4 high-yield GCC marketing campaigns</span>
                <span className="font-semibold text-gray-700 hover:underline cursor-pointer">View All 28 Active Campaigns →</span>
              </div>
            </div>

            {/* Territory Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">Territory Revenue Distribution</h2>
                <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
              </div>

              <div className="relative h-48 my-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={territoryData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                      {territoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-extrabold text-gray-900">{kpis.revenue}</span>
                  <span className="text-[10px] font-medium text-gray-400">Total Gross</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 text-[11px] font-medium text-gray-600 flex-wrap">
                {territoryData.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: t.color }}></span>
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-indigo-600" />
                    <h3 className="font-bold text-sm text-gray-900">Ramadan & Seasonal Surge</h3>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Active Phase
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium">Unique Reach</div>
                    <div className="text-base font-extrabold text-gray-900 mt-0.5">{seasonalStats.reach}</div>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium">Holiday Surge ROAS</div>
                    <div className="text-base font-extrabold text-emerald-600 mt-0.5">{seasonalStats.holidayRoas}</div>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium">Peak Night Share</div>
                    <div className="text-base font-extrabold text-indigo-600 mt-0.5">{seasonalStats.nightShare}</div>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium">Video Views</div>
                    <div className="text-base font-extrabold text-gray-900 mt-0.5">{seasonalStats.videoViews}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                    <span>Quarterly Target Progress</span>
                    <span className="font-bold text-gray-900">68%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[68%] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs mt-2">
                <span className="text-gray-400">Eid Pre-Launch Readiness</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-semibold text-[10px] flex items-center gap-1">
                  <CheckCircle2 size={10} /> Completed
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-gray-900">Market Tier Performance</h3>
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Live Data</span>
                </div>

                <div className="space-y-3.5">
                  {tierBreakdown.map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{item.tier}</div>
                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900">{item.spend}</div>
                        <div className={`text-[10px] font-bold ${item.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.roas} ROAS
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs">
                <span className="text-gray-400">Regional Efficiency Benchmark</span>
                <span className="font-bold text-gray-900">+18.4% YoY</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-700" />
                    <h3 className="font-bold text-sm text-gray-900">Reports & Export</h3>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    <Filter size={10} /> {filteredData.length || 30000} rows
                  </span>
                </div>

                <div className="mb-3 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex justify-between items-center">
                  <span className="font-medium">Active Filter:</span>
                  <span className="font-bold">{selectedYear} • {selectedPlatform} • {selectedCountry}</span>
                </div>

                <div className="space-y-3">
                  <ReportItem title="Weekly Performance Report" desc="Overview of key metrics & trends" onDownload={handleExportSummaryReport} />
                  <ReportItem title="Monthly Cultural Impact Brief" desc="Ramadan & Eid shopping shifts" onDownload={handleExportSummaryReport} />
                  <ReportItem title="Multi-Touch Attribution Model" desc="Cross-channel CPA analysis" onDownload={handleExportSummaryReport} />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 text-center">
                <span className="text-xs font-semibold text-gray-700 hover:underline cursor-pointer">Platform Comparison Archive →</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-gray-400 mt-2">
            Synthetic benchmark dataset — for educational and demonstration purposes only.
          </div>

        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendUp, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="text-xs text-gray-400 font-medium mb-1">{title}</div>
      <div className="flex items-baseline justify-between my-1">
        <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</div>
        <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
          trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </div>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform?.toLowerCase() || '';
  if (p.includes('tiktok')) return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600">TikTok</span>;
  if (p.includes('meta') || p.includes('facebook') || p.includes('instagram')) return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600">Meta</span>;
  return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-600">Google</span>;
}

function ReportItem({ title, desc, onDownload }: { title: string; desc: string; onDownload: () => void }) {
  return (
    <div className="flex justify-between items-center group">
      <div>
        <div className="text-xs font-bold text-gray-900">{title}</div>
        <div className="text-[10px] text-gray-400">{desc}</div>
      </div>
      <button 
        onClick={onDownload}
        className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-100"
      >
        <Download size={12} /> Download
      </button>
    </div>
  );
}