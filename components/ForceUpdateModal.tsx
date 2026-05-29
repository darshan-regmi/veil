import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Linking,
  Platform,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS, SPACING, RADIUS, LIGHT_COLORS } from "@/constants/theme";

interface Props {
  visible: boolean;
  message: string;
  iosUrl: string;
  androidUrl: string;
}

const ForceUpdateModal = memo(function ForceUpdateModal({
  visible,
  message,
  iosUrl,
  androidUrl,
}: Props) {
  const insets = useSafeAreaInsets();
  const colors = LIGHT_COLORS;

  const downloadUrl = Platform.OS === "ios" ? iosUrl : androidUrl;

  const handleDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { paddingBottom: Math.max(insets.bottom, SPACING["2xl"]) },
          ]}
        >
          <View style={styles.iconWrap}>
            <Feather name="download" size={32} color={colors.accent} />
          </View>

          <Text style={styles.heading}>Update Available</Text>

          <Text style={styles.body}>{message}</Text>

          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.downloadBtn,
              pressed && styles.downloadBtnPressed,
            ]}
          >
            <Feather name="download-cloud" size={16} color={colors.onInk} />
            <Text style={styles.downloadBtnText}>Download Latest Version</Text>
          </Pressable>

          <Text style={styles.hint}>
            Tap the button above to get the latest version of Veil.
          </Text>
        </View>
      </View>
    </Modal>
  );
});

export default ForceUpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING["2xl"],
  },
  card: {
    width: "100%",
    backgroundColor: LIGHT_COLORS.bg,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING["2xl"],
    paddingTop: SPACING["3xl"],
    paddingBottom: SPACING["2xl"],
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LIGHT_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    fontWeight: "700",
    color: LIGHT_COLORS.ink,
    letterSpacing: -0.4,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: LIGHT_COLORS.meta,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING["2xl"],
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: LIGHT_COLORS.ink,
    paddingVertical: 14,
    paddingHorizontal: SPACING["2xl"],
    borderRadius: RADIUS.md,
    width: "100%",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  downloadBtnPressed: {
    opacity: 0.8,
  },
  downloadBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: "700",
    color: LIGHT_COLORS.onInk,
    letterSpacing: 0.2,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: LIGHT_COLORS.metaLight,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 18,
  },
});
