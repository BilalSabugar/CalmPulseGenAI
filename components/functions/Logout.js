import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Platform } from "react-native";

const logoutUser = async (navigation) => {
  try {
    await AsyncStorage.setItem("isLoggedIn", "false");
    await AsyncStorage.removeItem("Username");
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
