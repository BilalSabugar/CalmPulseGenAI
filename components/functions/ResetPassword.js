import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Alert } from "react-native";

const ResetPassword = async (emailId) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, emailId);
    Alert.alert('', `We have sent you a password reset email to ${emailId}. Please check your inbox and follow the instructions provided to reset your password.`);
  } catch (error) {
    Alert.alert('', error.toString()); // Convert error object to string
  }
};

export default ResetPassword;