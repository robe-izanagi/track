import React, { useState } from "react";
import axios from "axios";

type Props = {
  open: boolean;
  apiBase: string;
  onClose: () => void;
  onDone?: () => void; // called after successful generation
};

const adminCodeEnv =
  (import.meta.env.ADMIN_CODE as string) || "ADMIN-TRACK-2026-PUP";

const GenerateAccountCodes: React.FC<Props> = ({
  open,
  apiBase,
  onDone,
  onClose,
}) => {
  if (!open) {
    return;
  }

  const [num, setNum] = useState<number>(1);
  const [userType, setUserType] = useState<string>("user");
  const [adminUsername, setAdminUsername] = useState<string>("user");
  const [working, setWorking] = useState(false);

  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randChar = (s: string) => s[Math.floor(Math.random() * s.length)];

  const generateSingle = (length = 8) => {
    let code = "";
    // ensure at least one lower, upper, number
    code += randChar("abcdefghijklmnopqrstuvwxyz");
    code += randChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    code += randChar("0123456789");
    while (code.length < length) code += randChar(chars);
    return code
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  // helper: parse JWT payload (no lib) and return parsed object or null
  const parseJwtPayload = (token: string | null) => {
    try {
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1];
      // base64url -> base64
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      // add padding if needed
      const pad = b64.length % 4;
      const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  // get admin email from token payload if available
  const getAdminUsernameFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("token");
      const payload = parseJwtPayload(token);
      // payload may contain email or username
      if (payload && typeof payload === "object") {
        // if (payload.email) return String(payload.email);
        if (payload.username) return String(payload.username);
        if (payload.user && payload.user.username)
          return String(payload.user.username);
      }
      return null;
    } catch {
      return null;
    }
  };

  // modal view / confirm generated code
  const [allowPost, setAllowPost] = useState<boolean>(false);
  const [adminCode, setAdminCode] = useState<string>("");
  const [modalGeneratedCode, setModalGeneratedCode] = useState<boolean>(false);

  const handleCode = () => {
    console.log(adminCode);
    console.log(adminCodeEnv);

    if (adminCode === adminCodeEnv) {
      setAllowPost(true);
    } else {
      return alert(
        "Invalid Code! Try Again.\nDon't have code? send request mailto: robeizagani@gmail.com"
      );
    }
  };

  const generateCode = (): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!/[a-z]/.test(code) || !/[A-Z]/.test(code) || !/[0-9]/.test(code)) {
      return generateCode();
    }
    return code;
  };

  const [accountCodes, setAccountCodes] = useState<any[]>([]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!num || num <= 0) return alert("Enter a valid quantity");
    // setWorking(true);
    setAdminUsername(getAdminUsernameFromToken() || "admin");

    const generatedCodes = [];
    for (let i = 0; i < num; i++) {
      let code1 = generateCode();
      let code2 = generateCode();
      while (code1 === code2) {
        code2 = generateCode();
      }
      generatedCodes.push({
        accountCode1: code1,
        accountCode2: code2,
      });
    }

    setAccountCodes(generatedCodes);
    setModalGeneratedCode(true);
  };

  // post generated code to the database
  const postGeneratedCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!num || num <= 0) return alert("Enter a valid quantity");

    setWorking(true);

    // compute generateBy once from token (fallback to "admin")
    const adminUsername = getAdminUsernameFromToken() || "admin";

    try {
      for (let i = 0; i < num; i++) {
        let c1 = generateSingle();
        let c2 = generateSingle();
        while (c1 === c2) c2 = generateSingle();

        // endpoint your server expects
        await axios.post(
          `${apiBase}/code/generateAccountCode`,
          {
            accountCode1: c1,
            accountCode2: c2,
            userType,
            generateBy: adminUsername,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      alert("All codes generated and posted successfully!");
      onDone?.();
      onClose();
    } catch (err: any) {
      console.error(
        "Generate error:",
        err?.response?.data || err?.message || err
      );
      alert("Failed to generate/post codes. See console.");
    } finally {
      setWorking(false);
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
      {!modalGeneratedCode && (
        <form
          onClick={(e) => e.stopPropagation()}
          style={{
            // background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: "min(720px,95%)",
          }}
        >
          <h2>Generate Account Code</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>
              Quantity:
              <input
                type="number"
                min={1}
                value={num}
                onChange={(e) => setNum(Number(e.target.value))}
                style={{ marginLeft: 8, width: 100 }}
              />
            </label>

            <label>
              User Type:
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={working}
              style={{ marginLeft: 12 }}
            >
              {working ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      )}
      {modalGeneratedCode && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: "min(720px,95%)",
          }}
        >
          <div
            // onClick={() => setModalGeneratedCode(true)}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: "min(720px,95%)",
            }}
          >
            <div>
              <h2>Generated Code</h2>
              <ul>
                {accountCodes.map((code, idx) => (
                  <li key={idx}>
                    <p>No: {idx + 1}</p>
                    <p>Code 1: {code.accountCode1}</p>
                    <p>Code 2: {code.accountCode2}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div>
                <p>Generate By: {adminUsername || "admin"}</p>
                <p>Quantity: {num}</p>
                <p>Date: </p>
              </div>
              {userType === "admin" && (
                <>
                  {!allowPost && (
                    <div>
                      <p>
                        Generating admin user type account code are crucial!
                        Enter the admin code to proceed.
                      </p>
                      <input
                        type="text"
                        name="adminCode"
                        id="adminCode"
                        placeholder="Admin Code"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                      />
                      <button type="button" onClick={handleCode}>
                        Submit
                      </button>
                    </div>
                  )}
                  {allowPost && (
                    <div>
                      <h3>Confirm</h3>
                      <p>Are you sure?</p>
                      <div>
                        <button
                          type="button"
                          onClick={() => setModalGeneratedCode(false)}
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={postGeneratedCode}>
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {userType != "admin" && (
                <div>
                  <h3>Confirm</h3>
                  <p>Are you sure?</p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setModalGeneratedCode(false)}
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={postGeneratedCode}>
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateAccountCodes;
