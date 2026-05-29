import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LIGHT_COLORS, FONTS } from "@/constants/theme";
import type { PoemNote } from "@/utils/storage";

interface Props {
  poem: PoemNote;
  onReady?: () => void;
}

// ShareCard always renders against the light palette — sharing dark cards
// to Instagram/etc looks weird and reduces legibility on third-party feeds.
const ShareCard = forwardRef<View, Props>(function ShareCard(
  { poem, onReady },
  ref
) {
  return (
    <View
      ref={ref}
      collapsable={false}
      style={styles.card}
      onLayout={() => onReady?.()}
    >
      <View style={styles.rule} />
      <Text style={styles.title}>{poem.title}</Text>
      <Text style={styles.body}>{poem.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>VEIL</Text>
        <Text style={styles.footerRight}>by Darshan Regmi</Text>
      </View>
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    width: 1080,
    minHeight: 1350,
    padding: 96,
    backgroundColor: LIGHT_COLORS.bg,
  },
  rule: {
    width: 56,
    height: 4,
    backgroundColor: LIGHT_COLORS.accent,
    marginBottom: 48,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 64,
    lineHeight: 76,
    color: LIGHT_COLORS.ink,
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: 48,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 36,
    lineHeight: 60,
    color: LIGHT_COLORS.inkSecondary,
    fontWeight: "400",
    marginBottom: 96,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: LIGHT_COLORS.hairline,
    paddingTop: 32,
  },
  footerLeft: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: LIGHT_COLORS.ink,
    fontWeight: "700",
    letterSpacing: 4,
  },
  footerRight: {
    fontFamily: FONTS.italic,
    fontSize: 24,
    color: LIGHT_COLORS.meta,
    fontWeight: "400",
  },
});
