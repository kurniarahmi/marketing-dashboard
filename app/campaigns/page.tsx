"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, BarChart3, FileText, Users, Lightbulb, Settings, LogOut, 
  Bell, Download, ChevronDown, Search, AlertCircle, PauseCircle, SlidersHorizontal,
  ChevronRight, Expand, Zap
} from 'lucide-react';

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter States
  const [activePlatform, setActivePlatform] = useState("All");
  const [activeTerritory, setActiveTerritory] = useState("All MENA");
  const [activeFunnel, setActiveFunnel] = useState("All Stages");
  const [activeObjective, setActiveObjective] = useState("");

  // State untuk melacak baris mana yang sedang di-expand dan di-ceklis
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ "C01": true });
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({ "C01": true, "C02": true });

  // Dummy Data Induk (Bisa diganti dengan state dari Papa.parse CSV nantinya)
  const masterMatrixData = [
    {
      id: "C01", tag: "KSA_Ramadan24_Conversion_Omni", desc: "Omnichannel Retail & E-com Delivery", 
      platforms: ["Meta", "Google"], market: "KSA (SAR)", funnel: "BOFU", strategy: "Conversion Target ROAS 4.0x", 
      pacingPct: 94.2, pacingVal: "$226K", spend: "$215,400", revenue: "$926,200", roas: "4.30x", status: "Active",
      subRows: [
        { name: "AG-KSA-MadaCard-HighValue-30d", spend: "$118,200", revenue: "$498,400", roas: "4.21x", status: "High Velocity" }
      ]
    },
    {
      id: "C02", tag: "UAE_WhiteFriday_Evergreen_Retarget", desc: "Dynamic Product Ads (DPA)", 
      platforms: ["Meta DPA"], market: "UAE (AED)", funnel: "Retargeting", strategy: "Max Conversion Value", 
      pacingPct: 91.0, pacingVal: "$1.56M", spend: "$142,000", revenue: "$610,600", roas: "4.30x", status: "Active"
    },
    {
      id: "C03", tag: "GCC_TopFunnel_BrandStory_Video", desc: "Video Reach 15s Non-Skip", 
      platforms: ["TikTok", "Snap"], market: "GCC Multi (Regional)", funnel: "TOFU", strategy: "Awareness Target CPM / Reach", 
      pacingPct: 67.3, pacingVal: "$190K", spend: "$185,000", revenue: "$573,500", roas: "3.10x", status: "Scaling"
    },
    {
      id: "C04", tag: "KSA_Vision2030_NationalDay_Rush", desc: "Cross-Channel Flight", 
      platforms: ["Multi-Chan"], market: "KSA (SAR)", funnel: "BOFU", strategy: "Conversion Max Conversions", 
      pacingPct: 100, pacingVal: "Settled", spend: "$98,500", revenue: "$403,850", roas: "4.10x", status: "Completed"
    },
    {
      id: "C05", tag: "Egypt_DirectResponse_FlashSale_COD", desc: "Cash On Delivery E-Comm", 
      platforms: ["Meta", "TikTok"], market: "Egypt (EGP)", funnel: "BOFU Direct", strategy: "Target CPA $8.50", 
      pacingPct: 88.9, pacingVal: "$75K", spend: "$74,200", revenue: "$135,040", roas: "1.82x", status: "Needs Review"
    },
    {
      id: "C06", tag: "Kuwait_KNET_HighAOV_Luxury", desc: "Search & Performance Max", 
      platforms: ["Google PMax"], market: "Kuwait (KWD)", funnel: "High AOV Segment", strategy: "Target ROAS 3.8x", 
      pacingPct: 83.7, pacingVal: "$70K", spend: "$62,800", revenue: "$244,920", roas: "3.90x", status: "Active"
    }
  ];

  // LOGIKA FILTER HIDUP (Search Bar & Pill Filters)
  const filteredMatrix = useMemo(() => {
    return masterMatrixData.filter(row => {
      // Filter Text Search (Nama Campaign, Deskripsi, atau ID)
      const q = searchQuery.toLowerCase();
      const matchSearch = q === "" || 
        row.tag.toLowerCase().includes(q) || 
        row.desc.toLowerCase().includes(q) || 
        row.id.toLowerCase().includes(q);

      // Filter Platform
      const matchPlatform = activePlatform === "All" || row.platforms.some(p => p.toLowerCase().includes(activePlatform.toLowerCase().replace(' ads', '')));

      // Filter Territory/Market
      let matchTerritory = true;
      if (activeTerritory !== "All MENA") {
        const t = activeTerritory.split(" ")[0].toLowerCase(); // Ambil kata pertama, misal "KSA" dari "KSA (SAR)"
        matchTerritory = row.market.toLowerCase().includes(t);
      }

      // Filter Funnel Stage
      let matchFunnel = true;
      if (activeFunnel !== "All Stages") {
        matchFunnel = row.funnel.toLowerCase().includes(activeFunnel.toLowerCase());
      }

      // Gabungkan semua kondisi filter
      return matchSearch && matchPlatform && matchTerritory && matchFunnel;
    });
  }, [searchQuery, activePlatform, activeTerritory, activeFunnel]);

  // Handlers untuk interaksi tabel
  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRowSelect = (id: string) => {
    setSelectedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredMatrix.length) {
      setSelectedRows({}); // Deselect All
    } else {
      const allSelected: Record<string, boolean> = {};
      filteredMatrix.forEach(r => allSelected[r.id] = true);
      setSelectedRows(allSelected); // Select All yang sedang tampil
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-4 flex justify-center font-sans text-gray-800">
      <div className="w-full max-w-[1400px] bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-sm border border-gray-200/60 flex gap-6">
        
        {/* Left Floating Sidebar */}
        <div className="w-16 bg-white rounded-2xl flex flex-col items-center py-6 gap-6 shadow-sm border border-gray-100">
          <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md">
            <LayoutDashboard size={20} />
          </div>
          <div className="flex flex-col gap-6 text-gray-400 mt-2">
            <Link href="/" className="hover:text-gray-900 transition-colors"><LayoutDashboard size={20} /></Link>
            <Link href="/performance" className="hover:text-gray-900 transition-colors"><BarChart3 size={20} /></Link>
            <Link href="/campaigns" className="text-gray-900"><FileText size={20} /></Link>
            <Users size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
            <Lightbulb size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
          <div className="mt-auto flex flex-col gap-6 text-gray-400">
            <Settings size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
            <LogOut size={20} className="cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* Top Navbar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white p-2 rounded-xl shadow-sm">
                <LayoutDashboard size={18} />
              </div>
              <span className="font-bold text-lg text-gray-900">Dashboard</span>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-700 rounded-full border border-gray-200">MENA</span>
            </div>

            {/* Pill Navigation */}
            <div className="bg-gray-100/80 p-1 rounded-full flex items-center gap-1 text-xs font-medium text-gray-500 border border-gray-200/50">
              <Link href="/" className="px-4 py-1.5 rounded-full hover:text-gray-900 transition-all">Overview</Link>
              <Link href="/performance" className="px-4 py-1.5 rounded-full hover:text-gray-900 transition-all">Performance</Link>
              <Link href="/campaigns" className="px-4 py-1.5 rounded-full bg-white text-gray-900 font-bold shadow-sm">Campaigns</Link>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed">Platforms</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed">Funnel</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed">Territory</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed">Seasonality</span>
              <span className="px-4 py-1.5 rounded-full cursor-not-allowed">Creative</span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:border-gray-200 transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-200 to-amber-300 text-amber-800 text-xs flex items-center justify-center font-bold shadow-sm">
                KR
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-gray-900">Kurnia Rahmi</div>
                <div className="text-[10px] text-gray-400">Executive Admin</div>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </div>
          </div>

          {/* Title & Action Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">MENA Digital Marketing Performance</h1>
              <p className="text-xs text-gray-500 mt-0.5">Campaigns Ledger, Cross-Channel Flight Allocation, and Algorithmic Guardrails</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">
                <Bell size={16} />
              </button>
              <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 transition-all">
                <Download size={14} /> Export Flight Manifest
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Portfolio Flight Count</div>
              <div className="my-2 flex items-end gap-2">
                <div className="text-2xl font-black text-gray-900 leading-none">42 Live</div>
                <div className="text-[10px] font-semibold text-indigo-600 mb-0.5 leading-tight">of 87<br/>total</div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-semibold mt-1">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span className="text-gray-500"><span className="text-gray-900">8</span> Learning</span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span><span className="text-gray-500"><span className="text-gray-900">34</span> Completed</span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span><span className="text-gray-500"><span className="text-gray-900">3</span> Deprecated</span></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Active Flight Allocation</div>
              <div className="my-2 flex items-end gap-2">
                <div className="text-2xl font-black text-gray-900 leading-none">$2.45M</div>
                <div className="text-[10px] font-semibold text-gray-500 mb-0.5 leading-tight">Q1-Q4<br/>Capex</div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold mt-1 border-t border-gray-50 pt-2">
                <span className="text-gray-500">Deployed in 67 flights</span>
                <span className="text-gray-900">76.4% Burned</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pacing Velocity Index</div>
              <div className="my-2 flex items-end gap-2">
                <div className="text-2xl font-black text-gray-900 leading-none">+1.8%</div>
                <div className="text-[10px] font-semibold text-emerald-600 mb-0.5 leading-tight">Ahead of<br/>Schedule</div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold mt-1 border-t border-gray-50 pt-2">
                <span className="text-gray-500">Target: 100.0% variance</span>
                <span className="text-emerald-600">Optimal Momentum</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Algorithmic Rule Health</div>
              <div className="my-2 flex items-end gap-2">
                <div className="text-2xl font-black text-gray-900 leading-none">98.4%</div>
                <div className="text-[10px] font-semibold text-indigo-600 mb-0.5 leading-tight">1,240 Rules<br/>Active</div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold mt-1 border-t border-gray-50 pt-2">
                <span className="text-gray-500">Auto-guardrails active</span>
                <span className="text-gray-900">2 Flags Isolated</span>
              </div>
            </div>
          </div>

          {/* FILTER SECTION */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <div className="relative w-1/2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by campaign name, ad group ID, objective, or SKU..."
                  className="w-full bg-gray-50 border border-gray-100 pl-9 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-rose-500 text-xs font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                  <PauseCircle size={14} /> Pause Underperforming
                </button>
                <button className="flex items-center gap-1.5 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                  <SlidersHorizontal size={14} /> Adjust Budget Envelope
                </button>
              </div>
            </div>

            {/* Pill Toggles */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="text-gray-400 w-20 tracking-wider">PLATFORM:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Pill label="All (5)" active={activePlatform === "All"} onClick={() => setActivePlatform("All")} />
                  <Pill label="Meta (28)" active={activePlatform === "Meta"} onClick={() => setActivePlatform("Meta")} />
                  <Pill label="Google Ads (22)" active={activePlatform === "Google"} onClick={() => setActivePlatform("Google")} />
                  <Pill label="TikTok (11)" active={activePlatform === "TikTok"} onClick={() => setActivePlatform("TikTok")} />
                  <Pill label="Snapchat (4)" active={activePlatform === "Snap"} onClick={() => setActivePlatform("Snap")} />
                  <Pill label="LinkedIn (2)" active={activePlatform === "LinkedIn"} onClick={() => setActivePlatform("LinkedIn")} />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="text-gray-400 w-20 tracking-wider">TERRITORY:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Pill label="All MENA" active={activeTerritory === "All MENA"} onClick={() => setActiveTerritory("All MENA")} />
                  <Pill label="KSA (SAR)" active={activeTerritory === "KSA"} onClick={() => setActiveTerritory("KSA")} />
                  <Pill label="UAE (AED)" active={activeTerritory === "UAE"} onClick={() => setActiveTerritory("UAE")} />
                  <Pill label="Qatar (QAR)" active={activeTerritory === "Qatar"} onClick={() => setActiveTerritory("Qatar")} />
                  <Pill label="Kuwait (KWD)" active={activeTerritory === "Kuwait"} onClick={() => setActiveTerritory("Kuwait")} />
                  <Pill label="Egypt (EGP)" active={activeTerritory === "Egypt"} onClick={() => setActiveTerritory("Egypt")} />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="text-gray-400 w-20 tracking-wider">FUNNEL STAGE:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Pill label="All Stages" active={activeFunnel === "All Stages"} onClick={() => setActiveFunnel("All Stages")} />
                  <Pill label="Awareness (TOFU)" active={activeFunnel === "TOFU"} onClick={() => setActiveFunnel("TOFU")} />
                  <Pill label="Consideration (MOFU)" active={activeFunnel === "MOFU"} onClick={() => setActiveFunnel("MOFU")} />
                  <Pill label="Conversion (BOFU)" active={activeFunnel === "BOFU"} onClick={() => setActiveFunnel("BOFU")} />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="text-gray-400 w-20 tracking-wider">OBJECTIVE:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Pill label="Target ROAS" active={activeObjective === "ROAS"} onClick={() => setActiveObjective(activeObjective === "ROAS" ? "" : "ROAS")} outlined />
                  <Pill label="Max Conversions" active={activeObjective === "MaxConv"} onClick={() => setActiveObjective(activeObjective === "MaxConv" ? "" : "MaxConv")} outlined />
                  <Pill label="Max Value" active={activeObjective === "MaxValue"} onClick={() => setActiveObjective(activeObjective === "MaxValue" ? "" : "MaxValue")} outlined />
                  <Pill label="Reach / Frequency" active={activeObjective === "Reach"} onClick={() => setActiveObjective(activeObjective === "Reach" ? "" : "Reach")} outlined />
                </div>
              </div>
            </div>
          </div>

          {/* EXECUTION MATRIX TABLE */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-extrabold text-gray-900">Live Flight Execution Matrix</h2>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{Object.keys(selectedRows).length} of {filteredMatrix.length}<br/>Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const allExpanded: Record<string, boolean> = {};
                    filteredMatrix.forEach(r => allExpanded[r.id] = true);
                    setExpandedRows(allExpanded);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Expand size={14} /> Expand All Ad Groups
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={14} /> Export Matrix
                </button>
              </div>
            </div>

            {filteredMatrix.length > 0 ? (
              <table className="w-full text-left">
                <thead className="text-[10px] text-gray-400 font-bold border-b border-gray-100">
                  <tr>
                    <th className="pb-3 w-8 px-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-indigo-600 w-3.5 h-3.5 cursor-pointer" 
                        checked={Object.keys(selectedRows).length === filteredMatrix.length && filteredMatrix.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                    </th>
                    <th className="pb-3 pl-2">Campaign & Flight Tag</th>
                    <th className="pb-3">Platform</th>
                    <th className="pb-3">Market</th>
                    <th className="pb-3">Funnel & Bidding Strategy</th>
                    <th className="pb-3 w-40">Budget Pacing</th>
                    <th className="pb-3 text-right">Spend</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">ROAS</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-50">
                  {filteredMatrix.map((row) => {
                    const isExpanded = !!expandedRows[row.id];
                    const isSelected = !!selectedRows[row.id];

                    return (
                      <React.Fragment key={row.id}>
                        {/* Main Row */}
                        <tr className="hover:bg-gray-50/50 group transition-colors">
                          <td className="py-4 px-2">
                            <input 
                              type="checkbox" 
                              className="rounded text-indigo-600 w-3.5 h-3.5 cursor-pointer" 
                              checked={isSelected} 
                              onChange={() => toggleRowSelect(row.id)} 
                            />
                          </td>
                          <td className="py-4 pr-3 pl-2">
                            <div className="flex items-start gap-1.5">
                              {/* Arrow Toggle Expand */}
                              {row.subRows ? (
                                <button onClick={() => toggleRowExpand(row.id)} className="mt-0.5 focus:outline-none hover:bg-gray-100 rounded">
                                  {isExpanded ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-400" />}
                                </button>
                              ) : (
                                <span className="w-[14px]"></span> // Spacing jika tidak ada sub-row
                              )}
                              
                              <div>
                                <div className="font-extrabold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => toggleRowExpand(row.id)}>{row.tag}</div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
                                  <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{row.id}</span>
                                  {row.desc}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {row.platforms.map((p, i) => (
                                <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  p.includes('Meta') ? 'bg-blue-50 text-blue-600' : 
                                  p.includes('Google') ? 'bg-teal-50 text-teal-700' : 
                                  p.includes('TikTok') ? 'bg-purple-50 text-purple-600' : 
                                  p.includes('Snap') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                }`}>{p}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-gray-600 text-[11px]">{row.market}</td>
                          <td className="py-4">
                            <div className="font-extrabold text-gray-900">{row.funnel}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{row.strategy}</div>
                          </td>
                          <td className="py-4 pr-5">
                            <div className="flex justify-between items-end mb-1">
                              <span className={`text-[10px] font-extrabold ${row.pacingPct >= 100 ? 'text-indigo-600' : row.pacingPct < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{row.pacingPct}%</span>
                              <span className="text-[9px] font-medium text-gray-400">{row.pacingVal}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${
                                row.pacingPct >= 100 ? 'bg-indigo-500' : 
                                row.pacingPct > 90 ? 'bg-indigo-500' : 
                                row.pacingPct < 80 ? 'bg-amber-400' : 'bg-emerald-500'
                              }`} style={{ width: `${row.pacingPct}%` }}></div>
                            </div>
                          </td>
                          <td className="py-4 text-right font-medium text-gray-600">{row.spend}</td>
                          <td className="py-4 text-right font-extrabold text-gray-900">{row.revenue}</td>
                          <td className="py-4 text-right font-bold text-emerald-600">{row.roas}</td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <StatusBadge status={row.status} />
                            </div>
                          </td>
                        </tr>

                        {/* Sub Row (Expanded View) */}
                        {isExpanded && row.subRows && row.subRows.map((sub, sIdx) => (
                          <tr key={`sub-${row.id}-${sIdx}`} className="bg-gray-50/40">
                            <td></td>
                            <td colSpan={5} className="py-3 pl-8">
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-gray-300 font-bold text-lg leading-none -mt-1">└</span>
                                <span className="font-semibold text-gray-700">{sub.name}</span>
                                <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Ad Set</span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-[11px] font-medium text-gray-500">{sub.spend}</td>
                            <td className="py-3 text-right text-[11px] font-bold text-gray-700">{sub.revenue}</td>
                            <td className="py-3 text-right text-[11px] font-bold text-emerald-600">{sub.roas}</td>
                            <td className="py-3 flex justify-center text-[10px] text-gray-500 font-medium italic">{sub.status}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm font-medium">
                No campaigns match the selected filters.
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
              <div className="text-[11px] text-gray-500 font-medium">
                Showing <strong className="text-gray-900">{filteredMatrix.length}</strong> high-priority flights out of 67 registered flights. Aggregated Blended ROAS: <strong className="text-emerald-600">3.92x</strong>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                <button className="px-2 py-1 hover:text-gray-900 transition-colors">Previous</button>
                <button className="w-6 h-6 rounded-md bg-gray-100 text-gray-900 flex items-center justify-center">1</button>
                <button className="w-6 h-6 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors">2</button>
                <button className="w-6 h-6 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors">3</button>
                <span className="mx-1">...</span>
                <button className="w-6 h-6 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors">11</button>
                <button className="px-2 py-1 hover:text-gray-900 transition-colors">Next</button>
              </div>
            </div>
          </div>

          {/* Row 4: Algorithmic Directives */}
          <div className="mb-2 mt-2">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-2 text-indigo-900">
                <Zap size={18} className="fill-indigo-600 text-indigo-600" />
                <h3 className="text-[15px] font-black tracking-tight">Algorithmic Directives & Automated Intervention Queue</h3>
              </div>
              <div className="text-[10px] font-medium text-gray-400">
                Continuous Bayesian Engine • 3 Recommendations Pending Human Sign-Off
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:border-indigo-100 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wide">Capital Arbitrage</span>
                    <span className="text-[9px] text-gray-400 text-right leading-tight font-medium">Impact: +$58K Net<br/>GMV</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 mb-1.5">Under-performing CVR Arbitrage</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    Reallocate <strong className="text-gray-900"> $34K </strong> from stagnant Egypt display & COD sets (yielding 1.82x ROAS) into high-margin <strong className="text-gray-900">KSA Mada-optimized</strong> conversion sets pacing ahead at 4.21x marginal efficiency.
                  </p>
                </div>
                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-gray-50">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wide">CONFIDENCE: 94.2%</span>
                  <button className="bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-colors">
                    Execute Transfer
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col justify-between bg-gradient-to-b from-white to-rose-50/20">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1.5"><AlertCircle size={11} strokeWidth={2.5}/> Fatigue Critical</span>
                    <span className="text-[9px] text-gray-400 text-right leading-tight font-medium">Freq: 5.2x<br/>Ceiling</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 mb-1.5">Creative Fatigue Warning</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    4 ad sets in <strong className="text-gray-900">GCC BrandStory</strong> have exceeded frequency threshold of 5.2x with CPA rising by 28% week-over-week. Deploy next Creative Variant batch or broaden lookalikes to top 3%.
                  </p>
                </div>
                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-gray-50">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wide">URGENCY: HIGH</span>
                  <button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors">
                    Rotate Asset Flight
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex flex-col justify-between bg-gradient-to-b from-white to-indigo-50/30">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">Headroom Expansion</span>
                    <span className="text-[9px] text-gray-400 text-right leading-tight font-medium">Capacity:<br/>+18%</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 mb-1.5">Target ROAS Headroom</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    <strong className="text-gray-900">KSA Ramadan Omni</strong> campaign has 18% available bid headroom before hitting marginal diminishing returns. Recommend increasing daily flight budget by $12,500 during peak Iftar conversion windows.
                  </p>
                </div>
                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-gray-50">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wide">EST. RETURNS: +$42K</span>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-colors">
                    Authorize Scale
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 pb-2">
            Synthetic benchmark dataset — for educational and demonstration purposes only.
          </div>

        </div>
      </div>
    </div>
  );
}

function Pill({ label, active, onClick, outlined }: any) {
  if (outlined) {
    return (
      <button 
        onClick={onClick}
        className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
          active ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
        }`}
      >
        {label}
      </button>
    );
  }
  return (
    <button 
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm border ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes('active')) return <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>;
  if (s.includes('scaling')) return <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max border border-indigo-100"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Scaling</span>;
  if (s.includes('review')) return <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max border border-rose-100"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Needs Review</span>;
  if (s.includes('completed')) return <span className="text-[10px] font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Completed</span>;
  return <span className="text-[10px] font-extrabold text-gray-500">{status}</span>;
}