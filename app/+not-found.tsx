import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { BookOpen, Home } from "lucide-react-native";

/* ─── Constants ───────────────────────────────────────────── */
const COLORS = {
  background: "#FAF7F0",
  primary: "#8B5A3C",
  textPrimary: "#2D2D2D",
  textSecondary: "#A0A0A0",
  surface: "#FFFFFF",
  border: "#E8E2D5",
} as const;

/* ─── NotFound Screen ─────────────────────────────────────── */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Page Not Found",
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <BookOpen size={64} color={COLORS.primary} strokeWidth={1.5} />

          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.description}>
            The page you're looking for doesn't exist or has been moved.
          </Text>

          <Link href="/" asChild>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go to home screen"
            >
              <Home size={20} color={COLORS.surface} strokeWidth={1.5} />
              <Text style={styles.buttonText}>Go to Library</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "LibreBaskerville-Bold",
    color: COLORS.surface,
  },
});
