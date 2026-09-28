import React, { useState, useEffect, useCallback } from "react";
import { TOTAL_DAYS, devotionalData, getDayData } from "./src/data/devotionalData.js";

import { BookOpen, CheckCircle2, Circle, Star, ChevronLeft, ChevronRight, Sparkles, Search, X, Menu } from "lucide-react";

// ---------- Font import ----------
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Fraunces', serif; }
    .font-body { font-family: 'Inter', sans-serif; }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .medallion-shine {
      background: linear-gradient(110deg, #C9962C 20%, #F3D57C 40%, #C9962C 60%);
      background-size: 200% 100%;
      animation: shimmer 5s ease-in-out infinite;
    }
    .ribbon-notch::before {
      content: '';
      position: absolute;
      left: -1px; top: 100%;
      border-style: solid;
      border-width: 8px 10px 0 0;
      border-color: #0f2647 transparent transparent transparent;
    }
    .ribbon-notch::after {
      content: '';
      position: absolute;
      right: -1px; top: 100%;
      border-style: solid;
      border-width: 8px 0 0 10px;
      border-color: #0f2647 transparent transparent transparent;
    }
  `}</style>
);

// ---------- Reading plan data ----------
// Fully written sample days (1-10). Days 11-365 use a generated placeholder
// so the ministry team can finalize the complete yearly plan.


// ---------- Small UI pieces ----------
const Medallion = ({ day, size = 120 }) => (
  <div
    className="rounded-full flex items-center justify-center relative"
    style={{
      width: size,
      height: size,
      background: "radial-gradient(circle at 35% 30%, #F6DFA0, #C9962C 60%, #8A6415 100%)",
      boxShadow: "0 6px 20px rgba(20,33,61,0.35), inset 0 0 0 4px rgba(255,255,255,0.25)",
    }}
  >
    <div
      className="rounded-full flex flex-col items-center justify-center font-display"
      style={{
        width: size - 20,
        height: size - 20,
        background: "linear-gradient(160deg, #14213D, #1B3A6B)",
        color: "#F3D57C",
      }}
    >
      <span style={{ fontSize: size * 0.14 }} className="uppercase tracking-widest opacity-80">Day</span>
      <span style={{ fontSize: size * 0.32 }} className="font-bold leading-none">{day}</span>
    </div>
  </div>
);

const Ribbon = ({ children }) => (
  <div className="relative mx-auto" style={{ width: "fit-content" }}>
    <div
      className="ribbon-notch relative px-6 py-2 font-display font-semibold text-center"
      style={{ background: "#0f2647", color: "#F3D57C", letterSpacing: "0.05em" }}
    >
      {children}
    </div>
  </div>
);

const SectionCard = ({ title, icon, children, accent = "#C9962C" }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#EEE3C8" }}>
    <div className="flex items-center gap-2 mb-3">
      <div style={{ color: accent }}>{icon}</div>
      <h3 className="font-display font-semibold text-lg" style={{ color: "#14213D" }}>{title}</h3>
    </div>
    {children}
  </div>
);

// ---------- Main App ----------
export default function CacwolDevotional() {
  const [view, setView] = useState("home"); // home | day | navigator
  const [currentDay, setCurrentDay] = useState(1);
  const [completed, setCompleted] = useState(new Set());
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [passages, setPassages] = useState({}); // ref -> { loading, error, verses }
  const [activePassage, setActivePassage] = useState(null);

  const loadPassage = async (ref) => {
    setActivePassage(ref);
    if (passages[ref] && (passages[ref].verses || passages[ref].loading)) return;
    setPassages((prev) => ({ ...prev, [ref]: { loading: true } }));
    try {
      const apiRef = ref.trim().replace(/\s+/g, "+");
      const res = await fetch(`https://bible-api.com/${apiRef}?translation=web`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Passage not found");
      setPassages((prev) => ({
        ...prev,
        [ref]: { loading: false, verses: data.verses || [], text: data.text },
      }));
    } catch (e) {
      setPassages((prev) => ({
        ...prev,
        [ref]: { loading: false, error: "Couldn't load this passage. Check your connection and try again." },
      }));
    }
  };

  // Load persisted progress
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cacwol-progress");
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentDay(data.currentDay || 1);
        setCompleted(new Set(data.completed || []));
        setBookmarked(new Set(data.bookmarked || []));
      }
    } catch (e) {
      console.error("Could not load saved progress", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProgress = useCallback(async (next) => {
    try {
      window.localStorage.setItem(
        "cacwol-progress",
        JSON.stringify({
          currentDay: next.currentDay ?? currentDay,
          completed: Array.from(next.completed ?? completed),
          bookmarked: Array.from(next.bookmarked ?? bookmarked),
        })
      );
    } catch (e) {
      console.error("Could not save progress", e);
    }
  }, [currentDay, completed, bookmarked]);

  const goToDay = (day) => {
    setCurrentDay(day);
    setView("day");
    saveProgress({ currentDay: day });
  };

  const toggleComplete = (day) => {
    const next = new Set(completed);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setCompleted(next);
    saveProgress({ completed: next });
  };

  const toggleBookmark = (day) => {
    const next = new Set(bookmarked);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setBookmarked(next);
    saveProgress({ bookmarked: next });
  };

  const dayData = getDayData(currentDay);
  const progressPct = Math.round((completed.size / TOTAL_DAYS) * 100);

  const filteredDays = searchQuery
    ? Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => {
        if (String(d).includes(searchQuery)) return true;
        const data = devotionalData[d];
        if (!data) return false;
        return (
          data.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.reading.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF5E9" }}>
        <FontStyle />
        <div className="font-body text-sm" style={{ color: "#8A6415" }}>Loading your devotional...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body" style={{ background: "#FAF5E9" }}>
      <FontStyle />

      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: "#14213D", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center medallion-shine"
            style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.3)" }}
          >
            <BookOpen size={16} color="#14213D" />
          </div>
          <span className="font-display font-semibold text-sm sm:text-base" style={{ color: "#F3D57C" }}>
            Cacwol Prayer Network
          </span>
        </button>
        <button
          onClick={() => setView(view === "navigator" ? "home" : "navigator")}
          className="p-2 rounded-lg"
          aria-label="Browse all days"
        >
          {view === "navigator" ? <X size={20} color="#F3D57C" /> : <Menu size={20} color="#F3D57C" />}
        </button>
      </header>

      {/* HOME VIEW */}
      {view === "home" && (
        <main className="max-w-md mx-auto px-5 py-8 flex flex-col items-center text-center gap-5">
          <p className="font-display italic text-sm" style={{ color: "#8A6415" }}>
            Read the Word. Walk in Victory.
          </p>

          <Medallion day={currentDay} size={140} />

          <div className="w-full">
            <div className="flex justify-between text-xs font-body mb-1" style={{ color: "#14213D" }}>
              <span>{completed.size} of {TOTAL_DAYS} days</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "#EEE3C8" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #C9962C, #F3D57C)" }}
              />
            </div>
          </div>

          <button
            onClick={() => goToDay(currentDay)}
            className="w-full py-3.5 rounded-xl font-display font-semibold text-base"
            style={{ background: "#1B3A6B", color: "#F3D57C" }}
          >
            {completed.has(currentDay) ? "Revisit Today's Devotional" : "Start Today's Devotional"}
          </button>

          <div className="flex gap-3 w-full">
            <button
              disabled={currentDay <= 1}
              onClick={() => setCurrentDay((d) => Math.max(1, d - 1))}
              className="flex-1 py-2.5 rounded-xl border font-body text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              style={{ borderColor: "#C9962C", color: "#14213D" }}
            >
              <ChevronLeft size={16} /> Prev Day
            </button>
            <button
              disabled={currentDay >= TOTAL_DAYS}
              onClick={() => setCurrentDay((d) => Math.min(TOTAL_DAYS, d + 1))}
              className="flex-1 py-2.5 rounded-xl border font-body text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              style={{ borderColor: "#C9962C", color: "#14213D" }}
            >
              Next Day <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setView("navigator")}
            className="text-sm underline font-body"
            style={{ color: "#1B3A6B" }}
          >
            Browse all 365 days
          </button>
        </main>
      )}

      {/* NAVIGATOR VIEW */}
      {view === "navigator" && (
        <main className="max-w-md mx-auto px-5 py-6">
          <h2 className="font-display font-semibold text-xl mb-4" style={{ color: "#14213D" }}>All Days</h2>

          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white border" style={{ borderColor: "#EEE3C8" }}>
            <Search size={16} color="#8A6415" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by day number or keyword"
              className="w-full outline-none text-sm font-body bg-transparent"
            />
          </div>

          {searchQuery ? (
            <div className="flex flex-col gap-2">
              {filteredDays.length === 0 && (
                <p className="text-sm font-body" style={{ color: "#8A6415" }}>No matching days found.</p>
              )}
              {filteredDays.map((d) => (
                <button
                  key={d}
                  onClick={() => goToDay(d)}
                  className="text-left px-4 py-3 rounded-xl bg-white border flex items-center justify-between"
                  style={{ borderColor: "#EEE3C8" }}
                >
                  <span className="font-body text-sm" style={{ color: "#14213D" }}>
                    <strong>Day {d}</strong>{devotionalData[d] ? ` — ${devotionalData[d].focus}` : ""}
                  </span>
                  {completed.has(d) && <CheckCircle2 size={16} color="#C9962C" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => goToDay(d)}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-body font-medium relative"
                  style={{
                    background: completed.has(d) ? "#1B3A6B" : "#fff",
                    color: completed.has(d) ? "#F3D57C" : "#14213D",
                    border: `1px solid ${d === currentDay ? "#C9962C" : "#EEE3C8"}`,
                    borderWidth: d === currentDay ? 2 : 1,
                  }}
                >
                  {d}
                  {bookmarked.has(d) && (
                    <Star size={9} fill="#C9962C" color="#C9962C" className="absolute top-0.5 right-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {/* DAY VIEW */}
      {view === "day" && (
        <main className="max-w-md mx-auto px-5 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView("home")}
              className="text-sm font-body flex items-center gap-1"
              style={{ color: "#1B3A6B" }}
            >
              <ChevronLeft size={16} /> Home
            </button>
            <button onClick={() => toggleBookmark(currentDay)} aria-label="Bookmark this day">
              <Star
                size={20}
                fill={bookmarked.has(currentDay) ? "#C9962C" : "none"}
                color="#C9962C"
              />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <Medallion day={currentDay} size={90} />
            <Ribbon>{dayData.focus}</Ribbon>
          </div>

          {dayData.placeholder ? (
            <div className="bg-white rounded-2xl p-6 text-center border" style={{ borderColor: "#EEE3C8" }}>
              <Sparkles size={22} color="#C9962C" className="mx-auto mb-2" />
              <p className="font-body text-sm" style={{ color: "#14213D" }}>
                This day's full devotional is being written by the ministry team. The reading plan slot is reserved — check back soon.
              </p>
            </div>
          ) : (
            <>
              <SectionCard title="Today's Reading" icon={<BookOpen size={18} />}>
                <p className="text-xs font-body mb-2" style={{ color: "#8A6415" }}>Tap a passage to read it right here.</p>
                <ul className="flex flex-col gap-1.5">
                  {dayData.reading.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => loadPassage(r)}
                        className="w-full text-left text-sm font-body px-3 py-2.5 rounded-lg flex items-center justify-between"
                        style={{ background: "#FAF5E9", color: "#14213D" }}
                      >
                        <span>{r}</span>
                        <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: "#C9962C" }}>Read →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Exhortation" icon={<Sparkles size={18} />}>
                <p className="text-sm leading-relaxed font-body" style={{ color: "#333" }}>{dayData.exhortation}</p>
              </SectionCard>

              <SectionCard title="Live It Out" icon={<CheckCircle2 size={18} />}>
                <ol className="flex flex-col gap-2">
                  {dayData.liveItOut.map((step, i) => (
                    <li key={i} className="text-sm font-body flex gap-2" style={{ color: "#333" }}>
                      <span className="font-display font-semibold shrink-0" style={{ color: "#C9962C" }}>{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </SectionCard>

              <SectionCard title="Prayer Points" icon={<Circle size={18} />}>
                <ol className="flex flex-col gap-2">
                  {dayData.prayerPoints.map((p, i) => (
                    <li key={i} className="text-sm font-body flex gap-2" style={{ color: "#333" }}>
                      <span className="font-display font-semibold shrink-0" style={{ color: "#1B3A6B" }}>{i + 1}.</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </SectionCard>

              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: "linear-gradient(160deg, #14213D, #1B3A6B)" }}
              >
                <p className="font-display italic text-sm leading-relaxed" style={{ color: "#F3D57C" }}>
                  "{dayData.encouragement}"
                </p>
              </div>
            </>
          )}

          <button
            onClick={() => toggleComplete(currentDay)}
            className="w-full py-3.5 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-2"
            style={{
              background: completed.has(currentDay) ? "#fff" : "#1B3A6B",
              color: completed.has(currentDay) ? "#1B3A6B" : "#F3D57C",
              border: completed.has(currentDay) ? "2px solid #1B3A6B" : "none",
            }}
          >
            <CheckCircle2 size={18} />
            {completed.has(currentDay) ? "Marked Complete" : "Mark Day Complete"}
          </button>

          <div className="flex gap-3 pb-6">
            <button
              disabled={currentDay <= 1}
              onClick={() => goToDay(currentDay - 1)}
              className="flex-1 py-2.5 rounded-xl border font-body text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              style={{ borderColor: "#C9962C", color: "#14213D" }}
            >
              <ChevronLeft size={16} /> Day {currentDay - 1}
            </button>
            <button
              disabled={currentDay >= TOTAL_DAYS}
              onClick={() => goToDay(currentDay + 1)}
              className="flex-1 py-2.5 rounded-xl border font-body text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              style={{ borderColor: "#C9962C", color: "#14213D" }}
            >
              Day {currentDay + 1} <ChevronRight size={16} />
            </button>
          </div>
        </main>
      )}

      {/* IN-APP PASSAGE READER */}
      {activePassage && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(20,33,61,0.6)" }}
          onClick={() => setActivePassage(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2">
              <h3 className="font-display font-semibold text-lg" style={{ color: "#14213D" }}>{activePassage}</h3>
              <button onClick={() => setActivePassage(null)} aria-label="Close passage">
                <X size={20} color="#8A6415" />
              </button>
            </div>

            {passages[activePassage]?.loading && (
              <p className="text-sm font-body" style={{ color: "#8A6415" }}>Loading passage...</p>
            )}
            {passages[activePassage]?.error && (
              <p className="text-sm font-body" style={{ color: "#B33A3A" }}>{passages[activePassage].error}</p>
            )}
            {passages[activePassage]?.verses && passages[activePassage].verses.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {passages[activePassage].verses.map((v, i) => (
                  <p key={i} className="text-sm leading-relaxed font-body" style={{ color: "#333" }}>
                    <span className="font-display font-semibold mr-1.5" style={{ color: "#C9962C" }}>{v.verse}</span>
                    {v.text.trim()}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs font-body mt-5 pt-3 border-t" style={{ color: "#8A6415", borderColor: "#EEE3C8" }}>
              World English Bible (WEB) — Public Domain
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
