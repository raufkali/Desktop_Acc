import React, { useState, useEffect } from "react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ─── Fetch Profile ───────────────────────────────
  const getProfile = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    if (!userId) return;

    const fetchedProfile = await window.api.getProfile(userId);
    setProfile(fetchedProfile);
    console.log("Fetched Profile:", fetchedProfile);

    setUsername(fetchedProfile?.username || "");
    setEmail(fetchedProfile?.email || "");
  };

  // ─── Handle Update ───────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id;
    if (!userId) return;

    const data = {
      username: username || profile.username,
      email: email || profile.email,
      ...(newPassword && { password: newPassword }), // ✅ only send if not empty
    };

    try {
      const updated = await window.api.updateProfile(userId, data);
      if (updated.error) {
        console.error(updated.error);
      } else {
        setProfile(updated);
        setUsername(updated.username || "");
        setEmail(updated.email || "");
        setNewPassword("");
        setShowModal(false);
      }
    } catch (err) {
      console.error("Update failed:", err.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content  pt-4 pb-4 pe-4">
      <div
        class="row d-flex align-items-center justify-content-center"
        style={{ minHeight: "80vh" }}
      >
        <div class="col-md-8">
          <div className="card shadow-sm bg-light-dark p-4">
            <h2 className="mb-0 mx-auto Oswald">Profile</h2>
            <hr />
            <div class="card-body p-5">
              <div class="d-flex gap-3 mb-3">
                <h4>
                  Username: <span className="ms-3">{profile.username}</span>
                </h4>
              </div>
              <div class="d-flex gap-3">
                <h4>
                  Email: <span className="ms-3">{profile.email}</span>
                </h4>
              </div>
            </div>

            <button
              className="btn btn-dark mt-4 Oswald"
              onClick={() => setShowModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Modal ─────────────────────────────── */}
      {showModal && (
        <div
          className="modal fade show "
          style={{ display: "block", background: "rgba(2, 2, 2, 0.64)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content bg-white">
              <div className="modal-header">
                <h5 className="modal-title Oswald  ">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={username || ""}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-dark Oswald">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
