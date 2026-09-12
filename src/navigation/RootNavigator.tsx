import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/state/authStore';
import { MainTabs } from './MainTabs';
import { MeStack } from './MeStack';
import { LoginScreen } from '@/screens/auth';
import { SessionDetailScreen } from '@/screens/today/SessionDetailScreen';
import { NotificationsScreen } from '@/screens/me/NotificationsScreen';
import { NotificationDetailScreen } from '@/screens/me/NotificationDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Account sheet. No native header — Me home draws its own chrome.
 */
const ACCOUNT_SHEET = {
  headerShown: false,
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  sheetAllowedDetents: [1],
} as const;

/**
 * Inbox sheet: same presentation, empty title so iOS does not paint a large
 * title over the list. Native headers inside a form sheet size the body to
 * zero on iOS; the inbox draws its own chrome instead.
 */
const INBOX_SHEET = {
  ...ACCOUNT_SHEET,
  headerLargeTitleEnabled: false,
  title: '',
} as const;

/**
 * Account is a form sheet, so iOS draws the system grabber. Android's modal
 * fallback has none — paint the same notch so the overlay still reads as a
 * sheet on both platforms.
 */
function AccountOverlay() {
  return (
    <View style={styles.sheetRoot}>
      <MeStack />
      {Platform.OS === 'android' ? (
        <View pointerEvents="none" style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>
      ) : null}
    </View>
  );
}

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          {/*
            Transparent modal hosts the shared expand surface above tabs.
            Visible motion is geometry-driven (not a stack push animation).
          */}
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailScreen}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'none',
              gestureEnabled: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          {/*
            Account / profile. Formerly the "Me" tab; now opened from the Home
            header and presented as a sheet above the tabs. The grabber is
            native on iOS (`sheetGrabberVisible`); Android paints one.
            MeStack keeps its in-screen headers; swipe-down dismisses.
          */}
          <Stack.Screen name="Account" component={AccountOverlay} options={ACCOUNT_SHEET} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={INBOX_SHEET} />
          <Stack.Screen
            name="NotificationDetail"
            component={NotificationDetailScreen}
            options={INBOX_SHEET}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  sheetRoot: {
    flex: 1,
  },
  grabberWrap: {
    position: 'absolute',
    top: 8,
    right: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
  },
});
