import { View,Text} from "react-native";
import { adminScreenStyles as styles } from "@/styles/adminScreenStyles";

export default function adminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome admin</Text>
    </View>
  );
}
