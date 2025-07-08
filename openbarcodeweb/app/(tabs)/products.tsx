import { StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ui/ProductCard';

export default function ProductsScreen() {
  const { products, loading, error, refetch } = useProducts();

  if (loading && !products.length) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Products</ThemedText>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
});
