import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors, fonts } from "../../src/lib/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: fonts.sans,
        fontSize: 11,
        letterSpacing: 0.4,
        color: focused ? colors.pine : colors.muted,
        fontWeight: focused ? "600" : "400",
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: "600" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.rule,
          height: 58,
        },
        tabBarShowLabel: true,
        tabBarIconStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobrow",
          tabBarLabel: ({ focused }) => <TabLabel label="Jobs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Search",
          tabBarLabel: ({ focused }) => <TabLabel label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Companies",
          tabBarLabel: ({ focused }) => <TabLabel label="Companies" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Saved",
          tabBarLabel: ({ focused }) => <TabLabel label="Saved" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
