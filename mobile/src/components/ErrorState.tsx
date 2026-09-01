import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../lib/theme";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, gap: 12 },
  text: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  retry: { alignSelf: "flex-start", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.pine },
  retryText: { color: colors.pine, fontSize: 14, fontFamily: fonts.sans },
});
