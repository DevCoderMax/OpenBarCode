import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { ThemedText } from '@/components/ThemedText';
import { getFirstImage, getThumbnailUrl } from '@/utils/imageUtils';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const borderColor = useThemeColor({}, 'border');

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const firstImage = getFirstImage(product.images);
  const thumbUrl = firstImage ? getThumbnailUrl(firstImage, 100, 100, 60) : undefined;

  return (
    <TouchableOpacity onPress={handlePress}>
      <ThemedView style={[styles.card, { borderColor }]}>
        {firstImage ? (
          <Image
            source={{ uri: thumbUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}
        <View style={styles.infoContainer}>
          <ThemedText type="subtitle" numberOfLines={1}>{product.name}</ThemedText>
          <ThemedText style={styles.brandText}>{product.brand?.name || 'No brand'}</ThemedText>
          <View style={styles.detailsRow}>
            <ThemedText style={styles.detailText}>
              {product.measure_value} {product.measure_type?.toUpperCase()}
            </ThemedText>
            <ThemedText style={styles.detailText}>
              Qtd: {product.qtt}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
