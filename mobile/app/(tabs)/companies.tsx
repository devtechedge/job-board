import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fetchCompanies } from "../../src/lib/api";
import { ago, atsLabel, n } from "../../src/lib/format";
import type { PublicCompany } from "../../src/lib/types";
import { colors, fonts, layout } from "../../src/lib/theme";
import { CompanyMark } from "../../src/components/CompanyMark";
import { ErrorState } from "../../src/components/ErrorState";

export default function CompaniesScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<PublicCompany[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const body = await fetchCompanies();
      setRows(body.companies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load companies.");
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

  return (
    <ScrollView
      style={layout.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.lede}>{n(rows?.length ?? 0)} companies</Text>
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {rows?.map((company) => (
        <Pressable
          key={company.slug}
          onPress={() => router.push(`/company/${company.slug}`)}
          style={styles.row}
        >
          <CompanyMark name={company.name} logoUrl={company.logo_url} size={28} />
          <View style={styles.body}>
            <Text style={styles.name}>{company.name}</Text>
            <Text style={styles.meta}>
              {atsLabel(company.ats)} · {n(company.open_count)} US tech
              {company.listed_count != null ? ` · ${n(company.listed_count)} listed` : ""}
            </Text>
          </View>
          <Text style={styles.ago}>{ago(company.last_ok_at)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  lede: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: colors.ink, fontFamily: fonts.sans },
  meta: { marginTop: 2, fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
  ago: { fontSize: 11, color: colors.muted, fontFamily: fonts.sans },
});
