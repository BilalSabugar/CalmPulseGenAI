import { useNavigation } from '@react-navigation/native';
import { users } from '../../src/users';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userAuth = async (username, passcode) => {
    const user = users.find(
        (u) => u.username === username && u.passcode === passcode
    );
    if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
    } else {
        alert("invalid credentials");
    }
    return user || null;
};

export default userAuth;