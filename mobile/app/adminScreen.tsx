import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logout from "./components/logout";
import { adminScreenStyles as styles } from "@/styles/adminScreenStyles";

export default function AdminScreen() {
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
        setName(user.username || "Admin");
      }
      setCheckingAuth(false);
    };
    checkAuth();
  });

  if (checkingAuth) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome {name}!</Text>
        <Logout />

        <Pressable style={styles.Button} onPress={() => router.push("/components/adminComponents/codeTable")}>
          <Text style={styles.Text} >Code</Text>
        </Pressable>

        <Pressable style={styles.Button} onPress={() => router.push("/components/adminComponents/userTable")}>
          <Text style={styles.Text} >Account</Text>
        </Pressable>
      </View>
    </>
  );
}
