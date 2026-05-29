import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { refreshPoemsFromNotion } from "./storage";

export const BACKGROUND_FETCH_TASK = "veil-poem-check";

// defineTask must be called at module level before the app renders
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const result = await refreshPoemsFromNotion();
    return result.source === "network"
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetch = async (): Promise<void> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes — iOS may run it less often
        stopOnTerminate: false,   // Android: keep running after app is closed
        startOnBoot: true,        // Android: restart after device reboot
      });
    }
  } catch {}
};
