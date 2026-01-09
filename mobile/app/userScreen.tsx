import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { userScreenStyles as styles } from "@/styles/userScreenStyles";

export default function UserScreen() {
  
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
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}
