import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("");
  const [quantity, setQuantity] = useState("");
  const [userId, setUserId] = useState(null);

  // ─── Get UserId from LocalStorage ───────────────────────────────
  const fetchUser = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) return user._id;
    return null;
  };

  // ─── Fetch Partners ───────────────────────────────
  const fetchPartners = async () => {
    try {
      const uid = await fetchUser();
      if (!uid) return;

      setUserId(uid);

      const res = await window.partnerAPI.getAll({ userId: uid });
      if (res && !res.error) {
        setPartners(res);
      }
    } catch (err) {
      console.error("Error fetching partners:", err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // ─── Create Partner ───────────────────────────────
  const handleCreate = async () => {
    if (!name || !phone) return alert("Please fill all fields");
    if (!userId) return alert("User not found. Please log in again.");

    try {
      const res = await window.partnerAPI.create({
        name,
        phone: Number(phone),
        Balance: Number(balance) || 0,
        userId,
      });

      if (!res.error) {
        setShowModal(false);
        setName("");
        setPhone("");
        setBalance("");
        setQuantity("");
        fetchPartners(); // auto-refresh
      } else {
        alert(res.error || "Failed to create partner");
      }
    } catch (err) {
      console.error("Error creating partner:", err);
    }
  };

  // ─── Delete Partner ───────────────────────────────
  const handleDelete = async (partnerId) => {
    if (!window.confirm("Are you sure you want to delete this partner?"))
      return;
    try {
      const res = await window.partnerAPI.delete({ id: partnerId, userId });
      if (!res.error) {
        fetchPartners();
      } else {
        alert(res.error || "Failed to delete partner");
      }
    } catch (err) {
      console.error("Error deleting partner:", err);
    }
  };

  return (
    <div className="main-content pt-4 pe-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="Oswald">Partners</h2>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> Partner
        </button>
      </div>

      {/* Partner Cards */}
      <div className="row">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <div className="col-md-6 mb-3" key={partner._id}>
              <div className="card shadow-sm  p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 Oswald">
                    Name: {partner.name?.toUpperCase()}
                  </h5>

                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(partner._id)}
                  />
                </div>
                <h6 className="Oswald mt-2">
                  Phone: <span className="">{partner.phone}</span>
                </h6>
                {/* <hr /> */}
                <p
                  className={`mb-0 Oswald ${
                    partner.Balance >= 0 ? "text-success" : " text-danger"
                  }`}
                >
                  Balance: {partner.Balance} PKR
                </p>
                <p
                  className={`mb-0 Oswald ${
                    partner.Quantity >= 0 ? "text-success" : " text-danger"
                  }`}
                >
                  Quantity: {partner.Quantity}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No partners found.</p>
        )}
      </div>

      {/* Add Partner Modal */}
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
                  <h5 className="modal-title">Add Partner</h5>
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
                    placeholder="Partner Name"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase())}
                  />
                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div class="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Initial Balance "
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control "
                      placeholder="Initial Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-dark" onClick={handleCreate}>
                    Save Partner
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

export default Partners;
