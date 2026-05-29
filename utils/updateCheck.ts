import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface UpdateConfig {
  forceUpdate: boolean;
  iosUrl: string;
  androidUrl: string;
  message: string;
}

const FALLBACK: UpdateConfig = {
  forceUpdate: false,
  iosUrl: "",
  androidUrl: "",
  message: "A new version of Veil is available. Please reinstall to get the latest experience.",
};

export const checkForUpdate = async (): Promise<UpdateConfig> => {
  try {
    const snap = await getDoc(doc(db, "config", "update"));
    if (!snap.exists()) return FALLBACK;
    return { ...FALLBACK, ...(snap.data() as Partial<UpdateConfig>) };
  } catch {
    return FALLBACK;
  }
};
