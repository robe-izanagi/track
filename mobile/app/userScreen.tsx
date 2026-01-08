import { View,Text} from "react-native";
import { userScreenStyles as styles } from "@/styles/userScreenStyles";
export default function userScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome User</Text>
    </View>
  );
}
