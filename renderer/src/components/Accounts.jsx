import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [userId, setUserId] = useState(null); // <-- store userId here

  // ─── Fetch Accounts ───────────────────────────────
  const fetchAccounts = async () => {
    try {
      const uid = await fetchUser();
      if (!uid) return;

      setUserId(uid); // <-- save userId into state

      const res = await window.accountAPI.getAll(uid);
      if (res.success) {
        setAccounts(res.accounts);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchUser = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) return user._id;
    return null;
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ─── Create Account ───────────────────────────────
  const handleCreate = async () => {
    if (!name || !balance) return alert("Please fill all fields");
    if (!userId) return alert("User not found. Please log in again.");

    try {
      const res = await window.accountAPI.create({
        userId,
        name,
        balance: Number(balance),
      });
      if (res.success) {
        setShowModal(false);
        setName("");
        setBalance("");
        fetchAccounts(); // auto-refresh
      } else {
        alert(res.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Error creating account:", err);
    }
  };

  // ─── Delete Account ───────────────────────────────
  const handleDelete = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;
    try {
      const res = await window.accountAPI.delete({ accountId });
      if (res.success) {
        fetchAccounts();
      } else {
        alert(res.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  return (
    <div className="main-content pt-4 pe-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="Oswald">Accounts</h2>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> Account
        </button>
      </div>

      {/* Account Cards */}
      <div className="row">
        {accounts.length > 0 ? (
          accounts.map((acc, indx) => (
            <div className="col-md-6 mb-3" key={acc._doc._id}>
              <div className="card shadow-sm p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-2 Oswald">
                    {acc._doc.name?.toUpperCase()}
                  </h5>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(acc._doc._id)}
                  />
                </div>
                <p
                  className={`mt-2 mb-0 Oswald ${
                    acc._doc.balance < 0 ? "text-danger" : "text-success"
                  }`}
                >
                  Balance: {acc._doc.balance} PKR
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No accounts found.</p>
        )}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>

          {/* Modal */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">Add Account</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Account Name"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase())}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Initial Balance"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-dark" onClick={handleCreate}>
                    Save Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Account;
