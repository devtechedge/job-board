import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { PublicJob } from "../lib/types";
import { ago, atsLabel, workplaceLabel } from "../lib/format";
import { colors, fonts } from "../lib/theme";
import { CompanyMark } from "./CompanyMark";

export function JobRow({ job }: { job: PublicJob }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/job/${job.id}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>
      <View style={styles.meta}>
        <CompanyMark name={job.company.name} logoUrl={job.company.logo_url} size={16} />
        <Text style={styles.company} numberOfLines={1}>
          {job.company.name}
          {job.location_raw ? ` · ${workplaceLabel(job.workplace)}` : ""}
        </Text>
      </View>
      <View style={styles.foot}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{atsLabel(job.source_ats).toUpperCase()}</Text>
        </View>
        <Text style={styles.ago}>{ago(job.last_seen_at)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    gap: 6,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 22,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  company: { flex: 1, color: colors.muted, fontSize: 13, fontFamily: fonts.sans },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: { fontSize: 10, letterSpacing: 0.6, color: colors.muted, fontFamily: fonts.sans },
  ago: { fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
});
