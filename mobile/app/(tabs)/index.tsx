import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchHome } from "../../src/lib/api";
import { ago, functionLabel, n } from "../../src/lib/format";
import type { HomeResponse } from "../../src/lib/types";
import { colors, fonts, layout } from "../../src/lib/theme";
import { CompanyMark } from "../../src/components/CompanyMark";
import { ErrorState } from "../../src/components/ErrorState";
import { JobRow } from "../../src/components/JobRow";
import { Wordmark } from "../../src/components/Wordmark";
import { API_BASE } from "../../src/lib/config";

export default function RegisterScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchHome({ page: 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load jobs.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const digest = data?.digest;

  return (
    <ScrollView
      style={layout.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.mast}>
        <Wordmark size={28} />
        <Text style={styles.tag}>Still open.</Text>
      </View>
      {error ? <ErrorState message={`${error}\nAPI: ${API_BASE}`} onRetry={load} /> : null}
      {digest ? (
        <>
          <View style={styles.dateRule} />
          <View style={styles.dateRow}>
            <Text style={styles.kicker}>{digest.editionLabel.toUpperCase()}</Text>
            <Text style={styles.count}>
              {n(digest.openCount)} open · {digest.companyCount} companies
            </Text>
          </View>
          <View style={styles.grid}>
            <Kpi label="Open" value={n(digest.openCount)} />
            <Kpi label="Companies" value={n(digest.companyCount)} />
            <Kpi label="New in 24h" value={n(digest.freshCount)} />
            <Kpi
              label="Added / closed"
              value={`${n(digest.lastWindowOpened)} / ${n(digest.lastWindowClosed)}`}
              extra={digest.lastWindowAt ? ago(digest.lastWindowAt) : null}
            />
          </View>
          <Section title="Latest" action="Search" onAction={() => router.push("/jobs")}>
            {data?.jobs.slice(0, 8).map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </Section>
          <Section title="Functions" action="Search" onAction={() => router.push("/jobs")}>
            {digest.functions.map((item) => (
              <Pressable
                key={item.fn}
                onPress={() => router.push({ pathname: "/jobs", params: { fn: item.fn } })}
                style={styles.pair}
              >
                <Text style={styles.pairLabel}>{functionLabel(item.fn)}</Text>
                <Text style={styles.pairValue}>{n(item.n)}</Text>
              </Pressable>
            ))}
          </Section>
          <Section title="Companies" action={String(digest.companyCount)} onAction={() => router.push("/companies")}>
            {digest.boards.map((board) => (
              <Pressable
                key={board.slug}
                onPress={() => router.push(`/company/${board.slug}`)}
                style={styles.pair}
              >
                <View style={styles.boardLeft}>
                  <CompanyMark name={board.name} logoUrl={board.logo_url} size={18} />
                  <Text style={styles.pairLabel}>{board.name}</Text>
                </View>
                <Text style={styles.pairValue}>{n(board.open_count)}</Text>
              </Pressable>
            ))}
          </Section>
        </>
      ) : !error ? (
        <Text style={styles.loading}>Loading jobs…</Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.footNote}>Public listings. Not an employer.</Text>
        <Pressable onPress={() => router.push("/desk")}>
          <Text style={styles.footLink}>Contact</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Kpi({ label, value, extra }: { label: string; value: string; extra?: string | null }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {extra ? <Text style={styles.kpiExtra}>{extra}</Text> : null}
    </View>
  );
}

function Section({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  mast: { gap: 4, marginBottom: 16 },
  tag: { fontFamily: fonts.serif, fontStyle: "italic", color: colors.muted, fontSize: 15 },
  dateRule: { height: 2, backgroundColor: colors.ink, marginBottom: 10 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  kicker: { fontSize: 11, letterSpacing: 1.2, color: colors.muted, flex: 1, fontFamily: fonts.sans },
  count: { fontFamily: fonts.serif, fontSize: 13, color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.rule },
  kpi: {
    width: "50%",
    padding: 14,
    borderColor: colors.rule,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kpiLabel: { fontSize: 11, letterSpacing: 1, color: colors.muted, fontFamily: fonts.sans },
  kpiValue: { marginTop: 8, fontFamily: fonts.serif, fontSize: 28, fontWeight: "600", color: colors.ink },
  kpiExtra: { marginTop: 6, fontSize: 12, color: colors.muted },
  section: { marginTop: 28 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 24, fontWeight: "600", color: colors.ink },
  sectionAction: { color: colors.muted, fontSize: 13, fontFamily: fonts.sans },
  pair: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  boardLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  pairLabel: { fontSize: 14, color: colors.ink, fontFamily: fonts.sans },
  pairValue: { fontSize: 14, color: colors.ink, fontVariant: ["tabular-nums"], fontFamily: fonts.sans },
  loading: { color: colors.muted, marginTop: 24, fontFamily: fonts.sans },
  footer: { marginTop: 36, alignItems: "center", gap: 8 },
  footNote: { fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
  footLink: { fontSize: 13, color: colors.pine, fontFamily: fonts.sans },
});
