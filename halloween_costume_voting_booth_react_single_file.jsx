import React, { useEffect, useState } from "react";

// Single-file React component: Mobile-first voting booth for one iPhone device.
// Features implemented per your choices:
// - Names: Isa, Kira, Elli, Jessa, Serena
// - Single device (localStorage) - no backend
// - Tap a name -> confirmation modal -> optional short comment -> record vote
// - All votes persisted to localStorage
// - Export to Excel (.xlsx) using SheetJS (CDN) if available; falls back to CSV
// - Simple, high-contrast, iPhone-friendly layout using Tailwind classes

const NAMES = ["Isa", "Kira", "Elli", "Jessa", "Serena"];
const STORAGE_KEY = "halloween-vote-booth-single-device";

export default function VotingBoothSingleDevice() {
  const [votes, setVotes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [pendingChoice, setPendingChoice] = useState(null); // {name}
  const [showConfirm, setShowConfirm] = useState(false);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  }, [votes]);

  // utility to get timestamp string
  function nowTimestamp() {
    const d = new Date();
    // YYYY-MM-DD HH:MM:SS
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`;
  }

  function startVote(name) {
    setPendingChoice({ name });
    setComment("");
    setShowConfirm(true);
  }

  function confirmVote() {
    if (!pendingChoice) return;
    const entry = {
      timestamp: nowTimestamp(),
      vote: pendingChoice.name,
      comment: comment ? String(comment).slice(0, 140) : "", // short comment max 140 chars
    };
    setVotes((s) => [...s, entry]);
    setShowConfirm(false);
    setPendingChoice(null);
  }

  function cancelConfirm() {
    setShowConfirm(false);
    setPendingChoice(null);
    setComment("");
  }

  function downloadCSV(filename = "votes.csv") {
    if (!votes || votes.length === 0) return;
    const header = ["Timestamp", "Vote", "Comment"];
    const rows = votes.map((v) => [v.timestamp, v.vote, v.comment || ""]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportToExcel() {
    if (!votes || votes.length === 0) return;
    // Try to use SheetJS (XLSX) if available. If not, attempt to load it from CDN.
    async function ensureXLSX() {
      if (window.XLSX) return window.XLSX;
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        s.onload = () => resolve(window.XLSX);
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    }

    try {
      const XLSX = await ensureXLSX();
      const ws_data = [["Timestamp", "Vote", "Comment"], ...votes.map((v) => [v.timestamp, v.vote, v.comment || ""])];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Votes");
      XLSX.writeFile(wb, "halloween_votes.xlsx");
    } catch (e) {
      // fallback to CSV if loading fails
      console.warn("XLSX failed, falling back to CSV export", e);
      downloadCSV("halloween_votes.csv");
    }
  }

  function resetAll() {
    if (!confirm("Reset all recorded votes? This will permanently delete the local history.")) return;
    setVotes([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  // quick totals for UI
  const totals = NAMES.reduce((acc, name) => {
    acc[name] = votes.filter((v) => v.vote === name).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
        <header className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Live Costume Vote (Booth)</h1>
              <p className="text-sm text-gray-300 mt-1">You are the booth — hand your phone to voters. Tap a name, confirm, add a short comment (optional).</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Total votes</div>
              <div className="text-lg font-medium">{votes.length}</div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {NAMES.map((n) => (
              <button
                key={n}
                onClick={() => startVote(n)}
                className="rounded-xl p-4 flex flex-col items-start gap-2 text-left transform transition-shadow bg-white/3 hover:bg-white/5"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-lg bg-white/6 flex items-center justify-center text-2xl">🎭</div>
                  <div className="flex-1">
                    <div className="font-semibold text-base sm:text-lg">{n}</div>
                    <div className="text-xs text-gray-300">Tap to vote for {n}</div>
                  </div>
                  <div className="text-sm text-gray-200 font-medium">{totals[n] ?? 0}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={() => exportToExcel()}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 shadow-md text-sm font-semibold"
            >
              Export to Excel
            </button>
            <button
              onClick={resetAll}
              className="w-12 h-12 rounded-xl bg-white/6 flex items-center justify-center text-sm text-white/90"
              aria-label="Reset"
            >
              ⟳
            </button>
          </div>

          <section className="pt-2 pb-4">
            <h2 className="text-sm font-semibold mb-2">Recent votes</h2>
            <div className="space-y-2 max-h-40 overflow-auto pr-2">
              {votes.length === 0 && <div className="text-xs text-gray-400">No votes yet — be the first!</div>}
              {votes
                .slice()
                .reverse()
                .map((v, i) => (
                  <div key={`${v.timestamp}-${i}`} className="flex items-start gap-3">
                    <div className="w-8 text-xl">🎯</div>
                    <div className="flex-1 text-sm">
                      <div className="flex justify-between">
                        <div className="font-medium">{v.vote}</div>
                        <div className="text-gray-300 text-[12px]">{v.timestamp}</div>
                      </div>
                      {v.comment && <div className="text-xs text-gray-400 mt-1">"{v.comment}"</div>}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <footer className="pt-2 pb-1 text-center text-xs text-gray-400">
            <div>Made for single-device use. Export as Excel at any time. Comments are optional and anonymous.</div>
          </footer>
        </main>
      </div>

      {/* Confirm modal (simple) */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelConfirm} />
          <div className="pointer-events-auto w-full max-w-md bg-white/6 rounded-2xl p-4 shadow-lg">
            <div className="mb-2">
              <div className="text-sm text-gray-200">Confirm vote for</div>
              <div className="text-xl font-semibold">{pendingChoice?.name}</div>
            </div>
            <label className="text-xs text-gray-300">Add a short comment (optional)</label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Loved the cape — optional"
              className="w-full mt-2 p-2 rounded-lg bg-white/5 text-sm outline-none"
              maxLength={140}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={cancelConfirm} className="flex-1 py-2 rounded-xl bg-white/4">
                Cancel
              </button>
              <button onClick={confirmVote} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
