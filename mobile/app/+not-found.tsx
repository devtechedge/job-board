import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../src/lib/theme";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.box}>
        <Text style={styles.title}>That page is not on the register.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Jobrow</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  link: { alignSelf: "flex-start" },
  linkText: { color: colors.pine, fontFamily: fonts.sans, fontSize: 15 },
});
