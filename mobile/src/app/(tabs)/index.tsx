import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react-native';
import { api } from '../../../services/api';
import { Product, useCartStore } from '../../../store/cartStore';

const PAGE_SIZE = 10;
const ADDED_FEEDBACK_MS = 5000;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySection {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

export default function ShopScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const { addItem } = useCartStore();
  const listRef = useRef<FlatList>(null);
  const addedTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  const isSearchMode = debouncedSearch.length > 0;
  const isGroupedView = !isSearchMode && selectedCategory === 'all';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    return () => {
      addedTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      addedTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.categories);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const buildGroupedSections = useCallback(
    (items: Product[]) => {
      const bySlug = new Map<string, Product[]>();

      items.forEach((product) => {
        const slug = product.categories?.slug ?? 'uncategorized';
        const list = bySlug.get(slug) ?? [];
        list.push(product);
        bySlug.set(slug, list);
      });

      const sections: CategorySection[] = categories
        .map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          products: bySlug.get(category.slug) ?? [],
        }))
        .filter((section) => section.products.length > 0);

      const uncategorized = bySlug.get('uncategorized');
      if (uncategorized?.length) {
        sections.push({
          id: 'uncategorized',
          name: 'Other',
          slug: 'uncategorized',
          products: uncategorized,
        });
      }

      return sections;
    },
    [categories]
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      if (isGroupedView) {
        const res = await api.get('/products?limit=100');
        setGroupedProducts(buildGroupedSections(res.products));
        setProducts([]);
        setPagination({ total: res.pagination.total, totalPages: 1 });
        return;
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (!isSearchMode && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      const res = await api.get(`/products?${params}`);
      setProducts(res.products);
      setGroupedProducts([]);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    selectedCategory,
    isSearchMode,
    isGroupedView,
    buildGroupedSections,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const handleAddToCart = (item: Product) => {
    addItem(item);

    const existingTimeout = addedTimeoutsRef.current.get(item.id);
    if (existingTimeout) clearTimeout(existingTimeout);

    setAddedProductIds((prev) => new Set(prev).add(item.id));

    const timeout = setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      addedTimeoutsRef.current.delete(item.id);
    }, ADDED_FEEDBACK_MS);

    addedTimeoutsRef.current.set(item.id, timeout);
  };

  const renderProductCard = (item: Product) => {
    const isAdded = addedProductIds.has(item.id);

    return (
      <View key={item.id} style={styles.card}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.addButton, isAdded && styles.addButtonAdded]}
              onPress={() => handleAddToCart(item)}
              accessibilityLabel={`Add ${item.name} to cart`}
            >
              {isAdded ? (
                <Check size={18} color="#16a34a" />
              ) : (
                <ShoppingCart size={18} color="#2563eb" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProductRow = ({ item }: { item: Product }) => renderProductCard(item);

  const renderProductGrid = (items: Product[]) => {
    const rows: Product[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }

    return rows.map((row, index) => (
      <View key={`row-${index}`} style={styles.columnWrapper}>
        {row.map((product) => renderProductCard(product))}
        {row.length === 1 ? <View style={styles.cardSpacer} /> : null}
      </View>
    ));
  };

  const from = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, pagination.total);

  const renderPagination = () => {
    if (isGroupedView || pagination.total === 0) return null;

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

  const categoryChips = useMemo(
    () => [
      { id: 'all', name: 'All', slug: 'all' },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
    ],
    [categories]
  );

  const hasResults = isGroupedView
    ? groupedProducts.length > 0
    : products.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {!isSearchMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categoryChips.map((category) => {
              const active = selectedCategory === category.slug;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => handleCategorySelect(category.slug)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : !hasResults ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        ) : isGroupedView ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {groupedProducts.map((section) => (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                  <Text style={styles.sectionCount}>
                    {section.products.length} item{section.products.length === 1 ? '' : 's'}
                  </Text>
                </View>
                {renderProductGrid(section.products)}
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProductRow}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderPagination}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#f9fafb',
    zIndex: 1,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
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
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  columnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardSpacer: {
    width: '48%',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonAdded: {
    backgroundColor: '#dcfce7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
