// styles/authStyles.ts
import { StyleSheet } from "react-native";

export const adminScreenStyles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 12,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginTop: 40,
  },
});
