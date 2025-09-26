import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import "./Dashboard.css"; // 👈 for fade-in animation

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = window.localStorage.getItem("user");
        const userId = JSON.parse(user)?._id;
        const data = await window.dashboardAPI.get(userId);
        setDashboard(data);

        // Build chart after data is loaded
        if (data.totSent?.length || data.totReceived?.length) {
          const ctx = document.getElementById("trxChart").getContext("2d");
          new Chart(ctx, {
            type: "bar",
            data: {
              labels: ["Total Sent", "Total Received"],
              datasets: [
                {
                  label: "Transactions",
                  data: [
                    data.totSent[0]?.total || 0,
                    data.totReceived[0]?.total || 0,
                  ],
                  backgroundColor: ["#f87171", "#34d399"], // red = sent, green = received
                },
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      }
    };

    fetchData();
  }, []);

  if (!dashboard) return <div>Loading Dashboard...</div>;

  return (
    <div className="main-content pt-4 pb-4 pe-4 fade-in">
      <h2 className="mb-4 Oswald-bold">Dashboard</h2>
      <div className="row">
        {/* Partners */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm ">
            <div className="card-body text-center">
              <h5 className="card-title Oswald">Partners</h5>
              <p className="card-text Oswald-bold">{dashboard.partnersCount}</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm ">
            <div className="card-body text-center">
              <h5 className="card-title Oswald">Transactions</h5>
              <p className="card-text Oswald-bold">{dashboard.trxsCount}</p>
            </div>
          </div>
        </div>

        {/* Persons */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title Oswald">Persons</h5>
              <p className="card-text Oswald-bold">{dashboard.personsCount}</p>
            </div>
          </div>
        </div>

        {/* Accounts */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title Oswald">Accounts</h5>
              <p className="card-text Oswald-bold">{dashboard.accountsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Accounts card */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm ">
            <div className="card-body">
              <h5 className="card-title Oswald">Partner Accounts</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Total Sent</th>
                      <th>Total Received</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.partnerAcc.map((p, idx) => (
                      <tr key={idx}>
                        {console.log(dashboard.partnerAcc)}
                        <td>{p.name}</td>
                        <td>{p.totalSent}</td>
                        <td>{p.totalReceived}</td>
                        <td
                          className={
                            p.profit >= 0
                              ? "text-success Oswald-bold"
                              : "text-danger Oswald-bold"
                          }
                        >
                          {p.profit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm ">
            <div className="card-body">
              <h5 className="card-title Oswald">Transactions Overview</h5>
              <canvas id="trxChart" height="100"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
