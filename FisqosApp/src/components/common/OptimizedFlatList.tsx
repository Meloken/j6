import React, { memo, useCallback, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: ReadonlyArray<T>;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReachedThreshold?: number;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactElement;
  contentContainerStyle?: ViewStyle;
  loadingContainerStyle?: ViewStyle;
  emptyContainerStyle?: ViewStyle;
  loadingMoreContainerStyle?: ViewStyle;
}

function OptimizedFlatListComponent<T>(props: OptimizedFlatListProps<T>) {
  const {
    data,
    renderItem,
    keyExtractor,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    onEndReachedThreshold = 0.5,
    onEndReached,
    isLoadingMore = false,
    emptyText = 'Veri bulunamadı',
    emptyIcon,
    contentContainerStyle,
    loadingContainerStyle,
    emptyContainerStyle,
    loadingMoreContainerStyle,
    ...rest
  } = props;
  
  const { theme } = useTheme();
  
  // Öğe render fonksiyonu
  const renderItemMemoized = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );
  
  // Anahtar çıkarıcı fonksiyon
  const keyExtractorMemoized = useCallback(
    (item: T, index: number) => keyExtractor(item, index),
    [keyExtractor]
  );
  
  // Yenileme kontrolü
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
    />
  ) : undefined;
  
  // Liste sonu bileşeni
  const ListFooterComponent = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={[styles.loadingMoreContainer, loadingMoreContainerStyle]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    return null;
  }, [isLoadingMore, theme.colors.primary, loadingMoreContainerStyle]);
  
  // Boş liste bileşeni
  const ListEmptyComponent = useCallback(() => {
    if (isLoading) return null;
    
    return (
      <View style={[styles.emptyContainer, emptyContainerStyle]}>
        {emptyIcon}
        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
          {emptyText}
        </Text>
      </View>
    );
  }, [isLoading, emptyIcon, emptyText, theme.colors.text.secondary, emptyContainerStyle]);
  
  // Yükleniyor durumu
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, loadingContainerStyle]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <FlatList
      data={data}
      renderItem={renderItemMemoized}
      keyExtractor={keyExtractorMemoized}
      refreshControl={refreshControl}
      onEndReachedThreshold={onEndReachedThreshold}
      onEndReached={onEndReached}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[
        styles.contentContainer,
        !data.length && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Memoize edilmiş bileşen
const OptimizedFlatList = memo(OptimizedFlatListComponent) as typeof OptimizedFlatListComponent;

export default OptimizedFlatList;
