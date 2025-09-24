import React, { useState, useEffect } from "react";

const Ledger = () => {
  const [person, setPerson] = useState(null);
  const [error, setError] = useState("");

  // Toggles
  const [showSent, setShowSent] = useState(false);
  const [showReceived, setShowReceived] = useState(false);
  const [showDebitors, setShowDebitors] = useState(false);
  const [showCreditors, setShowCreditors] = useState(false);

  const fetchPerson = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found!");

      const personData = await window.personAPI.get(user?._id);

      if (personData.error) {
        setError(personData.error);
      } else {
        setPerson(personData.person);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPerson();
  }, []);

  return (
    <div className="main-content pt-5 pb-4 pe-4">
      <div class="card  bg-light-dark shadow p-5">
        {error && <h1 className="text-danger">{error}</h1>}

        {!error && person && (
          <>
            <h2 className="Oswald mb-4">
              Ledger for: {person.name.toUpperCase()}
            </h2>
            {/* Creditors */}
            <div className="card mb-3 overflow-hidden border-light-dark">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 Oswald">I need to Pay</h5>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={() => setShowCreditors(!showCreditors)}
                >
                  {showCreditors ? "Hide" : "Show"}
                </button>
              </div>
              {showCreditors && (
                <div className="card-body p-0">
                  {person.creditors?.length > 0 ? (
                    <table className="table table-lightt mb-0 table-bordered">
                      <thead>
                        <tr className="table-dark">
                          <th>Name</th>
                          <th>Amount</th>
                          <th>Quantity</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.creditors.map((c, index) => (
                          <tr key={index}>
                            <td>{c.name}</td>
                            <td>{c.amount}</td>
                            <td>{c.quantity}</td>
                            <td>{new Date(c.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No creditors</p>
                  )}
                </div>
              )}
            </div>
            {/* Debitors */}
            <div className="card mb-3 overflow-hidden border-light-dark">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 Oswald">Need to Pay me</h5>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={() => setShowDebitors(!showDebitors)}
                >
                  {showDebitors ? "Hide" : "Show"}
                </button>
              </div>
              {showDebitors && (
                <div className="card-body p-0">
                  {person.debitors?.length > 0 ? (
                    <table className="table table-lightt mb-0 table-bordered">
                      <thead>
                        <tr className="table-dark">
                          <th>Name</th>
                          <th>Amount</th>
                          <th>Quantity</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.debitors.map((d, index) => (
                          <tr key={index}>
                            <td>{d.name}</td>
                            <td>{d.amount}</td>
                            <td>{d.quantity}</td>
                            <td>{new Date(d.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="w-100 p-2 text-center">
                      <p>No debitors</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Sent Transactions */}
            <div className="card mb-3 overflow-hidden border-light-dark">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 Oswald">Sent Transactions</h5>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={() => setShowSent(!showSent)}
                >
                  {showSent ? "Hide" : "Show"}
                </button>
              </div>
              {showSent && (
                <div className="card-body p-0">
                  {person.transactions?.sendTrx?.length > 0 ? (
                    <table className="table table-lightt mb-0 table-bordered ">
                      <thead>
                        <tr className="table-dark">
                          <th>Receiver</th>
                          <th>Amount</th>
                          <th>Rate</th>
                          <th>Quantity</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.transactions.sendTrx.map((trx, index) => (
                          <tr key={index}>
                            {console.log(trx)}
                            <td>{trx.name}</td>
                            <td>{trx.amount}</td>
                            <td>{trx.rate}</td>
                            <td>{trx.quantity}</td>
                            <td>{new Date(trx.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No sent transactions</p>
                  )}
                </div>
              )}
            </div>

            {/* Received Transactions */}
            <div className="card  mb-3 border-light-dark overflow-hidden">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 Oswald">Received Transactions</h5>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={() => setShowReceived(!showReceived)}
                >
                  {showReceived ? "Hide" : "Show"}
                </button>
              </div>
              {showReceived && (
                <div className="card-body p-0">
                  {person.transactions?.receiveTrx?.length > 0 ? (
                    <table className="table table-lightt mb-0 table-bordered">
                      <thead>
                        <tr className="table-dark">
                          <th>Sender</th>
                          <th>Amount</th>
                          <th>Rate</th>
                          <th>Quantity</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.transactions.receiveTrx.map((trx, index) => (
                          <tr key={index}>
                            <td>{trx.name}</td>
                            <td>{trx.amount}</td>
                            <td>{trx.rate}</td>
                            <td>{trx.quantity}</td>
                            <td>{new Date(trx.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No received transactions</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ledger;
