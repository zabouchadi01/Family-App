import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GroceryItem, LoadingState } from '../types';
import { colors, typography, shadows, borderRadius } from '../theme/colors';

interface Props {
  items: GroceryItem[];
  state: LoadingState;
  error?: string;
  onToggleCheck: (item: GroceryItem) => void;
  onMarkComplete: (taskId: string, checked: boolean) => void;
  onClearCompleted: () => void;
}

export function GroceryWidget({
  items,
  state,
  error,
  onToggleCheck,
  onMarkComplete,
  onClearCompleted,
}: Props) {
  const completedCount = items.filter((item) => item.isActive && item.checked).length;
  const activeCount = items.filter((item) => item.isActive).length;

  const renderItem = ({ item }: { item: GroceryItem }) => {
    const isOnList = item.isActive || false;
    const isCompleted = item.checked && isOnList;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleCheck(item)}
          activeOpacity={0.7}
        >
          <Icon
            name={isOnList ? 'checkbox' : 'square-outline'}
            size={24}
            color={isOnList ? colors.primary : '#666'}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.itemName,
            isCompleted && styles.itemNameChecked,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {isOnList && item.taskId && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onMarkComplete(item.taskId!, !item.checked)}
            activeOpacity={0.7}
          >
            <Icon
              name={isCompleted ? 'checkmark-done-circle' : 'checkmark-circle-outline'}
              size={24}
              color={isCompleted ? '#4CAF50' : '#999'}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (state === 'loading' && items.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (state === 'error' && items.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error || 'Failed to load grocery checklist'}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            {activeCount} {activeCount === 1 ? 'item' : 'items'} on list
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No grocery items available</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={styles.list}
              scrollEnabled={false}
            />

            {completedCount > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={onClearCompleted}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>
                  Clear {completedCount} completed {completedCount === 1 ? 'item' : 'items'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Grocery List</Text>
        {state === 'loading' && items.length > 0 && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        )}
      </View>
      {renderContent()}
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
    color: '#999',
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
    ...typography.body,
    color: '#E53935',
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  list: {
    maxHeight: 400,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  itemNameChecked: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  completeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
