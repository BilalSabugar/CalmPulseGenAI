import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Platform } from "react-native";

const logoutUser = async (navigation) => {
  try {
    await AsyncStorage.multiSet([
      ["isLogedIn", "false"],
      ["Username", ""],
    ]);

    // 3) Navigation: reset stack to WelcomeScreen if available
    if (navigation) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "WelcomeScreen" }],
        })
      );
      return;
    }
    if (Platform.OS === "web") {
      window.location.assign("/");
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default logoutUser;
