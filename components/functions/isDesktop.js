import { useWindowDimensions } from "react-native"
import { width } from "../constants"

const isDesktop = () => {
    results = useWindowDimensions().width >= useWindowDimensions().height
    return results;
}

export default isDesktop;