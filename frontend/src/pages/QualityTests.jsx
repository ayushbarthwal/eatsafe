import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QualityTests() {
  const [tests, setTests] = useState([]);
  const [running, setRunning] = useState(false);
  const [flyIn, setFlyIn] = useState(false);

  // Filters
  const [batchFilter, setBatchFilter] = useState("");
  const [inspectorFilter, setInspectorFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [batches, setBatches] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: "asc",
  });

  const sortableFields = ["TestID", "pH", "MoisturePct", "BacteriaCount", "TestDate"];

  // INITIAL LOAD
  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);

    fetch("http://localhost:5000/api/batch")
      .then((r) => r.json())
      .then((data) => setBatches(data || []))
      .catch(() => setBatches([]));

    fetch("http://localhost:5000/api/inspector")
      .then((r) => r.json())
      .then((data) => setInspectors(data || []))
      .catch(() => setInspectors([]));

    fetchTests({});
  }, []);

  // FETCH TESTS WITH FILTERS  ⭐ UPDATED
  function fetchTests(filters) {
    const params = new URLSearchParams();
    if (filters.batchId) params.append("batchId", filters.batchId);
    if (filters.inspectorName) params.append("inspectorName", filters.inspectorName); // UPDATED
    if (filters.result) params.append("result", filters.result);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);

    fetch(`http://localhost:5000/api/quality-tests?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((t) => ({
          TestID: t.TESTID ?? t.TestID,
          BatchID: t.BATCHID ?? t.BatchID,
          BatchName: t.BATCHNAME ?? t.BatchName ?? `Batch ${t.BatchID}`,
          Inspector: t.INSPECTOR ?? t.Inspector,
          pH: t.PH,
          MoisturePct: t.MOISTUREPCT,
          Moisture: t.MOISTUREPCT !== undefined ? `${t.MOISTUREPCT}%` : "",
          BacteriaCount: t.BACTERIACOUNT,
          Result: t.RESULT ?? t.Result,
          Notes: t.NOTES ?? t.Notes,
          TestDate: t.TESTDATE ?? t.TestDate,
        }));

        setTests(formatted);
      })
      .catch(() => setTests([]));
  }

  // APPLY FILTERS  ⭐ UPDATED (inspectorName)
  function handleApplyFilters(e) {
    if (e) e.preventDefault();
    fetchTests({
      batchId: batchFilter || undefined,
      inspectorName: inspectorFilter || undefined, // UPDATED
      result: resultFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function handleClearFilters() {
    setBatchFilter("");
    setInspectorFilter("");
    setResultFilter("");
    setDateFrom("");
    setDateTo("");
    fetchTests({});
  }

  // SORTING HANDLER
  function handleSort(field) {
    if (!sortableFields.includes(field)) return;

    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function sortedTests() {
    if (!sortConfig.field) return tests;

    return [...tests].sort((a, b) => {
      let x = a[sortConfig.field];
      let y = b[sortConfig.field];

      if (sortConfig.field === "TestDate") {
        x = new Date(x);
        y = new Date(y);
      }

      if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
      if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  function runAutomatedTest() {
    setRunning(true);
    fetch("http://localhost:5000/api/run-quality-and-prediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batchFilter || 1 }),
    })
      .then((r) => r.json())
      .then(() => {
        setTimeout(() => setRunning(false), 800);
        handleApplyFilters();
      })
      .catch(() => setRunning(false));
  }

  const accent = {
    green: "#22c55e",
    red: "#ef4444",
    black: "#18122b",
    dark: "#23272f",
    white: "#fff",
  };

  function sortIcon(field) {
    if (!sortableFields.includes(field)) return null;

    const active = sortConfig.field === field;
    const arrow = active
      ? sortConfig.direction === "asc"
        ? "△"
        : "▽"
      : "△▽";

    return (
      <span className={`ml-2 text-sm ${active ? "text-green-400" : "text-gray-500"}`}>
        {arrow}
      </span>
    );
  }

  return (
    <div
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-6 text-white text-left">
        Quality Tests
      </h2>

      {/* FILTER FORM */}
      <form
        onSubmit={handleApplyFilters}
        className="w-full mb-6 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-center"
      >
        {/* Batch */}
        <select
          className="border-2 rounded-2xl p-3 text-lg text-white"
          style={{ borderColor: accent.green, background: accent.black }}
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((b) => {
            const id = b.BATCHID ?? b.BatchID;
            const label = b.Description || b.BatchName || `Batch ${id}`;
            return (
              <option key={id} value={id}>
                {label}
              </option>
            );
          })}
        </select>

        {/* Inspector */}
        <select
          className="border-2 rounded-2xl p-3 text-lg text-white"
          style={{ borderColor: accent.green, background: accent.black }}
          value={inspectorFilter}
          onChange={(e) => setInspectorFilter(e.target.value)}
        >
          <option value="">All Inspectors</option>
          {inspectors.map((ins, idx) => {
            const name = ins.NAME ?? ins.Name ?? ins.Inspector;
            return (
              <option key={idx} value={name}>
                {name}
              </option>
            );
          })}
        </select>

        {/* Result */}
        <select
          className="border-2 rounded-2xl p-3 text-lg text-white"
          style={{ borderColor: accent.green, background: accent.black }}
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
        >
          <option value="">All Results</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
        </select>

        {/* Dates */}
        <div className="flex gap-2">
          <input
            type="date"
            className="border-2 rounded-2xl p-3 text-lg text-white"
            style={{ borderColor: accent.green, background: accent.black }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="border-2 rounded-2xl p-3 text-lg text-white"
            style={{ borderColor: accent.green, background: accent.black }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl font-bold"
            style={{
              border: `2px solid ${accent.green}`,
              color: accent.green,
              background: "rgba(34,197,94,0.15)",
            }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-2xl font-bold"
            style={{
              border: `2px solid ${accent.dark}`,
              color: accent.white,
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Run Test */}
      <div className="w-full mb-8">
        <button
          className="w-full h-12 rounded-2xl font-bold text-lg shadow-lg border-2"
          style={{
            borderColor: accent.green,
            background: "rgba(34,197,94,0.08)",
            color: accent.green,
          }}
          onClick={runAutomatedTest}
          disabled={running}
        >
          {running ? "Running..." : "Run Automated Test"}
        </button>
      </div>

      {/* TABLE */}
      <div className="w-full">
        <div className="overflow-x-auto">
          <table
            className="min-w-full rounded-2xl overflow-hidden shadow-lg border-2"
            style={{
              background: accent.black,
              borderColor: accent.dark,
            }}
          >
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("TestID")}
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2 cursor-pointer"
                >
                  Test ID {sortIcon("TestID")}
                </th>

                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2">
                  Batch
                </th>

                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2">
                  Inspector
                </th>

                <th
                  onClick={() => handleSort("pH")}
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2 cursor-pointer"
                >
                  pH {sortIcon("pH")}
                </th>

                <th
                  onClick={() => handleSort("MoisturePct")}
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2 cursor-pointer"
                >
                  Moisture {sortIcon("MoisturePct")}
                </th>

                <th
                  onClick={() => handleSort("BacteriaCount")}
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2 cursor-pointer"
                >
                  Bacteria {sortIcon("BacteriaCount")}
                </th>

                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2">
                  Result
                </th>

                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2">
                  Notes
                </th>

                <th
                  onClick={() => handleSort("TestDate")}
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2 cursor-pointer"
                >
                  Date {sortIcon("TestDate")}
                </th>
              </tr>

              <tr>
                <td colSpan={9}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>

            <tbody>
              {sortedTests().map((t) => (
                <tr key={t.TestID} className="border-b" style={{ borderColor: accent.dark }}>
                  <td className="px-6 py-5 text-lg text-white font-bold">{t.TestID}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.BatchName}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.Inspector}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.pH}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.Moisture}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.BacteriaCount}</td>

                  <td className="px-6 py-5 text-lg font-bold flex items-center gap-2">
                    {String(t.Result).toLowerCase() === "pass" ? (
                      <>
                        <CheckCircle2 className="text-green-500" size={22} />
                        <span className="text-green-500">{t.Result}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={22} />
                        <span className="text-red-500">{t.Result}</span>
                      </>
                    )}
                  </td>

                  <td className="px-6 py-5 text-lg text-white">{t.Notes}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.TestDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
