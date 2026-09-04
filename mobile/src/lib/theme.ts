import { Platform, StyleSheet } from "react-native";

export const colors = {
  paper: "#FAFBFC",
  ink: "#10151C",
  pine: "#1F6B4A",
  pineFg: "#FAFBFC",
  rule: "#E5EAEF",
  ruleStrong: "#B9C2CD",
  muted: "#58636E",
  inset: "#F3F6F9",
  chip: "#EEF2F6",
} as const;

export const fonts = {
  serif: Platform.select({ ios: "Iowan Old Style", android: "serif", default: "Georgia" }) as string,
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "System" }) as string,
};

export const layout = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  pad: { paddingHorizontal: 16 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.rule },
  ruleStrong: { height: StyleSheet.hairlineWidth, backgroundColor: colors.ink },
});
