// src/pages/login/Login.tsx
import React, { useState } from "react";
import axios from "axios";
import styles from "./login.module.css";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignIn from "../../components/GoogleSSO/GoogleSignIn";

const API_BASE = "http://localhost:5000/api";
const ATTEMPT_THRESHOLD = 8; // limit attempt

function parseIsoFromString(s: string | undefined): string | null {
  if (!s) return null;
  // match ISO-like pattern example 2025-12-27T01:18:56.121Z or without ms
  const m = s.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/);
  return m ? m[0] : null;
}

function minutesUntil(iso: string) {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, then - now);
    return Math.ceil(diff / 60000);
  } catch {
    return null;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  // const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null); // user-facing message
  const [noticeType, setNoticeType] = useState<"error" | "info" | null>(null);

  const clearNotice = () => {
    setNotice(null);
    setNoticeType(null);
  };

  // central parser for axios error -> friendly message
  const makeFriendlyMessage = (err: unknown) => {
    // default
    let msg = "Login failed. Please try again.";
    try {
      const anyErr = err as any;
      // network error
      if (!anyErr || !anyErr.response) {
        return "Network error — please check your connection.";
      }

      const status = anyErr.response.status;
      const data = anyErr.response.data || {};

      // 400 - bad request / missing fields
      if (status === 400) {
        if (data?.error) return String(data.error);
        if (data?.msg) return String(data.msg);
        return "Invalid request. Make sure all required fields are filled.";
      }

      // 401 - invalid credentials (wrong password or user not exist)
      if (status === 401) {
        // server may include attempts
        const attempts = data?.attempts;
        if (attempts !== undefined && typeof attempts === "number") {
          const rem = ATTEMPT_THRESHOLD - attempts;
          return `Wrong password. ${
            rem > 0
              ? `${rem} attempt${
                  rem > 1 ? "s" : ""
                } left before temporary block.`
              : "No attempts left."
          }`;
        }
        // sometimes backend returns different text, attempt to use it
        if (data?.error) {
          const errText = String(data.error || "");
          if (errText.toLowerCase().includes("invalid credentials"))
            return "Wrong username or password.";
          if (
            errText.toLowerCase().includes("user") &&
            errText.toLowerCase().includes("found")
          )
            return "User does not exist.";
          return errText;
        }
        return "Wrong username or password.";
      }

      // 403 - blocked or forbidden
      if (status === 403) {
        // server might return structured blockedUntil
        const blockedUntil =
          data?.blockedUntil ||
          data?.blocked_at ||
          parseIsoFromString(String(data?.error || data?.msg || ""));
        if (blockedUntil) {
          const mins = minutesUntil(blockedUntil);
          if (mins !== null) {
            return `Your account is blocked. Try again after ${mins} minute${
              mins > 1 ? "s" : ""
            } (at ${new Date(blockedUntil).toLocaleString()}).`;
          }
        }
        // fallback to message
        if (data?.error) return String(data.error);
        if (data?.msg) return String(data.msg);
        return "Access forbidden. Contact support.";
      }

      // 429 rate limit
      if (status === 429) {
        return data?.error || "Too many requests. Try again later.";
      }

      // generic server error
      if (status >= 500) {
        return data?.error || data?.msg || "Server error. Try again later.";
      }

      // fallback to any textual message
      if (data?.error) return String(data.error);
      if (data?.msg) return String(data.msg);
      if (anyErr?.message) return String(anyErr.message);

      return msg;
    } catch (e) {
      return "Login failed (unknown error).";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotice();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      });
      const token = res?.data?.token;
      const user = res?.data?.user;

      if (!token) {
        setNotice("Login succeeded but no token received. Contact admin.");
        setNoticeType("error");
        setLoading(false);
        return;
      }

      // success: reset notice, store token, redirect by role
      localStorage.setItem("token", token);

      // optionally: show welcome or redirect
      const role = user?.role;
      if (role === "admin") {
        navigate("/admin-page/dashboard", { replace: true });
      } else if (role === "user") {
        navigate("/user-page/dashboard", { replace: true });
      } else {
        // fallback
        navigate("/", { replace: true });
      }
    } catch (err) {
      const friendly = makeFriendlyMessage(err);
      setNotice(friendly);
      setNoticeType("error");
      setLoading(false);
    }
  };

  // -------------------------
  // GOOGLE SIGN-IN HANDLERS
  // -------------------------
  const onGoogleSuccess = (resp: any) => {
    // GoogleSignIn component usually calls onSuccess(res.data)
    // Be tolerant of shape: either resp or resp.data
    const payload = resp?.data ? resp.data : resp;
    const token = payload?.token;
    const user = payload?.user;

    if (token) {
      try {
        localStorage.setItem("token", token);
      } catch (e) {}
      // redirect based on role if provided
      if (user?.role === "admin")
        navigate("/admin-page/dashboard", { replace: true });
      else navigate("/user-page/dashboard", { replace: true });
      return;
    }

    // if backend returned no token, show backend message if any
    const message =
      payload?.message ||
      payload?.error ||
      "Google login succeeded but no token returned.";
    setNotice(String(message));
    setNoticeType("error");
  };

  // sa Login.tsx (onGoogleError handler)
  const onGoogleError = (err: any) => {
    console.error("Google login error:", err);
    const status = err?.response?.status;
    const backendMsg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Google login failed";

    // If backend says account not linked -> redirect to register
    if (status === 401 && err?.response?.data?.redirect) {
      // optionally show message before redirect
      alert(backendMsg);
      window.location.href = err.response.data.redirect; // '/register'
      return;
    }

    // otherwise show message
    setNotice(String(backendMsg));
    setNoticeType("error");
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1>Welcome to TRACK</h1>

        <form onSubmit={handleSubmit} aria-describedby="login-notice">
          <h3>Login with your TRACK account</h3>

          <div className={styles.fieldContent}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={username}
              placeholder="track username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldContent}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              value={password}
              name="password"
              placeholder="track password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className={styles.togglePassBtn}
            >
              {showPass ? "Hide Password" : "Show Password"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {notice && (
            <div
              id="login-notice"
              role={noticeType === "error" ? "alert" : "status"}
              style={{
                marginTop: 12,
                color: noticeType === "error" ? "#b00020" : "#0b6",
              }}
            >
              {notice}
            </div>
          )}
        </form>

        <p style={{ marginTop: 12 }}>
          Don't have an account yet? <Link to={"/register"}>Register</Link>
        </p>

        {/* GOOGLE SIGNIN */}
        <div style={{ marginTop: 12 }}>
          <p style={{ marginBottom: 8, fontWeight: 500 }}>
            Or login with Google:
          </p>
          <GoogleSignIn
            endpoint={`${API_BASE}/auth/google`}
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
          />
        </div>

        <div className={styles.help}>
          <p>
            Can't find your account? <Link to={"/help"}>Click here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
