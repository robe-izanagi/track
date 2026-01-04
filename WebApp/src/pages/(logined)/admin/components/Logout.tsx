import React from "react";

const Logout: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <button onClick={handleLogout} style={{ padding: "8px 12px" }}>
      Logout
    </button>
  );
};

export default Logout;
