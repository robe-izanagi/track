import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const API_BASE = "http://localhost:5000/api";
const ADMIN_CODE_ENV = "ADMIN-TRACK-2026-PUP";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GenerateAccountCodes({
  visible,
  onClose,
  onSuccess,
}: Props) {
  const [num, setNum] = useState(1);
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const [working, setWorking] = useState(false);

  const [accountCodes, setAccountCodes] = useState<any[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);

  const [adminCode, setAdminCode] = useState("");
  const [allowPost, setAllowPost] = useState(false);

  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const generateCode = (length = 8) => {
    let code = "";
    code += chars[Math.floor(Math.random() * 26)];
    code += chars[Math.floor(Math.random() * 26) + 26];
    code += chars[Math.floor(Math.random() * 10) + 52];

    while (code.length < length) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const getAdminUsernameFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return "admin";
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload?.username || "admin";
    } catch {
      return "admin";
    }
  };

  const resetAndClose = () => {
    setNum(1);
    setUserType("user");
    setAccountCodes([]);
    setShowGenerated(false);
    setAdminCode("");
    setAllowPost(false);
    setWorking(false);
    onClose();
  };

  const handleGeneratePreview = () => {
    if (num <= 0) {
      Toast.show({
        type: "error",
        text1: "❌ Invalid quantity",
      });
      return;
    }

    const list = Array.from({ length: num }).map(() => {
      let c1 = generateCode();
      let c2 = generateCode();
      while (c1 === c2) c2 = generateCode();
      return { accountCode1: c1, accountCode2: c2 };
    });

    setAccountCodes(list);
    setShowGenerated(true);
  };

  const verifyAdminCode = () => {
    if (adminCode !== ADMIN_CODE_ENV) {
      Toast.show({
        type: "error",
        text1: "❌ Invalid admin code",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "✅ Admin verified",
    });

    setAllowPost(true);
  };

  const postGeneratedCodes = async () => {
    if (working) return;
    setWorking(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const adminUsername = await getAdminUsernameFromToken();

      await Promise.all(
        accountCodes.map((c) =>
          axios.post(
            `${API_BASE}/code/generateAccountCode`,
            {
              accountCode1: c.accountCode1,
              accountCode2: c.accountCode2,
              userType,
              generateBy: adminUsername,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      Toast.show({
        type: "success",
        text1: "✅ Success",
        text2: "Account codes generated",
      });

      onSuccess();
      resetAndClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "❌ Error",
        text2: err?.response?.data?.error || "Server error",
      });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {!showGenerated ? (
            <>
              <Text style={styles.title}>Generate Account Codes</Text>

              <View style={styles.row}>
                <Text style={styles.q}>Quantity:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(num)}
                  onChangeText={(v) => setNum(Number(v) || 1)}
                  placeholder="Quantity"
                />
              </View>

              <View style={styles.row}>
                <Pressable
                  style={[styles.typeBtn, userType === "user" && styles.active]}
                  onPress={() => setUserType("user")}
                >
                  <Text>User</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.typeBtn,
                    userType === "admin" && styles.active,
                  ]}
                  onPress={() => setUserType("admin")}
                >
                  <Text>Admin</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.primaryBtn}
                onPress={handleGeneratePreview}
              >
                <Text style={styles.btnText}>Generate</Text>
              </Pressable>
            </>
          ) : (
            <ScrollView>
              <Text style={styles.title}>Generated Codes</Text>

              {accountCodes.map((c, i) => (
                <View key={i} style={styles.codeBox}>
                  <Text>No: {i + 1}</Text>
                  <Text>Code 1: {c.accountCode1}</Text>
                  <Text>Code 2: {c.accountCode2}</Text>
                </View>
              ))}

              {userType === "admin" && !allowPost && (
                <>
                  <Text style={styles.warn}>
                    Admin codes require verification
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Admin Code"
                    value={adminCode}
                    onChangeText={setAdminCode}
                  />
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={verifyAdminCode}
                  >
                    <Text style={styles.btnText}>Verify</Text>
                  </Pressable>
                </>
              )}

              {(userType !== "admin" || allowPost) && (
                <Pressable
                  style={[styles.successBtn, working && { opacity: 0.6 }]}
                  onPress={postGeneratedCodes}
                >
                  {working ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Confirm</Text>
                  )}
                </Pressable>
              )}

              <Pressable style={styles.cancelBtn} onPress={resetAndClose}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  q: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  active: {
    backgroundColor: "#93c5fd",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  successBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  warn: {
    color: "#b45309",
    marginTop: 10,
    marginBottom: 6,
  },
});
