import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Template = (title: string) => { title: string; body: string };

const TEMPLATES: Template[] = [
  (t) => ({ title: "New poem in the collection", body: `"${t}" just arrived. Be sure to read it — hope you love it.` }),
  (t) => ({ title: "Something new for you", body: `"${t}" has been added. Pull up a quiet moment and dive in.` }),
  (t) => ({ title: "Fresh words, just for you", body: `A new poem called "${t}" is waiting. Hope it moves you.` }),
  (t) => ({ title: "The collection just grew", body: `"${t}" is here. Take a few minutes and let it sink in.` }),
  (t) => ({ title: "New poem alert", body: `"${t}" was just added. Give it a read when you get a moment.` }),
  (t) => ({ title: "A new poem awaits", body: `"${t}" has found its way into the collection. Hope you enjoy it.` }),
  (t) => ({ title: "Worth a read", body: `"${t}" just dropped. We think you'll like this one.` }),
  (t) => ({ title: "New addition to Veil", body: `"${t}" is live. Set aside a minute — it's worth it.` }),
  (t) => ({ title: "Poetry, fresh off the press", body: `"${t}" is now in your collection. Hope it resonates.` }),
  (t) => ({ title: "A new poem is here", body: `"${t}" just landed. Take a slow read whenever you're ready.` }),
  (t) => ({ title: "Your collection just expanded", body: `"${t}" has been added. We hope it speaks to you.` }),
  (t) => ({ title: "New words waiting for you", body: `"${t}" is now part of the collection. Enjoy.` }),
  (t) => ({ title: "Freshly written for you", body: `"${t}" just made its way in. Be sure to read it.` }),
  (t) => ({ title: "One more poem in your world", body: `"${t}" is here. Hope it brightens your day a little.` }),
  (t) => ({ title: "New poem, just added", body: `"${t}" is waiting in the collection. Take it slow.` }),
  (t) => ({ title: "Something to sit with", body: `"${t}" just joined the collection. Hope it stays with you.` }),
  (t) => ({ title: "A poem arrived", body: `"${t}" is now in Veil. Be sure to give it a read.` }),
  (t) => ({ title: "The library just got richer", body: `"${t}" was just added. Hope you find something in it.` }),
  (t) => ({ title: "New poem for a quiet moment", body: `"${t}" is here whenever you're ready. Hope you like it.` }),
  (t) => ({ title: "We wrote something for you", body: `"${t}" just made it into the collection. Enjoy every word.` }),
  (t) => ({ title: "New poem just dropped", body: `"${t}" is now live. Find a moment and let it breathe.` }),
  (t) => ({ title: "Fresh poem in your collection", body: `"${t}" is waiting for you. We hope it hits home.` }),
  (t) => ({ title: "Something new to read", body: `"${t}" just joined Veil. Take a moment — it's worth your time.` }),
  (t) => ({ title: "A new poem for you", body: `"${t}" has arrived. Read it slowly. Hope you love it.` }),
  (t) => ({ title: "New poem added", body: `"${t}" is in the collection now. Be sure to check it out.` }),
  (t) => ({ title: "Just added to Veil", body: `"${t}" is live. A little piece of something for your day.` }),
  (t) => ({ title: "Your next read is here", body: `"${t}" just landed. Hope it's exactly what you needed.` }),
  (t) => ({ title: "Poem drop 🖊", body: `"${t}" just joined the collection. Hope you enjoy reading it.` }),
  (t) => ({ title: "New poem, new feeling", body: `"${t}" is here. Read it when the moment feels right.` }),
  (t) => ({ title: "A fresh poem awaits", body: `"${t}" was just added to Veil. Hope it means something to you.` }),
];

const pickTemplate = (title: string): { title: string; body: string } => {
  const idx = Math.floor(Math.random() * TEMPLATES.length);
  return TEMPLATES[idx](title);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleNewPoemNotification = async (poemTitle: string): Promise<void> => {
  if (Platform.OS === "web") return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;
  const { title, body } = pickTemplate(poemTitle);
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
};
