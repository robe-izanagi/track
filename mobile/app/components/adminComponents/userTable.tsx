import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import Toast from "react-native-toast-message";


type UserRow = {
  _id: string;
  username: string;
  googleEmail: string | null;
  role: string;
  status: string;
  blockedUntil?: string | null;
  lastSuccessfulLogin?: string | null;
};

const API_BASE = "http://localhost:5000/api";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }
    setCheckingAuth(false);
  };

  const fetchUsers = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };
 

  useEffect(() => {
      const loadData = async () => {
        try {
          await Promise.all([checkAuth(), fetchUsers()]);
        } catch (err) {
          console.error("Failed to load data", err);
        } finally {
          setLoading(false);
        }
      };
        loadData();
  });

   if (loading) {
      return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

  const handleBlockToggle = async (user: UserRow) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const isBlocked = user.status === "blocked";

    const endpoint = isBlocked
      ? `${API_BASE}/admin/unblock/${user._id}`
      : `${API_BASE}/admin/block/${user._id}`;

    await axios.post(
      endpoint,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Toast.show({
      type: "success",
      text1: isBlocked ? "✅ User Unblocked" : "✅ User Blocked",
      text2: `${user.username} has been ${
        isBlocked ? "unblocked" : "blocked"
      } successfully`,
    });

    fetchUsers();
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "❌ Action Failed",
      text2: "Unable to update user status",
    });
  }
};


  const renderItem = ({ item }: { item: UserRow }) => {
    const isBlocked = item.status === "blocked";

    return (
      <View style={styles.card}>
        <Text style={styles.username}>{item.username}</Text>

        <Text style={styles.text}>
          Email: {item.googleEmail || "Not registered"}
        </Text>

        <Text style={styles.text}>Role: {item.role}</Text>

        <Text style={styles.text}>
          Status:{" "}
          {isBlocked && item.blockedUntil
            ? `Blocked until ${new Date(item.blockedUntil).toLocaleString()}`
            : item.status}
        </Text>

        <Text style={styles.text}>
          Last Login:{" "}
          {item.lastSuccessfulLogin
            ? new Date(item.lastSuccessfulLogin).toLocaleString()
            : "-"}
        </Text>

        {/* ACTION (ONLY FOR USER ROLE) */}
        {item.role === "user" && (
          <Pressable
            style={[
              styles.actionBtn,
              isBlocked ? styles.unblockBtn : styles.blockBtn,
            ]}
            onPress={() => handleBlockToggle(item)}
          >
            <Text style={styles.actionText}>
              {isBlocked ? "Unblock" : "Block"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <>
      <Pressable
        onPress={() => router.back()}
        style={{ paddingVertical: 8, paddingHorizontal: 12 }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#007AFF" }}>
          {"< Back"}
        </Text>
      </Pressable>

      <Text style={styles.title}>List of Account</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    elevation: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    marginBottom: 4,
  },
  actionBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  blockBtn: {
    backgroundColor: "#d9534f",
  },
  unblockBtn: {
    backgroundColor: "#5cb85c",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "crimson",
    textAlign: "center",
    marginTop: 20,
  },
});

export default UsersList;
