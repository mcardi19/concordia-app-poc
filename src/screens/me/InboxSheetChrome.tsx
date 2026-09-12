import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { HeaderBackButton } from '@/navigation/HeaderBackButton';
import { HeaderCloseButton } from '@/navigation/HeaderCloseButton';
import { HEADER_CHROME_HORIZONTAL_INSET } from '@/navigation/HeaderIconButton';

/** Air below the system grabber — the sheet is already below the status bar. */
const SHEET_GRABBER_GAP = 12;

type Props = {
  title: string;
  onClose?: () => void;
  onBack?: () => void;
};

/**
 * In-sheet chrome. Native headers inside a form sheet collapse the body, and a
 * third sibling next to the list ScrollView trips RNScreens' two-subview
 * limit — so this is the header child, with `collapsable={false}`.
 */
export function InboxSheetChrome({ title, onClose, onBack }: Props) {
  const theme = useTheme();

  return (
    <View collapsable={false} style={styles.bar}>
      {onClose ? <HeaderCloseButton onPress={onClose} /> : null}
      {onBack ? <HeaderBackButton onPress={onBack} /> : null}
      <Text
        variant="body"
        numberOfLines={1}
        style={[styles.title, { color: theme.color.text.primary }]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: SHEET_GRABBER_GAP,
    paddingBottom: 8,
    paddingHorizontal: HEADER_CHROME_HORIZONTAL_INSET,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '600',
  },
});
