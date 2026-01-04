import React, { useState } from "react";
import axios from "axios";

type UserRow = {
  _id: string;
  username: string;
  // email: string;
  role: string;
  status: string;
  blockedUntil?: string | null;
  lastSuccessfulLogin?: string | null;
};

const API_BASE = "http://localhost:5000/api";

type Props = {
  user: UserRow;
  onClose: () => void;
  onDone?: () => void; // called after block/unblock
};

const UserModal: React.FC<Props> = ({ user, onClose, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [blockMinutes, setBlockMinutes] = useState<string>("30");

  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handleBlock = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/block/${user._id}`,
        { minutes: Number(blockMinutes) || 30 },
        { headers: tokenHeader }
      );
      alert(res.data.message || "User blocked");
      onDone?.();
    } catch (e: any) {
      console.error("Block error", e);
      setErr(e?.response?.data?.error || "Failed to block user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/unblock/${user._id}`,
        {},
        { headers: tokenHeader }
      );
      alert(res.data.message || "User unblocked");
      onDone?.();
    } catch (e: any) {
      console.error("Unblock error", e);
      setErr(e?.response?.data?.error || "Failed to unblock user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          width: "min(720px,95%)",
        }}
      >
        <h3>User Details</h3>
        <div>
          <strong>Username:</strong> {user.username}
        </div>
        {/* <div>
          <strong>Email:</strong> {user.email}
        </div> */}
        <div>
          <strong>Role:</strong> {user.role}
        </div>
        <div>
          <strong>Status:</strong> {user.status}
        </div>
        <div>
          <strong>Blocked Until:</strong>{" "}
          {user.blockedUntil
            ? new Date(user.blockedUntil).toLocaleString()
            : "-"}
        </div>
        <div>
          <strong>Last Login:</strong>{" "}
          {user.lastSuccessfulLogin
            ? new Date(user.lastSuccessfulLogin).toLocaleString()
            : "-"}
        </div>

        {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {user.status !== "blocked" ? (
            <>
              <label>
                Block minutes:
                <input
                  type="number"
                  value={blockMinutes}
                  onChange={(e) => setBlockMinutes(e.target.value)}
                  style={{ width: 80, marginLeft: 8 }}
                />
              </label>
              <button
                onClick={handleBlock}
                disabled={loading}
                style={{
                  background: "#d44638",
                  color: "#fff",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                {loading ? "Blocking..." : "Block user"}
              </button>
            </>
          ) : (
            <button
              onClick={handleUnblock}
              disabled={loading}
              style={{
                background: "#4CAF50",
                color: "#fff",
                padding: "8px 12px",
                border: "none",
                borderRadius: 4,
              }}
            >
              {loading ? "Unblocking..." : "Unblock user"}
            </button>
          )}

          <button
            onClick={onClose}
            style={{ marginLeft: "auto", padding: "8px 12px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
