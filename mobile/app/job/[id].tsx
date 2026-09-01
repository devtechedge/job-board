import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchJob } from "../../src/lib/api";
import { ago, atsLabel, workplaceLabel } from "../../src/lib/format";
import { isWatched, toggleWatched } from "../../src/lib/watchlist";
import type { PublicJob } from "../../src/lib/types";
import { colors, fonts, layout } from "../../src/lib/theme";
import { ApplyButton } from "../../src/components/ApplyButton";
import { CompanyMark } from "../../src/components/CompanyMark";
import { ErrorState } from "../../src/components/ErrorState";

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const body = await fetchJob(id);
      setJob(body.job);
      setWatched(await isWatched(body.job.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role not found.");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!job) return <Text style={styles.loading}>Loading role…</Text>;

  return (
    <ScrollView style={layout.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.push(`/company/${job.company.slug}`)}>
        <View style={styles.companyRow}>
          <CompanyMark name={job.company.name} logoUrl={job.company.logo_url} size={22} />
          <Text style={styles.company}>{job.company.name}</Text>
        </View>
      </Pressable>
      <Text style={styles.title}>{job.title}</Text>
      <View style={styles.facts}>
        <Fact label="Pay" value={job.salary_label} />
        <Fact label="Workplace" value={workplaceLabel(job.workplace)} />
        <Fact label="Location" value={job.location_raw || "—"} />
        <Fact label="Role" value={job.seniority || "—"} />
        <Fact label="Last seen" value={ago(job.last_seen_at)} />
        <Fact label="Board" value={atsLabel(job.source_ats)} />
      </View>
      {job.salary_source === "inferred" ? (
        <Text style={styles.note}>~ pay inferred from posting text.</Text>
      ) : null}
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <ApplyButton url={job.apply_url} company={job.company.name} />
        </View>
        <Pressable
          onPress={async () => {
            const next = await toggleWatched({
              id: job.id,
              title: job.title,
              company: job.company.name,
              href: `/jobs/${job.id}`,
            });
            setWatched(next.some((row) => row.id === job.id));
          }}
          style={styles.watch}
        >
          <Text style={styles.watchText}>{watched ? "Watching" : "Watchlist"}</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionKicker}>SUMMARY</Text>
      <Text style={styles.summary}>{job.summary || job.title}</Text>
      {job.skills.length ? (
        <View style={styles.skills}>
          {job.skills.map((skill) => (
            <View key={skill} style={styles.skill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Posting</Text>
      <Text style={styles.posting}>
        {job.description_text || "Open the employer board for the full posting."}
      </Text>
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  loading: { padding: 16, color: colors.muted, fontFamily: fonts.sans },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  company: { color: colors.muted, fontSize: 15, fontFamily: fonts.sans },
  title: {
    marginTop: 10,
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 34,
  },
  facts: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.inset,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
    padding: 8,
  },
  fact: { width: "50%", padding: 8 },
  factLabel: { fontSize: 11, letterSpacing: 1, color: colors.muted, fontFamily: fonts.sans },
  factValue: { marginTop: 4, fontSize: 14, color: colors.ink, fontFamily: fonts.sans },
  note: { marginTop: 8, fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
  actions: { flexDirection: "row", gap: 8, marginTop: 16 },
  watch: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ruleStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  watchText: { fontSize: 14, color: colors.ink, fontFamily: fonts.sans },
  sectionKicker: { marginTop: 28, fontSize: 11, letterSpacing: 1.4, color: colors.muted, fontFamily: fonts.sans },
  summary: { marginTop: 8, fontSize: 16, lineHeight: 24, color: colors.ink, fontFamily: fonts.sans },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  skill: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.rule, paddingHorizontal: 8, paddingVertical: 3 },
  skillText: { fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
  sectionTitle: { marginTop: 28, fontFamily: fonts.serif, fontSize: 22, fontWeight: "600", color: colors.ink },
  posting: { marginTop: 12, fontSize: 15, lineHeight: 23, color: colors.ink, fontFamily: fonts.sans },
});
