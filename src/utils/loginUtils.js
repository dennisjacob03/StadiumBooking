import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Method 1: Using named export (recommended)
const recordLoginActivity = async (userId, type) => {
  if (!userId) return;

  try {
    const loginRef = doc(db, "login", `${userId}_${Date.now()}`);
    await setDoc(loginRef, {
      userId: userId,
      type: type, // 'login' or 'logout'
      timestamp: serverTimestamp(),
      userType: localStorage.getItem("userType") || "user",
    });
  } catch (error) {
    console.error(`Error recording ${type} activity:`, error);
    throw error;
  }
};

export { recordLoginActivity }; // Named export
// or
export default recordLoginActivity; // Default export

// If you want to add more utility functions later:
export const someOtherFunction = () => {
  // ...
};
