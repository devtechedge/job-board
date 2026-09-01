import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../lib/theme";

export function Wordmark({ size = 22 }: { size?: number }) {
  const bar = Math.max(10, size * 0.9);
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={[styles.hash, { width: bar, height: bar }]}>
        <View style={[styles.h, { top: bar * 0.22 }]} />
        <View style={[styles.h, { top: bar * 0.46 }]} />
        <View style={[styles.h, { top: bar * 0.7 }]} />
        <View style={styles.v} />
      </View>
      <Text style={[styles.word, { fontSize: size }]}>Jobrow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  hash: { position: "relative" },
  h: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.ink,
  },
  v: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "46%",
    width: 2.4,
    backgroundColor: colors.pine,
  },
  word: { fontFamily: fonts.serif, fontWeight: "600", color: colors.ink, letterSpacing: -0.3 },
});
