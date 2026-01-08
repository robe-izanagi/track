import { StyleSheet } from "react-native";

export const registerStyles = StyleSheet.create({
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