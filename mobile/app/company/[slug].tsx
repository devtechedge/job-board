import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { fetchCompany } from "../../src/lib/api";
import { ago, atsLabel, n } from "../../src/lib/format";
import type { PublicCompany, PublicJob } from "../../src/lib/types";
import { colors, fonts, layout } from "../../src/lib/theme";
import { CompanyMark } from "../../src/components/CompanyMark";
import { ErrorState } from "../../src/components/ErrorState";
import { JobRow } from "../../src/components/JobRow";

export default function CompanyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      const body = await fetchCompany(slug);
      setCompany(body.company);
      setJobs(body.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Company not found.");
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!company) return <Text style={styles.loading}>Loading board…</Text>;

  return (
    <ScrollView style={layout.screen} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <CompanyMark name={company.name} logoUrl={company.logo_url} size={40} />
        <Text style={styles.name}>{company.name}</Text>
      </View>
      <Text style={styles.meta}>
        {atsLabel(company.ats)} · {n(company.open_count)} US tech
        {company.listed_count != null ? ` · ${n(company.listed_count)} listed` : ""} · last ok{" "}
        {ago(company.last_ok_at)}
      </Text>
      <View style={styles.facts}>
        <Fact label="HQ focus" value={company.hq_country} />
        <Fact label="Careers" value={company.careers_url ? "Open board" : "—"} href={company.careers_url} />
        <Fact label="Site" value={company.website ? "Open site" : "—"} href={company.website} />
      </View>
      <Text style={styles.section}>Open US tech</Text>
      {jobs.map((job) => (
        <JobRow key={job.id} job={job} />
      ))}
    </ScrollView>
  );
}

function Fact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
}) {
  const inner = (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label.toUpperCase()}</Text>
      <Text style={[styles.factValue, href ? { color: colors.pine } : null]}>{value}</Text>
    </View>
  );
  if (!href) return inner;
  return (
    <Pressable
      onPress={() => {
        if (href.startsWith("https:")) void WebBrowser.openBrowserAsync(href);
      }}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  loading: { padding: 16, color: colors.muted, fontFamily: fonts.sans },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flex: 1, fontFamily: fonts.serif, fontSize: 28, fontWeight: "600", color: colors.ink },
  meta: { marginTop: 10, fontSize: 13, color: colors.muted, fontFamily: fonts.sans },
  facts: {
    marginTop: 16,
    backgroundColor: colors.inset,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
    padding: 12,
    gap: 10,
  },
  fact: { gap: 4 },
  factLabel: { fontSize: 11, letterSpacing: 1, color: colors.muted, fontFamily: fonts.sans },
  factValue: { fontSize: 14, color: colors.ink, fontFamily: fonts.sans },
  section: {
    marginTop: 28,
    marginBottom: 8,
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
});
