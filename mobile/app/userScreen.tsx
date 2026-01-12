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
import { userScreenStyles as styles } from "@/styles/userScreenStyles";
import Logout from "./components/logout";
import axios from "axios";

const API_BASE = "http://localhost:5000/api"; 

export default function UserScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState<string>("");
 
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (!token) {
        router.replace("/"); 
        return;
      }
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.username || "User");
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
