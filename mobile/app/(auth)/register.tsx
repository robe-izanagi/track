// app/(auth)/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

/**
 * NOTE on API_HOST:
 * - Android emulator (default): use 10.0.2.2
 * - iOS simulator: localhost works
 * - Physical device: replace with your PC IP like http://192.168.1.42:5000
 */
const API_BASE =
  Platform.OS === "android"
    ? "http://localhost:5000/api"
    : "http://localhost:5000/api";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountCode1, setAccountCode1] = useState("");
  const [accountCode2, setAccountCode2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMsg(null);
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        username,
        // email,
        password,
        accountCode1,
        accountCode2,
      });

      setLoading(false);
      Alert.alert("Success", "Registered successfully! Now login.", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (err: any) {
      setLoading(false);

      const serverMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";

      setMsg(String(serverMsg));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Uncomment if you want email */}
          {/* <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            returnKeyType="next"
          /> */}

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Account Code 1"
            value={accountCode1}
            onChangeText={setAccountCode1}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Account Code 2"
            value={accountCode2}
            onChangeText={setAccountCode2}
            returnKeyType="done"
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </Pressable>

          {msg ? <Text style={styles.error}>{msg}</Text> : null}

          <View style={styles.footer}>
            <Text>Already have an account? </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.link}>Login</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: {
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    marginTop: 12,
    color: "crimson",
    fontWeight: "600",
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "#0a66c2",
    fontWeight: "600",
  },
});
