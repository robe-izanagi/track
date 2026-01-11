import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { adminScreenStyles as styles } from "@/styles/adminScreenStyles";
import Logout from "./components/logout";
import axios from "axios";

const API_BASE = "http://localhost:5000/api"; 

export default function AdminScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState<string>("");
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/"); // redirect to login
  };
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (!token) {
        router.replace("/"); // login screen (index.tsx)
        return;
      }
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.username || "Admin");
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  if (checkingAuth) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {name}!</Text>
      <Logout />
    </View>
  );
}
