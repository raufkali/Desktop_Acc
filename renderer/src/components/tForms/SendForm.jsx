import React, { useState } from "react";

const SendForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    senderName: "",
    receiverName: "",
    amount: "",
    product: "",
    payDebt: false,
    type: "",
    date: "",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        product: Number(form.product),
      };

      await window.api.sends.create(payload);
      console.log("Send transaction created ✅");

      // reset
      setForm({
        senderName: "",
        receiverName: "",
        amount: "",
        product: "",
        payDebt: false,
        type: "",
        date: "",
        note: "",
      });
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Error creating send transaction:", err);
    }
  };

  return (
    <div className="send-form gap-2">
      <h3>Sender Form</h3>
      <form onSubmit={handleSubmit} className="row gap-2">
        {/* Type Selection FIRST */}
        <div className="col-3  d-flex gap-2 mb-2">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="form-select bg-white shadow-sm"
            required
          >
            <option value="">Select Type</option>
            <option value="amount">Send Amount</option>
            <option value="product">Send Products</option>
            <option value="both">Send Both</option>
          </select>
        </div>

        <div className="col-12 d-flex gap-2">
          <input
            type="text"
            name="senderName"
            value={form.senderName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Sender name"
            required
          />
          <input
            type="text"
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Receiver name"
            required
          />

          {/* Conditionally Render Fields */}
          {form.type === "amount" && (
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter Total Amount"
              required
            />
          )}

          {form.type === "product" && (
            <input
              type="number"
              name="product"
              value={form.product}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter Dirhams"
              required
            />
          )}

          {form.type === "both" && (
            <>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Total Amount"
                required
              />
              <input
                type="number"
                name="product"
                value={form.product}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Dirhams"
                required
              />
            </>
          )}
        </div>

        <div className="col-12 gap-2 d-flex">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-control"
            required
          />

          {/* Pay Debt Checkbox */}
          <div className="form-check align-items-center justify-content-center d-flex form-control text-center">
            <input
              type="checkbox"
              name="payDebt"
              checked={form.payDebt}
              onChange={handleChange}
              className="mx-2 form-check-input border-dark border-2"
              id="payDebt"
            />
            <label className="form-check-label ms-1" htmlFor="payDebt">
              Pay Debt
            </label>
          </div>
        </div>

        <div className="col-12 gap-2 d-flex">
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Description"
          />
          <button className="btn btn-dark" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendForm;
