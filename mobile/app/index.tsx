import { Text, View } from "react-native";
import Login from "./(auth)/login";
import Register from "./(auth)/register";

export default function Index() {
  return (
    <>
      <Login/>
      <Register/>
    </>
  );
}
