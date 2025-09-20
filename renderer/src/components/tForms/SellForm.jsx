import React, { useState } from "react";

const SellForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    sellerName: "",
    buyerName: "",
    sellingRate: "",
    totQuantity: "",
    date: "",
    payingMethod: "",
    note: "",
  });
  const [totDebtors, setTotDebtors] = useState(0);
  const [debtors, setDebtors] = useState([]);

  // handle main form fields
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // handle debtor fields
  const handleDebtorChange = (index, field, value) => {
    setDebtors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        sellingRate: Number(form.sellingRate),
        totQuantity: Number(form.totQuantity),
        debtors:
          form.payingMethod === "payToDebtor"
            ? debtors.map((d) => ({
                name: d.name,
                amount: Number(d.amount),
              }))
            : [],
      };

      await window.api.sells.create(payload);

      // reset
      setForm({
        sellerName: "",
        buyerName: "",
        sellingRate: "",
        totQuantity: "",
        date: "",
        payingMethod: "",
        note: "",
      });
      setTotDebtors(0);
      setDebtors([]);
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Error creating sell transaction:", err);
    }
  };

  return (
    <div className="sell-form">
      <h4>Selling Form</h4>
      <form onSubmit={handleSubmit}>
        <div className="row gap-2">
          {/* first row */}
          <div className="col-12 d-flex gap-2">
            <input
              type="text"
              name="sellerName"
              value={form.sellerName}
              onChange={handleChange}
              placeholder="Enter Seller name"
              className="form-control text-center"
              required
            />
            <input
              type="text"
              name="buyerName"
              value={form.buyerName}
              onChange={handleChange}
              placeholder="Enter Buyer name"
              className="form-control text-center"
              required
            />
            <input
              type="number"
              name="sellingRate"
              value={form.sellingRate}
              onChange={handleChange}
              placeholder="Enter Selling Rate"
              className="form-control text-center"
              required
            />
            <input
              type="number"
              name="totQuantity"
              value={form.totQuantity}
              onChange={handleChange}
              placeholder="Enter total Quantity"
              className="form-control text-center"
              required
            />
          </div>

          {/* second row */}
          <div className="col-12 d-flex gap-2">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-control rounded text-center"
            />

            <select
              name="payingMethod"
              value={form.payingMethod}
              className="form-select text-center"
              onChange={(e) => {
                handleChange(e);
                if (e.target.value === "payToDebtor") {
                  setTotDebtors(1);
                  setDebtors([{ name: "", amount: "" }]);
                } else {
                  setTotDebtors(0);
                  setDebtors([]);
                }
              }}
              required
            >
              <option value="">Paying Method</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Un Paid</option>
              <option value="payToDebtor">Pay to Debtor</option>
            </select>

            {form.payingMethod === "payToDebtor" && (
              <input
                type="number"
                value={totDebtors}
                min={1}
                placeholder="Enter number of Debtors"
                className="form-control text-center"
                onChange={(e) => {
                  const count = Math.max(1, Number(e.target.value));
                  setTotDebtors(count);
                  setDebtors((prev) =>
                    Array.from(
                      { length: count },
                      (_, i) => prev[i] || { name: "", amount: "" }
                    )
                  );
                }}
              />
            )}
          </div>

          {/* Debtor rows */}
          {form.payingMethod === "payToDebtor" && totDebtors > 0 && (
            <div className="p-4 rounded mx-auto border border-2 border-dark my-2 d-flex gap-2 flex-column">
              {debtors.map((debtor, i) => (
                <div key={i} className="col-12 d-flex gap-2 align-items-center">
                  <h6 className="m-0">Debtor {i + 1}</h6>
                  <input
                    type="text"
                    value={debtor.name}
                    onChange={(e) =>
                      handleDebtorChange(i, "name", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter debtor name"
                    required
                  />
                  <input
                    type="number"
                    value={debtor.amount}
                    onChange={(e) =>
                      handleDebtorChange(i, "amount", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter Amount"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* fourth row */}
          <div className="col-12 d-flex gap-2">
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Enter Description"
              className="form-control"
            />
            <button type="submit" className="btn btn-dark">
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellForm;
