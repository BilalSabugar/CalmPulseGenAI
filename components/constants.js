import { Dimensions } from "react-native";

export const WebsiteFirstName = "Calm Pulse";
export const WebsiteLastName = "Companion AI";
export const WebsiteName = `${WebsiteFirstName} ${WebsiteLastName}`;
export const WebsiteNameResponsive = `${WebsiteFirstName}\n${WebsiteLastName}`;
export const DEVELOPERNAME = "Novyex";
export const DEVELOPER_WEBSITE = "https://novyex.blogspot.com/";
export const WEBSITE_URL = "https://orchid-eagle-536690.hostingersite.com/";

// Device Dimensions
export const { height, width } = Dimensions.get("window");

// Font Sizes (Responsive)
const baseSize = width >= height ? 30 : 24;
export const ButtonTextSize = baseSize >= 16 ? baseSize / 2 : baseSize;
export const TitleTextSize = baseSize >= 48 ? 48 : baseSize * 2.5;
export const TextSize = baseSize >= 20 ? 20 : baseSize * 1.25;

// Icon Size
export const ICONSIZE = width >= height ? height * 0.05 : width * 0.075;

// Theme Colors
export const THEMECOLOR = "#143f6c";
export const THEMECOLORITEMS = "#184f81";
export const BACKGROUND_COLOR = "#ffffff";
export const TEXT_PRIMARY = "#222";
export const TEXT_SECONDARY = "#444";
export const TEXT_TERTIARY = "#FFF";

// Contact Info
export const OfficeContactNumber = "+91 89800 09157";
export const OfficeEmailOne = "admin@iasandco.in";
export const OfficeEmailTwo = "iasandco@icai.org";
export const OfficeAddress =
  "Second Floor, Platinum Landmark Complex, Himatnagar - Vijapur Hwy, nr. Prabhat Heart and Gynec Hospital, Brahmani Nagar, Husainabad, Rangpur Village, Mehtapura, Savgadh, Himatnagar, Gujarat 383220";

// External Links
export const MAPSLINK =
  "https://www.google.com/maps/dir//Second+Floor,+I+A+S+and+Co,+Platinum+Landmark+Complex,+Himatnagar+-+Vijapur+Hwy,+nr.+Prabhat+Heart+and+Gynec+Hospital,+Brahmani+Nagar,+Savgadh,+Himatnagar,+Gujarat+383220/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x395db9dfcda5a67d:0xbf0cbc6e2d69c23f?sa=X&ved=1t:57443&ictx=111";


export const FA = "https://www.facebook.com/irshad.sabugar/";
export const WA = "https://wa.me/+918980009157";
export const INSTA = "https://www.instagram.com/sabugarirshad";
export const TWITTER = "https://x.com/ias_co";
export const LINKEDIN = "https://www.linkedin.com/in/ias-and-co-02738234b/";
export const BASE_CARD_WIDTH = width > height ? width * 0.45 : width - 20;
export const BIG_CARD_WIDTH = BASE_CARD_WIDTH * 2 + 10;
export const PAGEBACKGROUNDCOLOR = "#EEE";
export const ComponentMaxWidth = width > height ? BIG_CARD_WIDTH : width - 20

export const AboutUsTitle = `${WebsiteName}`;
export const AboutUsSubtitle = "Empowering Your Financial Success: Comprehensive, strategic financial guidance and compliance solutions that drive business growth, enhance banking performance, and support government organizational excellence.";

export const ServicesPageTitle = "What We Offer";
export const ServicesPageSubtitle = "Explore our range of reliable Chartered Accountancy services designed to simplify your financial journey.";

export const ContactUsPageTitle = "🤝 Your Trusted Financial Partner";
export const ContactUsPageSubtitle = `Transforming financial challenges into strategic opportunities for businesses across Gujarat—${WebsiteName} brings over 20 years of chartered accounting expertise to drive your success.`;

export const BULLET_POINT = "• ";

export const gotToAboutUs = (navigation) => {
  navigation.navigate("AboutUs");
}