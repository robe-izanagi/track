import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Logout from "./components/Logout";
import GenerateAccountCodes from "./components/GenerateAccountCodes";
import TableAccountCodes from "./components/TableAccountCodes";
import ModalAccountCode from "./components/AccountCodeModal/ModalAccountCode";
import TableUsers from "./components/TableUsers";
import Profile from "./components/Profile";
import AccountCodeSummary from "./components/AccountCodeModal/AccountCodeSummary";
import ListAccountCodes from "./ListAccountCodes";

const API_BASE = "http://localhost:5000/api";

const AdminDashboard: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // sort/search state (lifted so Table can control it)
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [filterKey, setFilterKey] = useState<string>("user");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchUsedBy, setSearchUsedBy] = useState<string>("");

  // modal state
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGenerate, setModalGenerate] = useState(false);

  // fetch codes
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/code/fetchAccountCodes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCodes(res.data.codes || []);
    } catch (err: any) {
      console.error(
        "Fetch codes error:",
        err?.response?.data || err?.message || err
      );
      // keep codes as-is and show an alert minimally
      alert("Failed to fetch codes. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived displayed codes (search + safe sort) — same logic used before
  const displayedCodes = useMemo(() => {
    const search = (searchUsedBy || "").trim().toLowerCase();
    const filtered = codes.filter((c) => {
      if (!search) return true;
      const usedBy = (c?.usedBy ?? "").toString().toLowerCase();
      return usedBy.includes(search);
    });

    const compare = (a: any, b: any) => {
      let aVal = a?.[sortKey];
      let bVal = b?.[sortKey];

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (sortKey === "createdAt") {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        if (aTime < bTime) return sortDirection === "asc" ? -1 : 1;
        if (aTime > bTime) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    };

    return [...filtered].sort(compare);
  }, [codes, sortKey, sortDirection, searchUsedBy]);

  // row click opens modal
  const onRowClick = (row: any) => {
    setSelected(row);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const closeGenerate = () => {
    setModalGenerate(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>
      <p>You are logged in.</p>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Logout />
      </div>

      <div>
        <AccountCodeSummary />
        <button type="button" onClick={() => setModalGenerate(true)}>
          Generate New Code
        </button>
        <button type="button">Share Account Code</button>
      </div>

      <GenerateAccountCodes
        open={modalGenerate}
        apiBase={API_BASE}
        onDone={() => fetchCodes()}
        onClose={closeGenerate}
      />

      <div style={{ marginTop: 30 }}>
        <TableAccountCodes
          loading={loading}
          codes={displayedCodes}
          sortKey={sortKey}
          filterKey={filterKey}
          sortDirection={sortDirection}
          setFilterKey={setFilterKey}
          setSortKey={setSortKey}
          setSortDirection={setSortDirection}
          searchUsedBy={searchUsedBy}
          setSearchUsedBy={setSearchUsedBy}
          onRowClick={onRowClick}
        />
      </div>

      <ModalAccountCode open={modalOpen} row={selected} onClose={closeModal} />

      <div style={{ marginTop: 50 }}>
        <hr />
        <TableUsers />
      </div>

      <div style={{ marginTop: 50 }}>
        <hr />
        <ListAccountCodes />
      </div>

      <div style={{ marginTop: 50 }}>
        <hr />
        <Profile />
      </div>
    </div>
  );
};

export default AdminDashboard;
