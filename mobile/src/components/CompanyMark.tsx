import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { initials } from "../lib/format";
import { colors, fonts } from "../lib/theme";

export function CompanyMark({
  name,
  logoUrl,
  size = 22,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.15);
  if (!logoUrl || failed) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: radius },
        ]}
      >
        <Text style={[styles.initials, { fontSize: Math.max(8, size * 0.38) }]}>{initials(name)}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: logoUrl }}
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.inset }}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inset,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
  },
  initials: { color: colors.ink, fontFamily: fonts.sans, fontWeight: "600" },
});
