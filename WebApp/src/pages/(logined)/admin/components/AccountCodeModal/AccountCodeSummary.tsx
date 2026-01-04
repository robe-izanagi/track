import axios from "axios";
import { useEffect, useState } from "react";

type AccountCodeStats = {
  total: number;
  available: number;
  adminCount: number;
  userCount: number;
  activeUserCount: number;
  activeAdminCount: number;
};

const AccountCodeSummary = () => {
  const [stats, setStats] = useState<AccountCodeStats>({
    total: 0,
    available: 0,
    adminCount: 0,
    userCount: 0,
    activeUserCount: 0,
    activeAdminCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<AccountCodeStats>(
          "http://localhost:5000/api/code/stats"
        );
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div>
        <p>
          Total Account Code: <span>{stats.total}</span>
        </p>
      </div>

      <div>
        <p>
          Available Code: <span>{stats.available}</span>
        </p>
      </div>

      <div>
        <p>
          Admin Account Code: <span>{stats.adminCount}</span>
        </p>
      </div>

      <div>
        <p>
          User Account Code: <span>{stats.userCount}</span>
        </p>
      </div>
      <div>
        <p>
          Active User: <span>{stats.activeUserCount}</span>
        </p>
      </div>
      <div>
        <p>
          Active Admin: <span>{stats.activeAdminCount}</span>
        </p>
      </div>
    </>
  );
};

export default AccountCodeSummary;
