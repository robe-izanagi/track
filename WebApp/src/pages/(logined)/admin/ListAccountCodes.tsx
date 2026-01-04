import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

function ListAccountCodes() {
  const [listAccountCode, setListAccountCode] = useState<any[]>([]);
  const [listAccountCodeType, setListAccountCodeType] = useState<any[]>([]);

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

  const handleSubmit = () => {
    const admin = getAdminUsernameFromToken() || "admin";

    const fetchStats = async () => {
      try {
        const res = await axios.get<{ ownCodes: any[], ownCodesUserType: any[] }>(
          `${API_BASE}/code/listAccountCodes`,
          {
            params: { generateBy: admin, userType: 'admin' },
          }
        );

        setListAccountCode(res.data.ownCodes);
        setListAccountCodeType(res.data.ownCodesUserType);
      } catch (err) {
        console.error(err);
        // optionally set error state / notify user
      }
    };

    fetchStats();
  };

  // useEffect(() => {
  //   // call on mount or based on user action
  //   handleSubmit();
  // }, []);

  return (
    <div>
      <button onClick={handleSubmit}>Yeah</button>
      {/* render your list */}
      {listAccountCode.map((c) => (
        // <div key={c._id}>
        //   {c.accountCode1} - {c.usedBy}
        // </div>
        <div key={c._id}>
          <p>Account Code 1: {c.accountCode1}</p>
          <p>Account Code 2: {c.accountCode2}</p>
          <p>Generate Date: {c.createdAt}</p>
          <hr/>
        </div>
      ))}
      <h2>====================</h2>
      <h1>UserType : admin</h1>
      {listAccountCodeType.map((c) => (
        // <div key={c._id}>
        //   {c.accountCode1} - {c.usedBy}
        // </div>
        <div key={c._id}>
          <p>Account Code 1: {c.accountCode1}</p>
          <p>Account Code 2: {c.accountCode2}</p>
          <p>Generate Date: {c.createdAt}</p>
          <hr/>
        </div>
      ))}
    </div>
  );
}

export default ListAccountCodes;
