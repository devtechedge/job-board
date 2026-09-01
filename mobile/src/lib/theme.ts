import { Platform, StyleSheet } from "react-native";

export const colors = {
  paper: "#E3E8EE",
  ink: "#10151C",
  pine: "#1F6B4A",
  pineFg: "#E3E8EE",
  rule: "#C2CCD6",
  ruleStrong: "#96A3B0",
  muted: "#58636E",
  inset: "#D5DCE4",
  chip: "#CCD4DC",
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
