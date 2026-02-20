import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface PageIndicatorProps {
  pageCount: number;
  currentPage: number;
}

export function PageIndicator({ pageCount, currentPage }: PageIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: pageCount }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === currentPage ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: colors.appBackground,
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.textSecondary,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.divider,
  },
});
