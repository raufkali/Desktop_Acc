import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;

      if (mode === "signin") {
        // ✅ LOGIN
        res = await window.api.loginUser({
          email: form.email,
          password: form.password,
        });
      } else {
        // ✅ SIGNUP (use createUser, not registerUser)
        res = await window.api.createUser(form);
      }

      if (res.error) {
        setError(res.error);
      } else {
        // store user session
        localStorage.setItem("user", JSON.stringify(res));
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="main-content d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "500px", width: "100%", borderRadius: "1rem" }}
      >
        {/* Tab Switcher */}
        <div className="d-flex justify-content-around mb-2">
          <button
            className={`btn ${
              mode === "signin" ? "btn-dark" : "btn-outline-dark"
            } w-50 me-2`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`btn ${
              mode === "signup" ? "btn-dark" : "btn-outline-dark"
            } w-50`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>
        <hr />
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Animate form */}
        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-center mb-3 Oswald-bold">Welcome Back</h3>
              <hr />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Sign In
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-center mb-3 Oswald-bold">Create Account</h3>
              <hr />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Sign Up
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
