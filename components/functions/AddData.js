import { addDoc, collection } from "firebase/firestore";
import { productsData } from "../productsData";
import db from "../../firebase";

export const uploadProductsToFirestore = async () => {
    const productsCollection = collection(db, 'products'); // Replace 'products' with your Firestore collection name
  
    // Iterate over the productsData array and add each product to Firestore
    for (const product of productsData) {
      try {
        await addDoc(productsCollection, product); // Pass the individual product object here
        console.log(`Product with ID ${product.id} uploaded successfully.`);
      } catch (error) {
        console.error(`Error uploading product with ID ${product.id}: `, error);
      }
    }
};
