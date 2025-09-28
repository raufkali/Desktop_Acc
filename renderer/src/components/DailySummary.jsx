import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const DailySummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const summaryRef = useRef(null);

  // ─── Period State: 'day' | 'month' | 'year' ───────────────────────────────
  const [period, setPeriod] = useState("day");
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [selectedDay, setSelectedDay] = useState(todayISO);
  const monthISODefault = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(monthISODefault);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // ─── Helpers ───────────────────────────────
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return (0).toFixed(decimals);
    }
    return Number(value).toFixed(decimals);
  };

  const headerText = () => {
    if (period === "day") return `Summary for: Day — ${selectedDay}`;
    if (period === "month") {
      const [y, m] = selectedMonth.split("-");
      const d = new Date(y, parseInt(m, 10) - 1);
      const label = d.toLocaleString(undefined, {
        month: "short",
        year: "numeric",
      });
      return `Summary for: Month — ${label}`;
    }
    if (period === "year") return `Summary for: Year — ${selectedYear}`;
    return "Summary";
  };

  const buildFileName = () => {
    if (period === "day") return `summary-day-${selectedDay}.png`;
    if (period === "month") return `summary-month-${selectedMonth}.png`;
    if (period === "year") return `summary-year-${selectedYear}.png`;
    return `summary-${new Date().toISOString().slice(0, 10)}.png`;
  };

  // ─── Fetch Summary ───────────────────────────────
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found!");

      // Call preload API instead of fetch()
      let date = selectedDay;
      if (period === "month") date = selectedMonth;
      if (period === "year") date = selectedYear;

      const summary = await window.summaryAPI.get(user._id, period, date);

      if (summary.error) {
        setError(summary.error || "Failed to load summary");
        setSummaryData(null);
      } else {
        setSummaryData(summary.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedDay, selectedMonth, selectedYear]);

  // ─── Save as Image ───────────────────────────────
  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, {
      scale: 2,
      backgroundColor: "#fff",
    });
    const link = document.createElement("a");
    link.download = buildFileName();
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ─── Render ───────────────────────────────
  return (
    <div className="main-content pt-4 pb-4 pe-4">
      {/* Header with controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="Oswald">Summary</h2>
        <div className="d-flex align-items-center gap-2">
          {/* Period selector */}
          <select
            className="form-select me-2"
            style={{ width: "150px" }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          {/* Inputs depending on period */}
          {period === "day" && (
            <input
              type="date"
              className="form-control me-2"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{ width: "180px" }}
            />
          )}

          {period === "month" && (
            <input
              type="month"
              className="form-control me-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: "180px" }}
            />
          )}

          {period === "year" && (
            <input
              type="number"
              className="form-control me-2"
              value={selectedYear}
              min="2000"
              max="2100"
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: "120px" }}
            />
          )}

          <button
            className="btn btn-outline-dark me-2"
            onClick={fetchSummary}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            className="btn btn-dark"
            onClick={handleDownloadImage}
            disabled={!summaryData}
          >
            Save as Image
          </button>
        </div>
      </div>

      {/* Show current selection label */}
      <div className="mb-3"></div>

      <div className="card mt-3 bg-light-dark shadow p-5 pt-4" ref={summaryRef}>
        <h4 className="Oswald  mx-auto mb-4">{headerText()}</h4>

        {error && <h6 className="text-danger">{error}</h6>}
        {!error && !summaryData && <p>Loading...</p>}
        {!error && summaryData && (
          <>
            {/* Totals */}
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Sent Balance</h5>
                    <p className="card-text fs-4 text-danger">
                      {formatNumber(summaryData.totalSend)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Received Balance</h5>
                    <p className="card-text fs-4 text-success">
                      {formatNumber(summaryData.totalReceive)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Net Balance</h5>
                    <p
                      className={`card-text fs-4 ${
                        (summaryData.netBalance || 0) < 0
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {formatNumber(summaryData.netBalance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Send Quantity</h5>
                    <p className="card-text fs-4 text-danger">
                      {summaryData.totalSendQuantity ?? 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Received Quantity</h5>
                    <p className="card-text fs-4 text-success">
                      {summaryData.totalReceiveQuantity ?? 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-light Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Net Quantity</h5>
                    <p
                      className={`card-text fs-4 ${
                        (summaryData.netQuantity || 0) < 0
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {summaryData.netQuantity ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sent Transactions */}
            {summaryData.SendTrx && summaryData.SendTrx.length > 0 && (
              <div className="mt-4 card p-4 bg-light">
                <h3 className="Oswald mb-3">Sent Transactions</h3>
                <div className="table-responsive">
                  <table className="table table-bordered border-dark">
                    <thead>
                      <tr className="table-dark">
                        <th>#</th>
                        <th>Date</th>
                        <th>Receiver</th>
                        <th>Amount</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Account</th>
                        <th>On Behalf Of</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.SendTrx.map((trx, idx) => (
                        <tr key={trx._doc._id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            {trx._doc.createdAt
                              ? new Date(trx._doc.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            {trx._doc.onBehalfOf || trx._doc.receiver || "-"}
                          </td>
                          <td>{formatNumber(trx._doc.amount)}</td>
                          <td>{trx._doc.quantity ?? 0}</td>
                          <td>{formatNumber(trx._doc.rate)}</td>
                          <td>{trx._doc.fromAccount || "-"}</td>
                          <td>{trx._doc.onBehalfOf || "-"}</td>
                          <td>{trx._doc.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Receive Transactions */}
            {summaryData.ReceiveTrx && summaryData.ReceiveTrx.length > 0 && (
              <div className="mt-4 card p-4 bg-light">
                <h3 className="Oswald mb-3">Receive Transactions</h3>
                <div className="table-responsive">
                  <table className="table border-dark table-bordered">
                    <thead>
                      <tr className="table-dark">
                        <th>#</th>
                        <th>Date</th>
                        <th>Sender</th>
                        <th>Amount</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Account</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.ReceiveTrx.map((trx, idx) => (
                        <tr key={trx._doc._id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            {trx._doc.createdAt
                              ? new Date(trx._doc.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            {trx._doc.onBehalfOf || trx._doc.receiver || "-"}
                          </td>
                          <td>{formatNumber(trx._doc.amount)}</td>
                          <td>{trx._doc.quantity ?? 0}</td>
                          <td>{formatNumber(trx._doc.rate)}</td>
                          <td>{trx._doc.fromAccount || "-"}</td>
                          <td>{trx._doc.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No transactions */}
            {summaryData.SendTrx?.length === 0 &&
              summaryData.ReceiveTrx?.length === 0 && (
                <div className="mt-4">
                  <p>No transactions found for this {period}.</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailySummary;
