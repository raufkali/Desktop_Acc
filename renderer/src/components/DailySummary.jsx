import { React, useEffect, useRef } from "react";
import { useState } from "react";
import html2canvas from "html2canvas";

const DailySummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");
  const summaryRef = useRef(null); // reference for capturing

  // ✅ Helper function to safely format numbers
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return (0).toFixed(decimals);
    }
    return Number(value).toFixed(decimals);
  };

  // Fetch Summary Data
  const fetchSummary = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found!");
      const summaryData = await window.summaryAPI.get(user?._id);
      setSummaryData(summaryData);
      if (summaryData.error) {
        setError(summaryData.error);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Function to capture and download as image
  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, {
      scale: 2, // Higher resolution
      backgroundColor: "#fff",
    });
    const link = document.createElement("a");
    link.download = "daily-summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="main-content pt-4 pb-4 pe-4">
      {/* Header with Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="Oswald">Daily Summary</h2>
        <button className="btn btn-dark" onClick={handleDownloadImage}>
          Save as Image
        </button>
      </div>

      <div className="card bg-light-dark shadow p-5" ref={summaryRef}>
        {error && <h1 className="text-danger">{error}</h1>}
        {!error && summaryData && (
          <>
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-white Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Sent Balance</h5>
                    <p className="card-text fs-4 text-danger">
                      {formatNumber(summaryData.totalSend)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-white Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Received Balance</h5>
                    <p className="card-text fs-4 text-success">
                      {formatNumber(summaryData.totalReceive)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-white Oswald h-100">
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
                <div className="card shadow-sm bg-white Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Send Quantity</h5>
                    <p className="card-text fs-4 text-danger">
                      {summaryData.totalSendQuantity ?? 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-white Oswald h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Received Quantity</h5>
                    <p className="card-text fs-4 text-success">
                      {summaryData.totalReceiveQuantity ?? 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="card shadow-sm bg-white Oswald h-100">
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
            {summaryData.SendTrx && (
              <div className="mt-4">
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
                        <tr key={trx._id}>
                          <td>{idx + 1}</td>
                          <td>
                            {trx.createdAt
                              ? new Date(trx.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td>{trx.onBehalfOf || trx.receiver || "-"}</td>
                          <td>{formatNumber(trx.amount)}</td>
                          <td>{trx.quantity ?? 0}</td>
                          <td>{formatNumber(trx.rate)}</td>
                          <td>{trx.fromAccount || "-"}</td>
                          <td>{trx.onBehalfOf || "-"}</td>
                          <td>{trx.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Receive Transactions */}
            {summaryData.ReceiveTrx && (
              <div className="mt-4">
                <h3 className="Oswald mb-3">Receive Transactions</h3>
                <div className="table-responsive">
                  <table className="table border-dark table-bordered ">
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
                        <tr key={trx._id}>
                          <td>{idx + 1}</td>
                          <td>
                            {trx.createdAt
                              ? new Date(trx.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td>{trx.onBehalfOf || trx.receiver || "-"}</td>
                          <td>{formatNumber(trx.amount)}</td>
                          <td>{trx.quantity ?? 0}</td>
                          <td>{formatNumber(trx.rate)}</td>
                          <td>{trx.fromAccount || "-"}</td>
                          <td>{trx.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailySummary;
