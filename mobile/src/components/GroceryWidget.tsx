import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GroceryItem, LoadingState } from '../types';
import { colors, shadows, borderRadius, spacing } from '../theme/colors';

type GroceryCategory = 'produce' | 'dairy' | 'protein' | 'pantry' | 'frozen' | 'other';

const CATEGORY_CONFIG: Record<
  GroceryCategory,
  { label: string; icon: string }
> = {
  produce: { label: 'PRODUCE', icon: 'leaf-outline' },
  dairy: { label: 'DAIRY', icon: 'water-outline' },
  protein: { label: 'PROTEIN', icon: 'flame-outline' },
  pantry: { label: 'PANTRY', icon: 'cube-outline' },
  frozen: { label: 'FROZEN', icon: 'snow-outline' },
  other: { label: 'OTHER', icon: 'ellipsis-horizontal' },
};

const CATEGORY_ORDER: GroceryCategory[] = [
  'produce',
  'dairy',
  'protein',
  'pantry',
  'frozen',
  'other',
];

function getCategoryColors(category: string) {
  const key = category?.toLowerCase() as GroceryCategory;
  return colors.groceryCategory[key] || colors.groceryCategory.other;
}

interface Props {
  items: GroceryItem[];
  state: LoadingState;
  error?: string;
  onItemTap: (item: GroceryItem) => void;
}

export function GroceryWidget({
  items,
  state,
  error,
  onItemTap,
}: Props) {
  const neededCount = useMemo(
    () => items.filter(i => i.isActive && !i.checked).length,
    [items],
  );

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    for (const item of items) {
      const cat = (item.category || 'other').toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    // Sort items within each category: needed first, then inactive
    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => {
        const stateOrder = (i: GroceryItem) => i.isActive ? 0 : 1;
        return stateOrder(a) - stateOrder(b);
      });
    }

    return groups;
  }, [items]);

  const summaryBackground = useMemo(() => {
    if (neededCount === 0) return colors.statusBackgrounds.normal;
    if (neededCount <= 5) return colors.statusBackgrounds.caution;
    return colors.statusBackgrounds.alert;
  }, [neededCount]);

  // --- Rendering ---

  if (state === 'loading' && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Grocery List</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.todayAccent} />
        </View>
      </View>
    );
  }

  if (state === 'error' && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Grocery List</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error || 'Failed to load grocery checklist'}
          </Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Grocery List</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="cart-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>No items in your pantry</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Grocery List</Text>
        {state === 'loading' && items.length > 0 && (
          <ActivityIndicator
            size="small"
            color={colors.todayAccent}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {/* Hero Summary */}
      <View style={[styles.heroContainer, { backgroundColor: summaryBackground }]}>
        <Text style={styles.heroNumber}>{neededCount}</Text>
        <Text style={styles.heroLabel}>
          {neededCount === 1 ? 'item to get' : 'items to get'}
        </Text>
      </View>

      <View style={styles.heroDivider} />

      {/* Category Sections */}
      <View style={styles.categoriesContainer}>
        {CATEGORY_ORDER.map(categoryKey => {
          const categoryItems = groupedByCategory[categoryKey];
          if (!categoryItems || categoryItems.length === 0) return null;

          const config = CATEGORY_CONFIG[categoryKey];
          const catColors = getCategoryColors(categoryKey);

          return (
            <View key={categoryKey} style={styles.categorySection}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <Icon
                  name={config.icon}
                  size={16}
                  color={catColors.accent}
                  style={styles.categoryIcon}
                />
                <Text style={[styles.categoryLabel, { color: catColors.accent }]}>
                  {config.label}
                </Text>
              </View>

              {/* Chip Grid */}
              <View style={styles.chipGrid}>
                {categoryItems.map(item => {
                  const isNeeded = item.isActive;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        isNeeded ? {
                          backgroundColor: catColors.tint,
                          borderColor: catColors.accent,
                          borderWidth: 1.5,
                        } : {
                          backgroundColor: colors.cardBackground,
                          borderColor: catColors.accent,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => onItemTap(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isNeeded ? {
                            fontWeight: '600',
                            color: colors.textPrimary,
                          } : {
                            color: colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    ...shadows.card,
    overflow: 'hidden',
  },
  labelContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  centerContent: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.trafficRed,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Hero Summary
  heroContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: '200',
    lineHeight: 56,
    color: colors.textPrimary,
    fontFamily: 'Helvetica',
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Chip Grid
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
  },

});
