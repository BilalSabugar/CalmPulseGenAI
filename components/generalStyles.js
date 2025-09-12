import { StyleSheet } from "react-native";
import { height, THEMECOLOR, width } from "./constants";

export const generalStyles = StyleSheet.create({
    headerContainer: {
        // marginVertical: 10,
    },
    ScreenContainer: {
        backgroundColor: "#EEE",
        alignItems: "center",
        minHeight: height
    },
    DocumentContainer: {
        flexDirection: 'column',
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eeeeee",
        marginHorizontal: 10,
        borderRadius: 10,
        width: width > height ? width / 4.5 : width * 0.9,
    },
    DocumentIndicator: {
        width: "100%",
        height: 10,
        marginBottom: 5,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: THEMECOLOR
    },
    DocumentDetails: {
        flex: 1,
        width: "100%"
    },
    DocumentName: {
        color: 'black', // Set your black color here
        width: "90%",
        fontWeight: "600",
        fontSize: 18,
        paddingHorizontal: 10
    },
    DocumentDescription: {
        // marginBottom: 10,
        color: 'black', // Set your black color here
        width: "90%",
        fontSize: 15,
        paddingHorizontal: 10
    },
    DocumentButton1: {
        flexDirection: 'row',
        marginVertical: 10,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center"
    },
    DocumentButtonContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },
    DocumentButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    DocumentButton2: {
        backgroundColor: 'black', // Set your black color here
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        justifyContent: "center"
    }
})