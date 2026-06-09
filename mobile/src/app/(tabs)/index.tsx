import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { api } from '../../../services/api';
import { Product, useCartStore } from '../../../store/cartStore';

const PAGE_SIZE = 10;

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const { addItem } = useCartStore();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await api.get(`/products?${params}`);
      setProducts(res.products);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.category} numberOfLines={1}>
          {item.categories?.name || 'Uncategorized'}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => addItem(item)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const from = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, pagination.total);

  const renderPagination = () => {
    if (pagination.total === 0) return null;

    return (
      <View style={styles.pagination}>
        <Text style={styles.paginationInfo}>
          {from}–{to} of {pagination.total}
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            onPress={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={20} color={page <= 1 ? '#d1d5db' : '#374151'} />
          </TouchableOpacity>
          <Text style={styles.pageText}>
            Page {page} of {pagination.totalPages}
          </Text>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              page >= pagination.totalPages && styles.pageBtnDisabled,
            ]}
            onPress={() => handlePageChange(page + 1)}
            disabled={page >= pagination.totalPages}
          >
            <ChevronRight
              size={20}
              color={page >= pagination.totalPages ? '#d1d5db' : '#374151'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
          ListFooterComponent={renderPagination}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f3f4f6',
  },
  cardInfo: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    minHeight: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  addButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  pagination: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    gap: 12,
  },
  paginationInfo: {
    fontSize: 13,
    color: '#6b7280',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: '#374151',
    minWidth: 100,
    textAlign: 'center',
  },
});
