import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import db from '../firebase';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ButtonTextSize, gotToAboutUs, THEMECOLORITEMS, WebsiteName } from './constants';
import { el } from 'react-native-paper-dates';
import { getSelectedHeaderOption, setSelectedHeaderOption } from './functions/Cache';
import BounceOnHover from './BounceOnHover';
import { useRoute } from '@react-navigation/native';

export const storeName = "StyleSphere";

const { width, height } = Dimensions.get('window')

export const Logo = () => {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => { window.location.reload(); }}
            style={{ height: 75, justifyContent: "center", }}
        >
            {/* <Text style={styles.logo}>{WebsiteName}</Text> */}
            <Image
                source={require('../assets/logo.png')}
                style={{ width: width >= height ? width * 0.1 : height * 0.1 }}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

export const MyOrdersHeader = ({ setSearchQuery, searchQuery, filterProducts, goBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={goBack}>
                <AntDesign name="arrowleft" size={24} style={styles.backButton} />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search Products"
                    placeholderTextColor="#777"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={filterProducts}>
                    <AntDesign name="search1" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const imageUri = (uri) => uri && uri.length >= 3 ? uri : require('../assets/user.png');

export const WishlistHeader = ({ searchQuery, filterProducts, goBack, reset }) => {
    return (
        // <View style={styles.header}>
        //     <TouchableOpacity style={styles.backButton} onPress={goBack}>
        //         <Text style={styles.backButtonText}>Back</Text>
        //     </TouchableOpacity>
        //     <TextInput
        //         style={styles.searchInput}
        //         placeholder="Search in Wishlist"
        //         value={searchQuery}
        //         onChangeText={setSearchQuery}
        //     />
        //     <TouchableOpacity style={styles.filterButton} onPress={filterProducts}>
        //         <Text style={styles.filterButtonText}>Filter</Text>
        //     </TouchableOpacity>
        // </View>

        <View style={styles.headerStyle}>
            <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    {/* <Text style={styles.backButtonText}>Back</Text> */}
                    <AntDesign name='left' color={"#FFF"} size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => { window.location.reload(); }}
                    style={{ height: 75, justifyContent: "center", }}
                >
                    <Text style={styles.logo}>Ꮤ𐌉𐌔𐋅𐌋𐌉𐌔𐌕</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 75, justifyContent: "space-between", flexDirection: "row", alignItems: "center", }}>
                <View style={{ flexDirection: "row" }}>
                    <View
                        style={styles.searchInputContainer}
                    >
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search in Wishlist"
                            placeholderTextColor={"#777"}
                            value={searchQuery} // Bind the value to the state variable
                            onChangeText={reset} // Update the state variable on text change
                        />
                        <TouchableOpacity style={styles.iconContainer} onPress={filterProducts}>
                            <AntDesign name="search1" size={24} color={"#969497"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export const SnackBar = ({ visible, text, onClose }) => {
    const [checkoutButtonAnimation] = useState(new Animated.Value(1));

    const transformStyle = {
        opacity: checkoutButtonAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        }),
        transform: [
            {
                translateY: checkoutButtonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                }),
            },
        ],
    };

    useEffect(() => {
        if (visible) {
            resetCheckoutButton();
        } else {
            animateCheckoutButton();
        }
    }, [visible]);

    const animateCheckoutButton = () => {
        Animated.timing(checkoutButtonAnimation, {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };

    const resetCheckoutButton = () => {
        Animated.timing(checkoutButtonAnimation, {
            toValue: 0,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={{ position: 'absolute', justifyContent: 'flex-end', overflow: 'hidden', padding: 25, zIndex: visible ? 0 : -999, alignSelf: "center" }}>
            <Animated.View style={[transformStyle, { zIndex: 999 }]}>
                <View style={styles.checkoutButton}>
                    <Text style={styles.checkoutButtonText}>{text}</Text>
                    <TouchableOpacity activeOpacity={0.25} onPress={() => onClose()}>
                        <AntDesign name='down' color={'#FFF'} size={24} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export const BestSellerTag = () => {
    return (
        <View style={styles.tagContainer}>
            <Text style={styles.tagText}>
                {/* ❝Best Seller❞ */}
                Best Seller
            </Text>
        </View>
    );
};

export const handleRemoveFromWishlist = async (productId, fetchWishlist) => {
    try {
        await deleteDoc(doc(db, 'wishlist', productId));
        console.log('Product removed from wishlist with ID:', productId);
        // After removing, update the wishlist state
        try {
            fetchWishlist();
        } catch { }
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
    }
};

export const addToWishlist = async (productData) => {
    try {
        // Assuming 'wishlist' is the name of your collection
        const wishlistCollection = collection(db, 'wishlist');

        // Add the product data to the wishlist
        await addDoc(wishlistCollection, {
            ...productData,
        });

        console.log('Product added to wishlist successfully!');
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
    }
};

export const RenderOptions = ({ title, prop, setSelected, props }) => {
    const route = useRoute();
    const isSelected = prop === route.name;
    const handlePress = () => {
        setSelectedHeaderOption(title);
        if (title === "About Us") {
            props.navigation.navigate("AboutUs");
        } else if (title === "Home") {
            props.navigation.navigate("WelcomeScreen");
        } else if (title === "Services") {
            props.navigation.navigate("Services");
        } else if (title === "Contact Us") {
            props.navigation.navigate("ContactUs");
        } else if (title === "Your\nDocuments") {
            props.navigation.navigate("ContactUs");
        } else if (title === "Dues") {
            props.navigation.navigate("ContactUs");
        } else if (title === "Transactions") {
            props.navigation.navigate("ContactUs");
        } else if (title === "Need\nHelp?") {
            props.navigation.navigate("ContactUs");
        }
        setSelected(getSelectedHeaderOption());
    };

    const textStyle = {
        color: isSelected ? '#fff' : '#969497',
        padding: 10,
        fontWeight: isSelected ? '700' : '500',
        fontSize: ButtonTextSize,
        textAlign: "center"
    };

    return (
        <BounceOnHover
            onPress={handlePress}
            activeOpacity={0.8}
            style={{ height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, paddingHorizontal: width > height ? 10 : 5, backgroundColor: isSelected ? THEMECOLORITEMS : 'transparent', borderRadius: 32 }}
            touchableStyle={{ borderRadius: 32, marginHorizontal: width > height && 10, }}
        >
            <Text style={textStyle}>{title}</Text>
        </BounceOnHover>
    );
};

export const FILE_TYPES = {
    PDF: "PDF File",
    DOCX: "Word Document",
    XLSX: "Excel Spreadsheet",
    ZIP: "Compressed File",
    OTHER: "Other"
};



export const faqData = [
    {
        question: 'How can I place an order?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed accumsan, tortor eget eleifend imperdiet, velit odio auctor urna.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards, debit cards, and various digital payment methods like PayPal and Google Pay.',
    },
    {
        question: 'Is shipping free?',
        answer: 'Yes, we offer free shipping on all orders within the continental United States.',
    },
    {
        question: 'How can I track my order?',
        answer: 'Once your order has been shipped, you will receive a tracking number via email. You can use this number to track your order on our website.',
    },
    {
        question: 'Can I change or cancel my order?',
        answer: 'Unfortunately, once an order is placed, it cannot be changed or canceled. Please double-check your order before confirming the purchase.',
    },
    {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we offer international shipping to many countries. Shipping fees and delivery times may vary depending on the destination.',
    },
    {
        question: 'What is your return policy?',
        answer: 'Our return policy allows you to return items within 30 days of the delivery date. Please visit our "Returns" page for more information.',
    },
    {
        question: 'How do I contact customer support?',
        answer: 'You can contact our customer support team via email at support@example.com or by phone at +1-123-456-7890.',
    },
    {
        question: 'Are your products eco-friendly?',
        answer: 'We are committed to sustainability. Many of our products are made from eco-friendly materials, and we continuously strive to reduce our environmental impact.',
    },
    {
        question: 'Do you offer gift cards?',
        answer: 'Yes, we offer gift cards in various denominations. You can purchase them on our website, and they make for a perfect gift for your loved ones.',
    },
    {
        question: 'How can I place an order?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed accumsan, tortor eget eleifend imperdiet, velit odio auctor urna.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards, debit cards, and various digital payment methods like PayPal and Google Pay.',
    },
    {
        question: 'Is shipping free?',
        answer: 'Yes, we offer free shipping on all orders within the continental United States.',
    },
    {
        question: 'How can I track my order?',
        answer: 'Once your order has been shipped, you will receive a tracking number via email. You can use this number to track your order on our website.',
    },
    {
        question: 'Can I change or cancel my order?',
        answer: 'Unfortunately, once an order is placed, it cannot be changed or canceled. Please double-check your order before confirming the purchase.',
    },
    {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we offer international shipping to many countries. Shipping fees and delivery times may vary depending on the destination.',
    },
    {
        question: 'What is your return policy?',
        answer: 'Our return policy allows you to return items within 30 days of the delivery date. Please visit our "Returns" page for more information.',
    },
    {
        question: 'How do I contact customer support?',
        answer: 'You can contact our customer support team via email at support@example.com or by phone at +1-123-456-7890.',
    },
    {
        question: 'Are your products eco-friendly?',
        answer: 'We are committed to sustainability. Many of our products are made from eco-friendly materials, and we continuously strive to reduce our environmental impact.',
    },
    {
        question: 'Do you offer gift cards?',
        answer: 'Yes, we offer gift cards in various denominations. You can purchase them on our website, and they make for a perfect gift for your loved ones.',
    },
];

export const generalStyles = StyleSheet.create({
    AccountModalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        width: "50%",
        alignSelf: 'center',
        flexDirection: "row",
        justifyContent: "space-between"
    },
    AboutUsModalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 20,
        alignItems: 'center',
        width: "90%",
        alignSelf: 'center',
        justifyContent: "center"
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        margin: 5,
    },
    padded: {
        padding: 5
    }
});


const styles = StyleSheet.create({
    logo: {
        fontSize: width * 0.02,
        fontWeight: '900',
        color: '#fff', // Set your black color here
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#FFFFFA',
    },
    headerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        backgroundColor: "#14171B",
        // position: "absolute",
        alignSelf: "center",
        marginTop: 5,
        borderRadius: 6,
        height: 75,
        minWidth: width - 25,
        boxShadow: '5px 5px 25px rgba(0, 0, 0, 0.5)',
        // boxShadow: '-5px -5px 0px rgba(0, 0, 0, 0.5)',
    },
    searchInputContainer: {
        width: width * 0.25,
        height: 50,
        elevation: 2,
        borderRadius: 32,
        backgroundColor: "#2b292c",
        flexDirection: "row"
    },
    backButton: {
        color: 'black',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 10,
    },
    input: {
        width: 200,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#eee',
        paddingHorizontal: 10,
    },
    searchButton: {
        marginLeft: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007BFF',
    },
    searchInput: {
        color: "#fff",
        width: "90%",
        height: "100%",
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingLeft: 10,
        fontWeight: "600",
        fontSize: 18
    },
    filterButton: {
        padding: 10,
    },
    filterButtonText: {
        fontSize: 16,
        color: '#007BFF',
    },
    tagContainer: {
        flexDirection: 'row',
        position: 'relatve',
        alignSelf: 'flex-start',
        backgroundColor: "#A52A2A",
        marginVertical: 5
    },
    tagText: {
        color: '#fff',
        fontSize: 15,
        paddingHorizontal: 10
    },
    checkoutButton: {
        backgroundColor: '#1f1f1fd9',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        boxShadow: '5px 5px 25px rgba(0, 0, 0, 0.5)',
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 18,
    },
});