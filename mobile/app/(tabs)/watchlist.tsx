import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { listWatched, toggleWatched, type Watched } from "../../src/lib/watchlist";
import { colors, fonts, layout } from "../../src/lib/theme";

export default function WatchlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Watched[]>([]);

  const reload = useCallback(() => {
    void listWatched().then(setItems);
  }, []);

  useFocusEffect(reload);

  return (
    <ScrollView style={layout.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lede}>
        {items.length} saved · local only · max 200
      </Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>
          Watch a role from its page. Nothing leaves this device — there is no account.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Pressable style={styles.body} onPress={() => router.push(`/job/${item.id}`)}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.company}>{item.company}</Text>
            </Pressable>
            <Pressable
              onPress={async () => setItems(await toggleWatched(item))}
              hitSlop={8}
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  lede: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, marginBottom: 12 },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 20, fontFamily: fonts.sans },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    alignItems: "flex-start",
  },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: colors.ink, fontFamily: fonts.sans },
  company: { marginTop: 4, fontSize: 13, color: colors.muted, fontFamily: fonts.sans },
  remove: { color: colors.muted, fontSize: 12, fontFamily: fonts.sans },
});
