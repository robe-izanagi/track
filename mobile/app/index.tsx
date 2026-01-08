import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { loginStyles as styles } from "@/styles/loginStyles";
import { useRouter } from "expo-router";



const API_BASE = "http://localhost:5000/api"; // Android emulator
const ATTEMPT_THRESHOLD = 8;

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const makeFriendlyMessage = (err: any) => {
    if (!err?.response) return "Network error. Check your connection.";

    const { status, data } = err.response;

    if (status === 401) {
      const attempts = data?.attempts;
      if (typeof attempts === "number") {
        const rem = ATTEMPT_THRESHOLD - attempts;
        return `Wrong password. ${rem} attempt${rem > 1 ? "s" : ""} left.`;
      }
      return "Wrong username or password.";
    }

    if (status === 403) {
      return data?.error || "Account temporarily blocked.";
    }

    if (status >= 500) return "Server error. Try again later.";

    return data?.error || "Login failed.";
  };

  const handleSubmit = async () => {
  // In React Native, there's no e.preventDefault()
  setLoading(true);

  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password,
    });

    const token = res?.data?.token;
    const user = res?.data?.user;

    if (!token) {
      setNotice("Login succeeded but no token received. Contact admin.");
      setLoading(false);
      return;
    }

    // Save token in AsyncStorage instead of localStorage
    await AsyncStorage.setItem("token", token);

    // Determine role and navigate
    const role = user?.role?.toString().trim().toLowerCase();

    if (username === "admin") {
      router.replace("/adminScreen"); // Expo router navigation
    } else if (role === "user") {
      router.replace("/userScreen");
    } else {
      // fallback
      router.replace("/");
    }

  } catch (err: any) {
    const friendly = makeFriendlyMessage(err);
    setNotice(friendly);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TRACK</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPass}
      />

      <Pressable onPress={() => setShowPass((p) => !p)}>
        <Text style={styles.link}>
          {showPass ? "Hide Password" : "Show Password"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      {notice && <Text style={styles.error}>{notice}</Text>}

      <Text style={{ marginTop: 16 }}>
        Don’t have an account?{" "}
        <Link href="/register" asChild>
          <Text style={{ color: "#007AFF", fontWeight: "600" }}>Register</Text>
        </Link>
      </Text>
    </View>
  );
}
