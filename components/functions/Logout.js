// utils/logoutUser.js
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Platform } from "react-native";

const logoutUser = async (navigation) => {
  try {
    // 1) Firebase sign out (ignore if not signed in)
    try {
      await signOut(getAuth());
    } catch (e) {
      // noop: user might already be signed out
      console.log("signOut warning:", e?.message || e);
    }

    // 2) Clear AsyncStorage flags (as requested)
    await AsyncStorage.multiSet([
      ["isLogedIn", "false"],
      ["isAutoLogin", "false"],
      ["email", ""],
    ]);

    // 3) Navigation: reset stack to WelcomeScreen if available
    if (navigation) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "WelcomeScreen" }], // adjust if your route name differs
        })
      );
      return;
    }

    // 4) Fallback for web if navigation is unavailable
    if (Platform.OS === "web") {
      // redirect to your landing/login path
      window.location.assign("/");
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default logoutUser;
