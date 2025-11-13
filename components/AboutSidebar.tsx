import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StatusBar,
  Platform,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

/* ─── Constants ───────────────────────────────────────────── */
const DIMENSIONS = {
  sidebarWidth: 340,
  profileImageSize: 84,
} as const;

const COLORS = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
  primary: "#8B5A3C",
  primaryLight: "#A67C52",
  textPrimary: "#2D2D2D",
  textSecondary: "#A0A0A0",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.45)",
  accent: "#D46A6A",
  glass: "rgba(255, 255, 255, 0.65)",
  bioAccent: "#F5EEDF",
  subtleShadow: "rgba(139,90,60,0.08)",
} as const;

const PROFILE = {
  image: "https://poetry.darshanregmi.com.np/author.jpg",
  name: "Darshan Regmi",
  title: "Developer & Poet",
  bio: "Just a guy who looks older than he is, writes poems for feelings he can't explain, and codes things nobody asked for. Want to know more? Go full stalker mode or put your detective hat on.",
  location: "Pokhara, Nepal 🇳🇵",
  instagram: "@bydarshanregmi",
  instagramUrl: "https://instagram.com/bydarshanregmi",
  instagram_personal: "@_darshan_regmi",
  instagramUrl_personal: "https://instagram.com/_darshan_regmi",
  poetryCollection: "poetry.darshanregmi.com.np",
  poetryCollectionUrl: "https://poetry.darshanregmi.com.np/",
  portfolio: "darshanregmi.com.np",
  portfolioUrl: "https://darshanregmi.com.np",
  github: "@darshan-regmi",
  githubUrl: "https://github.com/darshan-regmi",
  emailName: "Email",
  email: "darshanregmi.official@gmail.com",
};

const STATS = [
  { icon: "feather", label: "Poems", value: "200+" },
  { icon: "heart", label: "Readers", value: "1K+" },
  { icon: "book-open", label: "Collections", value: "2" },
];

/* ─── Social Link ───────────────────────────────────────────── */
const SocialLink = ({
  icon,
  label,
  url,
}: {
  icon: string;
  label: string;
  url: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.socialLink}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.socialIconContainer}>
          <Feather name={icon as any} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.socialLinkText}>{label}</Text>
        <Feather name="external-link" size={15} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── Stat Item ───────────────────────────────────────────── */
const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.statItem}>
    <View style={styles.statIconContainer}>
      <Feather name={icon as any} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ─── Main Sidebar ───────────────────────────────────────────── */
const AboutSidebar = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [mountVisible, setMountVisible] = useState(visible);

  const slideAnim = useRef(
    new Animated.Value(-DIMENSIONS.sidebarWidth)
  ).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    if (visible) {
      setMountVisible(true);
      slideAnim.setValue(-DIMENSIONS.sidebarWidth);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.97);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 330,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DIMENSIONS.sidebarWidth,
          duration: 230,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.97,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMountVisible(false);
      });
    }
  }, [visible, slideAnim, opacityAnim, scaleAnim]);

  if (!mountVisible) return null;

  return (
    <Modal
      visible={mountVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar
        backgroundColor={COLORS.overlay}
        barStyle="light-content"
        animated
      />
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.modalOverlay, { opacity: opacityAnim }]}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sidebarWrapper,
          {
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <BlurView intensity={75} tint="light" style={styles.sidebarBlur}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <View>
                <Text style={styles.sidebarTitle}>About</Text>
                <Text style={styles.sidebarSubtitle}>The Writer</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={26} color={COLORS.primaryLight} />
              </TouchableOpacity>
            </View>
            {/* Profile */}
            <View style={styles.profileSection}>
              <Image
                source={{ uri: PROFILE.image }}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{PROFILE.name}</Text>
              <Text style={styles.profileTitle}>{PROFILE.title}</Text>
              <View style={styles.locationContainer}>
                <Feather name="map-pin" size={15} color={COLORS.primaryLight} />
                <Text style={styles.locationText}>{PROFILE.location}</Text>
              </View>
            </View>
            {/* Stats */}
            <View style={styles.statsContainer}>
              {STATS.map((s, i) => (
                <React.Fragment key={s.label}>
                  <StatItem {...s} />
                  {i !== STATS.length - 1 && <View style={styles.statSep} />}
                </React.Fragment>
              ))}
            </View>
            {/* Bio */}
            <View style={styles.bioSection}>
              <View style={styles.bioAccentBar} />
              <Text style={styles.bioText}>{PROFILE.bio}</Text>
            </View>
            {/* Social Links */}
            <Text style={styles.socialLinksTitle}>Connect</Text>
            <SocialLink
              icon="instagram"
              label={PROFILE.instagram}
              url={PROFILE.instagramUrl}
            />
            <SocialLink
              icon="instagram"
              label={PROFILE.instagram_personal}
              url={PROFILE.instagramUrl_personal}
            />
            <SocialLink
              icon="book"
              label="Poetry Collection"
              url={PROFILE.poetryCollectionUrl}
            />
            <SocialLink
              icon="globe"
              label={PROFILE.portfolio}
              url={PROFILE.portfolioUrl}
            />
            <SocialLink
              icon="github"
              label={PROFILE.github}
              url={PROFILE.githubUrl}
            />
            <SocialLink
              icon="mail"
              label={PROFILE.emailName}
              url={`mailto:${PROFILE.email}`}
            />
          </ScrollView>
          {/* Footer */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="arrow-left" size={18} color={COLORS.white} />
              <Text style={styles.closeButtonText}>Back to Library</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

/* ─── Styles ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
  },
  sidebarWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DIMENSIONS.sidebarWidth,
    height: "100%",
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  sidebarBlur: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRightWidth: 1,
    borderColor: "#A67C5233",
  },
  scrollContent: {
    paddingTop: Platform.select({ ios: 70, android: 50 }),
    paddingBottom: 140,
    paddingHorizontal: 26,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  sidebarTitle: {
    fontSize: 26,
    color: COLORS.primary,
    fontFamily: "LibreBaskerville-Bold",
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: DIMENSIONS.profileImageSize,
    height: DIMENSIONS.profileImageSize,
    borderRadius: DIMENSIONS.profileImageSize / 2,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 23,
    color: COLORS.textPrimary,
    fontFamily: "LibreBaskerville-Bold",
  },
  profileTitle: {
    fontSize: 15,
    color: COLORS.primaryLight,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.bioAccent,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  statItem: { flex: 1, alignItems: "center" },
  statSep: {
    width: 1.5,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 17,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bioSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  bioAccentBar: {
    width: 4,
    height: "90%",
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginRight: 12,
  },
  bioText: {
    fontSize: 15.5,
    color: COLORS.textPrimary,
    lineHeight: 24,
    flex: 1,
  },
  socialLinksTitle: {
    fontSize: 17,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 13,
  },
  socialIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  socialLinkText: {
    flex: 1,
    fontSize: 15.5,
    color: COLORS.textPrimary,
  },
  sidebarFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: COLORS.glass,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: "LibreBaskerville-Bold",
    marginLeft: 8,
  },
});

export default AboutSidebar;
