import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import { registerStyles as styles } from "@/styles/registerStyles";
import Toast from "react-native-toast-message";


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
      password,
      accountCode1,
      accountCode2,
    });

    setLoading(false);

    Toast.show({
      type: "success",
      text1: "✅ Registration Successful",
      text2: "You can now log in",
    });

    setTimeout(() => {
      router.replace("/");
    }, 1500);

  } catch (err: any) {
    setLoading(false);

    const serverMsg =
      err?.response?.data?.msg ||
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Registration failed";

    Toast.show({
      type: "error",
      text1: "❌ Registration Failed ",
      text2: String(serverMsg),
    });
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
            <Link href="/" asChild>
              <Text style={{ color: "#007AFF" }}>Go to Login</Text>
            </Link>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


