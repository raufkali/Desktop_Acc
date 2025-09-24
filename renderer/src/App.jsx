import React from "react";
import SidePanel from "./components/SidePanel.jsx";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
import Transactions from "./components/Transactions.jsx";
import Accounts from "./components/Accounts.jsx";
import Login from "./components/Login.jsx";
import DailySummary from "./components/DailySummary.jsx";
import Ledger from "./components/Ledger.jsx";
import Partners from "./components/Partners.jsx";
import Profile from "./components/Profile.jsx";
const App = () => {
  return (
    <>
      <SidePanel />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/summary" element={<DailySummary />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

export default App;
