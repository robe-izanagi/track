// src/pages/profile/Profile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import GoogleSignIn from "../../../../components/GoogleSSO/GoogleSignIn";

const API_BASE = "http://localhost:5000/api";

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data.user);
      setUsername(res.data.user.username || "");
      // setEmail(res.data.user.email || "");
    } catch (err) {
      console.error("fetchProfile err", err);
      setMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMsg(null);
    try {
      await axios.put(
        `${API_BASE}/auth/profile`,
        {
          username,
          // email,
          password: password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMsg("Profile updated");
      setPassword("");
      fetchProfile();
    } catch (err: any) {
      console.error("update err", err);
      setMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update"
      );
    }
  };

  const onGoogleLinkSuccess = (data: any) => {
    // data is backend response — show clear message and refresh profile
    console.log(data)
    setMsg("Google account linked successfully");
    fetchProfile();
  };

  const onGoogleError = (err: any) => {
    console.error("Google link error", err);
    const backendMsg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Google linking failed";
    setMsg(String(backendMsg));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Profile</h2>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <form onSubmit={handleUpdate}>
            <div>
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* <div>
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div> */}

            <div>
              <label>Password (leave blank to keep)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">Save profile</button>
          </form>

          <div style={{ marginTop: 20 }}>
            <h3>Google account</h3>

            {user.googleId ? (
              <div>
                <p>
                  Linked Google account:{" "}
                  <strong>
                    {user.googleEmail || "Google linked"}
                  </strong>
                </p>
                {user.name && <p>Name: {user.name}</p>}
              </div>
            ) : (
              <div>
                <p>No Google account linked.</p>
                <p>Click below to add/link your Google account:</p>

                <GoogleSignIn
                  endpoint={`${API_BASE}/auth/google/link`}
                  onSuccess={onGoogleLinkSuccess}
                  onError={onGoogleError}
                />
              </div>
            )}
          </div>

          {msg && <div style={{ marginTop: 12, color: "#222" }}>{msg}</div>}
        </>
      ) : (
        <p>No profile</p>
      )}
    </div>
  );
};

export default Profile;
