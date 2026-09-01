import { Alert, Pressable, StyleSheet, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { colors, fonts } from "../lib/theme";

export function ApplyButton({ url, company }: { url: string; company: string }) {
  async function open() {
    if (!url.startsWith("https://")) {
      Alert.alert("Cannot apply", "This listing has no public https apply URL.");
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  }
  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
      accessibilityRole="link"
      accessibilityLabel={`Apply at ${company}`}
    >
      <Text style={styles.label}>Apply  ↗</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.pine,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: { color: colors.pineFg, fontFamily: fonts.sans, fontWeight: "600", fontSize: 15 },
});
