import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { CuratedBook } from './libraryData';

type Props = {
  book: CuratedBook;
};

const COVER_WIDTH = 100;
const COVER_HEIGHT = 148;

export function LibraryCuratedBook({ book }: Props) {
  const theme = useTheme();

  return (
    <View style={{ width: COVER_WIDTH, marginRight: theme.spacing.md }}>
      <View
        style={{
          width: COVER_WIDTH,
          height: COVER_HEIGHT,
          borderRadius: theme.radius.sm,
          backgroundColor: book.coverColor,
          padding: theme.spacing.sm,
          justifyContent: 'flex-end',
        }}
      >
        <Text
          variant="caption"
          style={{
            color: theme.color.text.inverse,
            fontWeight: '700',
            lineHeight: 14,
            marginBottom: 4,
          }}
          numberOfLines={3}
        >
          {book.title}
        </Text>
        <Text
          variant="caption"
          style={{
            color: theme.color.text.inverseSubtle,
            fontStyle: 'italic',
            fontSize: 10,
            lineHeight: 12,
          }}
          numberOfLines={2}
        >
          {book.author}
        </Text>
      </View>
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs, textAlign: 'center' }}>
        {book.available ? 'Available' : 'On hold'}
      </Text>
    </View>
  );
}
