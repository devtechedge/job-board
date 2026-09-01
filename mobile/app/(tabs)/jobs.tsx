import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchJobs } from "../../src/lib/api";
import { n } from "../../src/lib/format";
import {
  ATS_FILTERS,
  FUNCTIONS,
  POSTED_WINDOWS,
  SENIORITIES,
  SORTS,
  WORKPLACES,
  type JobQuery,
  type JobsResponse,
} from "../../src/lib/types";
import { colors, fonts, layout } from "../../src/lib/theme";
import { ErrorState } from "../../src/components/ErrorState";
import { JobRow } from "../../src/components/JobRow";

const empty: JobQuery = { q: "", fn: "", seniority: "", workplace: "", location: "", posted: "", ats: "", sort: "last_seen", page: 1 };

export default function IndexScreen() {
  const params = useLocalSearchParams<{ fn?: string }>();
  const [filters, setFilters] = useState<JobQuery>({ ...empty, fn: params.fn ?? "" });
  const [openFilters, setOpenFilters] = useState(Boolean(params.fn));
  const [data, setData] = useState<JobsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const query = useMemo(() => filters, [filters]);

  const load = useCallback(async (next: JobQuery) => {
    try {
      setError(null);
      setData(await fetchJobs(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the index.");
    }
  }, []);

  useEffect(() => {
    void load(query);
  }, [load, query]);

  useEffect(() => {
    if (params.fn && params.fn !== filters.fn) {
      setFilters((prev) => ({ ...prev, fn: params.fn, page: 1 }));
    }
  }, [params.fn, filters.fn]);

  async function onRefresh() {
    setRefreshing(true);
    await load(query);
    setRefreshing(false);
  }

  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 40)));

  function patch(partial: Partial<JobQuery>) {
    setFilters((prev) => ({ ...prev, ...partial, page: partial.page ?? 1 }));
  }

  return (
    <ScrollView
      style={layout.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.lede}>{n(data?.total ?? 0)} open</Text>
      <Pressable onPress={() => setOpenFilters((v) => !v)} style={styles.toggle}>
        <Text style={styles.toggleText}>{openFilters ? "Hide filters" : "Show filters"}</Text>
      </Pressable>
      {openFilters ? (
        <View style={styles.filters}>
          <Field label="Query">
            <TextInput
              style={styles.input}
              placeholder="Title, company, or skill"
              placeholderTextColor={colors.muted}
              value={filters.q ?? ""}
              onChangeText={(q) => patch({ q })}
              autoCorrect={false}
            />
          </Field>
          <Select label="Function" value={filters.fn ?? ""} options={FUNCTIONS} onChange={(fn) => patch({ fn })} />
          <Select label="Seniority" value={filters.seniority ?? ""} options={SENIORITIES} onChange={(seniority) => patch({ seniority })} />
          <Select label="Workplace" value={filters.workplace ?? ""} options={WORKPLACES} onChange={(workplace) => patch({ workplace })} />
          <Field label="Location">
            <TextInput
              style={styles.input}
              placeholder="City or US"
              placeholderTextColor={colors.muted}
              value={filters.location ?? ""}
              onChangeText={(location) => patch({ location })}
              autoCorrect={false}
            />
          </Field>
          <Select label="First seen" value={filters.posted ?? ""} options={POSTED_WINDOWS} onChange={(posted) => patch({ posted })} labels={{ "1d": "1 day", "3d": "3 days", "7d": "7 days", "14d": "14 days", "30d": "30 days" }} />
          <Select label="Board" value={filters.ats ?? ""} options={ATS_FILTERS} onChange={(ats) => patch({ ats })} />
          <Select label="Sort" value={filters.sort ?? "last_seen"} options={SORTS} onChange={(sort) => patch({ sort })} allowEmpty={false} labels={{ last_seen: "Last seen", first_seen: "First seen", salary: "Salary", title: "Title" }} />
          <Pressable onPress={() => setFilters({ ...empty })}>
            <Text style={styles.clear}>Clear search and filters</Text>
          </Pressable>
        </View>
      ) : null}
      {error ? <ErrorState message={error} onRetry={() => load(query)} /> : null}
      {data?.jobs.map((job) => (
        <JobRow key={job.id} job={job} />
      ))}
      {data ? (
        <View style={styles.pager}>
          <Pressable disabled={data.page <= 1} onPress={() => patch({ page: data.page - 1 })}>
            <Text style={[styles.pageLink, data.page <= 1 && styles.disabled]}>Previous</Text>
          </Pressable>
          <Text style={styles.pageLabel}>
            Page {data.page} / {pages}
          </Text>
          <Pressable disabled={data.page >= pages} onPress={() => patch({ page: data.page + 1 })}>
            <Text style={[styles.pageLink, data.page >= pages && styles.disabled]}>Next</Text>
          </Pressable>
        </View>
      ) : !error ? (
        <Text style={styles.loading}>Loading the index…</Text>
      ) : null}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  labels,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labels?: Record<string, string>;
  allowEmpty?: boolean;
}) {
  const items = allowEmpty ? ["", ...options] : [...options];
  return (
    <Field label={label}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {items.map((item) => {
          const active = value === item;
          const title = item === "" ? "Any" : labels?.[item] ?? item;
          return (
            <Pressable
              key={item || "any"}
              onPress={() => onChange(item)}
              style={[styles.chip, active && styles.chipOn]}
            >
              <Text style={[styles.chipText, active && styles.chipTextOn]}>{title}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Field>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  lede: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, marginBottom: 8 },
  toggle: { marginBottom: 12 },
  toggleText: { color: colors.pine, fontSize: 13, fontFamily: fonts.sans },
  filters: { gap: 12, marginBottom: 16, padding: 12, backgroundColor: colors.inset },
  field: { gap: 6 },
  label: { fontSize: 11, letterSpacing: 1, color: colors.muted, fontFamily: fonts.sans },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  chips: { gap: 6 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ruleStrong, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.paper },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 12, color: colors.ink, fontFamily: fonts.sans },
  chipTextOn: { color: colors.paper },
  clear: { color: colors.muted, fontSize: 13, fontFamily: fonts.sans },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20 },
  pageLink: { color: colors.pine, fontSize: 14, fontFamily: fonts.sans },
  disabled: { color: colors.ruleStrong },
  pageLabel: { color: colors.muted, fontSize: 13, fontFamily: fonts.sans },
  loading: { color: colors.muted, marginTop: 16, fontFamily: fonts.sans },
});
