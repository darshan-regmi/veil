import React, { useRef, useEffect, useCallback, useState, useMemo, memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Easing,
  StatusBar,
  Platform,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FONTS,
  SPACING,
  RADIUS,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, type ThemeScheme } from "@/contexts/ThemeContext";
import type { ReadingStats } from "@/utils/readingHistory";

const SIDEBAR_WIDTH = 340;
const PROFILE_IMAGE_SIZE = 76;

const PROFILE = {
  image: "https://poetry.darshanregmi.com.np/author.jpg",
  name: "Darshan Regmi",
  title: "Developer & Poet",
  bio: "Just a guy who looks older than he is, writes poems for feelings he can't explain, and codes things nobody asked for. Want to know more? Go full stalker mode or put your detective hat on.",
  location: "Pokhara, Nepal",
  instagram: "@bydarshanregmi",
  instagramUrl: "https://instagram.com/bydarshanregmi",
  instagram_personal: "@_darshan_regmi",
  instagramUrl_personal: "https://instagram.com/_darshan_regmi",
  poetryCollectionUrl: "https://poetry.darshanregmi.com.np/",
  portfolio: "darshanregmi.com.np",
  portfolioUrl: "https://darshanregmi.com.np",
  github: "@darshan-regmi",
  githubUrl: "https://github.com/darshan-regmi",
  email: "darshanregmi.official@gmail.com",
};

const THEME_OPTIONS: { key: ThemeScheme; label: string }[] = [
  { key: "system", label: "Auto" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

const SocialLink = memo(function SocialLink({
  icon,
  label,
  url,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  url: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const handlePress = useCallback(async () => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else Alert.alert("Error", "Unable to open this link");
    } catch {
      Alert.alert("Error", "Failed to open link");
    }
  }, [url]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.socialLink,
        pressed && styles.socialLinkPressed,
      ]}
      onPress={handlePress}
      android_ripple={{ color: colors.ripple, borderless: false }}
    >
      <Feather name={icon} size={16} color={colors.ink} />
      <Text style={styles.socialLabel} numberOfLines={1}>
        {label}
      </Text>
      <Feather name="arrow-up-right" size={14} color={colors.meta} />
    </Pressable>
  );
});

const StatColumn = ({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <View style={styles.statColumn}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ThemePicker = ({
  scheme,
  setScheme,
  styles,
}: {
  scheme: ThemeScheme;
  setScheme: (s: ThemeScheme) => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <View style={styles.segmented}>
    {THEME_OPTIONS.map((opt, i) => {
      const active = scheme === opt.key;
      return (
        <Pressable
          key={opt.key}
          onPress={() => setScheme(opt.key)}
          style={({ pressed }) => [
            styles.segment,
            i !== 0 && styles.segmentBorder,
            active && styles.segmentActive,
            pressed && !active && styles.segmentPressed,
          ]}
        >
          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

interface AboutSidebarProps {
  visible: boolean;
  onClose: () => void;
  readingStats?: ReadingStats;
}

const AboutSidebar = ({ visible, onClose, readingStats }: AboutSidebarProps) => {
  const insets = useSafeAreaInsets();
  const { colors, scheme, setScheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [mountVisible, setMountVisible] = useState(visible);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMountVisible(true);
      slideAnim.setValue(-SIDEBAR_WIDTH);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setMountVisible(false));
    }
  }, [visible, slideAnim, opacityAnim]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!mountVisible) return null;

  return (
    <Modal
      visible={mountVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar
        backgroundColor={colors.overlay}
        barStyle="light-content"
        animated
      />
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
        ]}
      >
        <View style={styles.sidebarInner}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + SPACING.lg },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.eyebrow}>ABOUT</Text>
              <Pressable
                onPress={handleClose}
                hitSlop={10}
                style={({ pressed }) => pressed && { opacity: 0.5 }}
              >
                <Feather name="x" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.profileSection}>
              <Image
                source={{ uri: PROFILE.image }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              <Text style={styles.name}>{PROFILE.name}</Text>
              <Text style={styles.role}>{PROFILE.title}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={colors.meta} />
                <Text style={styles.locationText}>{PROFILE.location}</Text>
              </View>
            </View>

            {readingStats && (
              <>
                <Text style={styles.sectionEyebrow}>READING</Text>
                <View style={styles.statsRow}>
                  <StatColumn label="This week" value={String(readingStats.thisWeek)} styles={styles} />
                  <View style={styles.statSep} />
                  <StatColumn label="Streak" value={`${readingStats.streak}d`} styles={styles} />
                  <View style={styles.statSep} />
                  <StatColumn label="Total read" value={String(readingStats.totalRead)} styles={styles} />
                </View>
              </>
            )}

            <Text style={styles.sectionEyebrow}>APPEARANCE</Text>
            <ThemePicker scheme={scheme} setScheme={setScheme} styles={styles} />
            <Text style={styles.appearanceHint}>
              Auto follows your device's light/dark setting.
            </Text>

            <Text style={styles.sectionEyebrow}>BIO</Text>
            <Text style={styles.bio}>
              <Text style={styles.dropCap}>{PROFILE.bio.charAt(0)}</Text>
              {PROFILE.bio.slice(1)}
            </Text>

            <Text style={styles.sectionEyebrow}>CONNECT</Text>
            <SocialLink icon="instagram" label={PROFILE.instagram} url={PROFILE.instagramUrl} />
            <SocialLink icon="instagram" label={PROFILE.instagram_personal} url={PROFILE.instagramUrl_personal} />
            <SocialLink icon="book" label="Poetry Collection" url={PROFILE.poetryCollectionUrl} />
            <SocialLink icon="globe" label={PROFILE.portfolio} url={PROFILE.portfolioUrl} />
            <SocialLink icon="github" label={PROFILE.github} url={PROFILE.githubUrl} />
            <SocialLink icon="mail" label="Email" url={`mailto:${PROFILE.email}`} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={handleClose}
              android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: false }}
            >
              <Feather name="arrow-left" size={16} color={colors.onInk} />
              <Text style={styles.closeButtonText}>BACK TO LIBRARY</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default AboutSidebar;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    sidebar: {
      position: "absolute",
      top: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      height: "100%",
      ...Platform.select({
        ios: {
          shadowColor: "#0A0A0A",
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
        },
        android: { elevation: 12 },
      }),
    },
    sidebarInner: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      paddingHorizontal: SPACING["2xl"],
      paddingBottom: 140,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xl,
    },
    eyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.meta,
    },
    sectionEyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.meta,
      marginTop: SPACING["2xl"],
      marginBottom: SPACING.md,
    },
    profileSection: {
      alignItems: "flex-start",
      marginBottom: SPACING.md,
    },
    profileImage: {
      width: PROFILE_IMAGE_SIZE,
      height: PROFILE_IMAGE_SIZE,
      borderRadius: PROFILE_IMAGE_SIZE / 2,
      marginBottom: SPACING.md,
      backgroundColor: colors.hairline,
    },
    name: {
      fontFamily: FONTS.bold,
      fontSize: 26,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.4,
    },
    role: {
      fontFamily: FONTS.italic,
      fontSize: 14,
      color: colors.meta,
      marginTop: 2,
      fontWeight: "400",
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: SPACING.sm,
    },
    locationText: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.meta,
      fontWeight: "400",
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "stretch",
      paddingVertical: SPACING.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.hairline,
    },
    statColumn: {
      flex: 1,
      alignItems: "center",
    },
    statSep: {
      width: 1,
      backgroundColor: colors.hairline,
    },
    statValue: {
      fontFamily: FONTS.bold,
      fontSize: 22,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.3,
    },
    statLabel: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      color: colors.meta,
      letterSpacing: 0.6,
      marginTop: 2,
      textTransform: "uppercase",
      fontWeight: "400",
    },
    segmented: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colors.hairline,
      borderRadius: RADIUS.md,
      overflow: "hidden",
    },
    segment: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
    },
    segmentBorder: {
      borderLeftWidth: 1,
      borderLeftColor: colors.hairline,
    },
    segmentActive: {
      backgroundColor: colors.ink,
    },
    segmentPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    segmentText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.ink,
      fontWeight: "400",
    },
    segmentTextActive: {
      color: colors.onInk,
      fontFamily: FONTS.bold,
      fontWeight: "700",
    },
    appearanceHint: {
      fontFamily: FONTS.italic,
      fontSize: 12,
      color: colors.meta,
      marginTop: SPACING.sm,
      fontWeight: "400",
    },
    bio: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.inkSecondary,
      lineHeight: 24,
      fontWeight: "400",
    },
    dropCap: {
      fontFamily: FONTS.bold,
      fontSize: 36,
      color: colors.accent,
      fontWeight: "700",
      lineHeight: 36,
    },
    socialLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    socialLinkPressed: {
      opacity: 0.5,
    },
    socialLabel: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.ink,
      fontWeight: "400",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: SPACING["2xl"],
      paddingTop: SPACING.lg,
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    closeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      backgroundColor: colors.ink,
      paddingVertical: 14,
      borderRadius: RADIUS.md,
    },
    closeButtonPressed: {
      opacity: 0.85,
    },
    closeButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.onInk,
      fontWeight: "700",
      letterSpacing: 0.8,
    },
  });
