import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

const Transactions = () => {
  const [bgBlur, setBgBlur] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [trxType, setTrxType] = useState("send");
  const [form, setForm] = useState({
    sender: "",
    receiver: "",
    onBehalfOf: "",
    fromAccount: "",
    amount: "",
    rate: "",
    quantity: "",
    createdAt: "",
    note: "",
  });
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await window.api.getTransactions(user?._id);
      if (res && !res.error) {
        setTransactions(res);
      } else {
        setError(res?.error || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions");
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const data = await window.accountAPI.getAll(user?._id);
      if (data && !data.error) {
        const cleaned = (Array.isArray(data) ? data : data?.accounts || []).map(
          (acc) => ({
            _id: acc._doc?._id || acc._id,
            name: acc._doc?.name || acc.name,
          })
        );
        setAccounts(cleaned);
      } else {
        setError(data?.error || "Failed to fetch accounts");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch accounts");
    }
  };

  // Fetch partners
  const fetchPartners = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // #{ERROR HERE}
      const data = await window.partnerAPI.getAll({ userId: user?._id });
      if (data && !data.error) {
        const cleaned = (Array.isArray(data) ? data : data?.partners || []).map(
          (partner) => ({
            _id: partner._doc?._id || partner._id,
            name: partner._doc?.name || partner.name,
          })
        );
        setPartners(cleaned);
      } else {
        setError(data?.error || "Failed to fetch partners");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch partners");
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchPartners();
  }, []);

  // Close modal helper
  const closeModal = () => {
    setShowModal(false);
    setBgBlur(false);
  };

  // Reset form when opening modal
  const openModal = (type) => {
    setTrxType(type);
    setForm({
      sender: "",
      receiver: "",
      onBehalfOf: "",
      fromAccount: accounts.length > 0 ? accounts[0].name : "",
      amount: "",
      rate: "",
      quantity: "",
      createdAt: new Date().toISOString().split("T")[0],
      note: "",
    });
    setShowModal(true);
    setBgBlur(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto calculation for send transaction
    const { amount, rate, quantity } = updatedForm;

    if (quantity && rate) {
      updatedForm.amount = parseFloat(quantity) * parseFloat(rate);
    }
    // } else if (quantity && amount) {
    //   updatedForm.rate = parseFloat(quantity) / parseFloat(amount);
    // } else if (rate && amount) {
    //   updatedForm.quantity = parseFloat(rate) / parseFloat(am9ount);
    // }
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data = { ...form, trxType, userId: user?._id };
      // Auto-fill missing sender/receiver
      if (trxType === "send") {
        data.sender = user.username || user.name || "Me";
      } else if (trxType === "receive") {
        data.receiver = user.username || user.name || "Me";
      }
      const res = await window.api.createTransaction(data);
      if (res.error) {
        setError(res.error);
      } else {
        closeModal();
        fetchTransactions();
        fetchAccounts();
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
      setError("Error creating transaction");
    }
  };

  const handleDelete = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await window.api.deleteTransaction(id, user?._id);
      fetchTransactions();
      fetchAccounts();
      fetchPartners();
    } catch (err) {
      console.error(err);
      setError("Error deleting transaction");
    }
  };

  return (
    <>
      <div className={`main-content`}>
        <h1 className="Oswald mb-4 pt-4">Transactions</h1>

        {/* Create Transaction Button */}
        <button className="btn btn-dark mb-3" onClick={() => openModal("send")}>
          <FontAwesomeIcon icon={faPlus} /> Create Transaction
        </button>

        {/* Transactions Table */}
        <div className="row pe-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="table-responsive p-4">
                <h4 className="Oswald">Recent Transactions</h4>
                <table className="table table-hover table-striped border-dark border-1 mb-0 table-bordered">
                  <thead className="table-dark">
                    <tr className="Oswald text-center">
                      <th>#</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Partner</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Rate</th>
                      <th>Quantity</th>
                      <th>Note</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((trx, idx) => (
                        <tr key={trx._id}>
                          <td>{idx + 1}</td>
                          <td>
                            {trx.createdAt
                              ? new Date(trx.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td
                            className={`fw-bold ${
                              trx.trxType === "send"
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {trx.trxType}
                          </td>
                          <td>{trx.sender || "-"}</td>
                          <td>{trx.receiver || "-"}</td>
                          <td>{trx.onBehalfOf || "-"}</td>
                          <td>{trx.fromAccount || "-"}</td>
                          <td>{trx.amount || "-"}</td>
                          <td>{trx.rate || "-"}</td>
                          <td>{trx.quantity || "-"}</td>
                          <td>{trx.note || ""}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(trx._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center text-muted">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}

      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal show fade d-block ms-5"
            role="dialog"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog  modal-dialog-centered modal-lg">
              <div className="modal-content shadow border-0">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header bg-dark text-white">
                    <h4 className="modal-title Oswald">
                      Create {trxType} Transaction
                    </h4>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={closeModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Transaction Type</label>
                      <select
                        className="form-select"
                        value={trxType}
                        onChange={(e) => setTrxType(e.target.value)}
                      >
                        <option value="send">Send</option>
                        <option value="receive">Receive</option>
                      </select>
                    </div>

                    {trxType === "send" ? (
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Receiver</label>
                          <input
                            type="text"
                            name="receiver"
                            value={form.receiver}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Account</label>
                          <select
                            name="fromAccount"
                            value={form.fromAccount}
                            onChange={handleChange}
                            className="form-select"
                            required
                          >
                            {accounts.map((acc) => (
                              <option key={acc._id} value={acc.name}>
                                {acc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">On Behalf Of</label>
                          <select
                            name="onBehalfOf"
                            value={form.onBehalfOf}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="">-- None --</option>
                            {partners.length > 0 &&
                              partners.map((partner) => {
                                const name =
                                  partner._doc?.name ||
                                  partner.name ||
                                  "Unnamed Partner";
                                return (
                                  <option
                                    key={partner._doc?._id || partner._id}
                                    value={name}
                                  >
                                    {name}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Rate</label>
                          <input
                            type="number"
                            name="rate"
                            value={form.rate}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Amount</label>
                          <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Sender</label>
                          <input
                            type="text"
                            name="sender"
                            value={form.sender}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Account</label>
                          <select
                            name="fromAccount"
                            value={form.fromAccount}
                            onChange={handleChange}
                            className="form-select"
                            required
                          >
                            {accounts.map((acc) => (
                              <option key={acc._id} value={acc.name}>
                                {acc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Rate</label>
                          <input
                            type="number"
                            name="rate"
                            value={form.rate}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Amount</label>
                          <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          name="createdAt"
                          value={form.createdAt}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Note</label>
                        <textarea
                          name="note"
                          value={form.note}
                          onChange={handleChange}
                          className="form-control"
                          rows="1"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-dark">
                      Save Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Transactions;
