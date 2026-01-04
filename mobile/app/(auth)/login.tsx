// app/(auth)/login.tsx
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
    setNotice(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      });

      const token = res.data?.token;
      const role = res.data?.user?.role;

      if (!token) throw new Error("No token returned");

      await AsyncStorage.setItem("token", token);

      if (role === "admin") {
        router.replace("/");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      setNotice(makeFriendlyMessage(err));
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

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      {notice && <Text style={styles.error}>{notice}</Text>}

      <Text style={{ marginTop: 16 }}>
        Don’t have an account?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  link: {
    color: "#0a66c2",
    marginBottom: 12,
  },
  error: {
    color: "#b00020",
    marginTop: 12,
  },
});
