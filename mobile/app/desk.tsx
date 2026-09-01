import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { postDesk } from "../src/lib/api";
import { colors, fonts, layout } from "../src/lib/theme";

export default function DeskScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setStatus(null);
    try {
      const result = await postDesk({ name, email, body, listingUrl });
      setStatus(
        result.ok
          ? "Filed. We read the desk; this is not an application."
          : (result.error ?? "Could not file the note."),
      );
      if (result.ok) {
        setBody("");
        setListingUrl("");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not file the note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={layout.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.lede}>
        Corrections and legal notes only. Applications go to the employer ATS — never here.
      </Text>
      <Label text="Name">
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </Label>
      <Label text="Email">
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Label>
      <Label text="Listing URL (optional)">
        <TextInput
          style={styles.input}
          value={listingUrl}
          onChangeText={setListingUrl}
          autoCapitalize="none"
          placeholder="https://"
          placeholderTextColor={colors.muted}
        />
      </Label>
      <Label text="Note">
        <TextInput
          style={[styles.input, styles.area]}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </Label>
      <Pressable disabled={busy} onPress={submit} style={[styles.submit, busy && { opacity: 0.6 }]}>
        <Text style={styles.submitText}>{busy ? "Filing…" : "File note"}</Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  );
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{text.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  lede: { fontSize: 14, lineHeight: 20, color: colors.muted, fontFamily: fonts.sans },
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
  area: { minHeight: 120 },
  submit: {
    backgroundColor: colors.pine,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.pineFg, fontWeight: "600", fontFamily: fonts.sans },
  status: { fontSize: 14, color: colors.ink, fontFamily: fonts.sans },
});
