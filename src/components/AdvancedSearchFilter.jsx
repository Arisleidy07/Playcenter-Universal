import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star,
  DollarSign,
  Package,
  Truck,
  Tag,
  Calendar,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';

const AdvancedSearchFilter = ({
  products = [],
  categories = [],
  onFilteredResults,
  onSearchChange,
  className = ''
}) => {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: '', max: '' },
    rating: 0,
    inStock: false,
    onSale: false,
    freeShipping: false,
    brands: [],
    tags: [],
    dateRange: { start: '', end: '' }
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: false,
    availability: false,
    brands: false,
    tags: false,
    date: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');

  // Derived data
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.empresa).filter(Boolean))];
    return brands.sort();
  }, [products]);

  const availableTags = useMemo(() => {
    const tags = [...new Set(products.flatMap(p => p.etiquetas || []).filter(Boolean))];
    return tags.sort();
  }, [products]);

  const priceRange = useMemo(() => {
    const prices = products.map(p => parseFloat(p.precio) || 0).filter(p => p > 0);
    return {
      min: Math.min(...prices) || 0,
      max: Math.max(...prices) || 1000
    };
  }, [products]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        (product.nombre || '').toLowerCase().includes(term) ||
        (product.descripcion || '').toLowerCase().includes(term) ||
        (product.empresa || '').toLowerCase().includes(term) ||
        (product.categoria || '').toLowerCase().includes(term) ||
        (product.etiquetas || []).some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.categoria)
      );
    }

    // Price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      const minPrice = parseFloat(filters.priceRange.min) || 0;
      const maxPrice = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(product => {
        const price = parseFloat(product.precio) || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => {
        const rating = parseFloat(product.rating || product.calificacion || 0);
        return rating >= filters.rating;
      });
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => {
        const stock = parseInt(product.cantidad || 0);
        return stock > 0;
      });
    }

    // Sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => 
        product.oferta && product.precioOferta
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.empresa)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        filters.tags.some(tag => (product.etiquetas || []).includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date(0);
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date();
      
      filtered = filtered.filter(product => {
        const productDate = new Date(product.fechaCreacion || product.fechaPublicacion || 0);
        return productDate >= startDate && productDate <= endDate;
      });
    }

    return filtered;
  }, [products, searchTerm, filters]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (parseFloat(a.precio) || 0) - (parseFloat(b.precio) || 0));
      case 'price-high':
        return sorted.sort((a, b) => (parseFloat(b.precio) || 0) - (parseFloat(a.precio) || 0));
      case 'rating':
        return sorted.sort((a, b) => (parseFloat(b.rating || b.calificacion || 0)) - (parseFloat(a.rating || a.calificacion || 0)));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.fechaCreacion || b.fechaPublicacion || 0) - new Date(a.fechaCreacion || a.fechaPublicacion || 0));
      case 'name':
        return sorted.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      case 'relevance':
      default:
        // Simple relevance based on search term matches
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          return sorted.sort((a, b) => {
            const aScore = (a.nombre || '').toLowerCase().includes(term) ? 2 : 0 +
                          (a.descripcion || '').toLowerCase().includes(term) ? 1 : 0;
            const bScore = (b.nombre || '').toLowerCase().includes(term) ? 2 : 0 +
                          (b.descripcion || '').toLowerCase().includes(term) ? 1 : 0;
            return bScore - aScore;
          });
        }
        return sorted;
    }
  }, [filteredProducts, sortBy, searchTerm]);

  // Update parent component when results change
  useEffect(() => {
    onFilteredResults?.(sortedProducts);
  }, [sortedProducts, onFilteredResults]);

  // Update parent component when search changes
  useEffect(() => {
    onSearchChange?.(searchTerm);
  }, [searchTerm, onSearchChange]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterToggle = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: '', max: '' },
      rating: 0,
      inStock: false,
      onSale: false,
      freeShipping: false,
      brands: [],
      tags: [],
      dateRange: { start: '', end: '' }
    });
    setSearchTerm('');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.brands.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Buscar y Filtrar
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
          </span>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="relevance">Relevancia</option>
            <option value="price-low">Precio: Menor a Mayor</option>
            <option value="price-high">Precio: Mayor a Menor</option>
            <option value="rating">Mejor Calificación</option>
            <option value="newest">Más Recientes</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}

              {/* Categories */}
              <div>
                <button
                  onClick={() => toggleSection('categories')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Categorías</span>
                  {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {expandedSections.categories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 max-h-48 overflow-y-auto"
                    >
                      {categories.map(category => (
                        <label key={category.id || category.nombre} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.nombre)}
                            onChange={() => handleArrayFilterToggle('categories', category.nombre)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{category.nombre}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Rango de Precio</span>
                  {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {expandedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder={`Min (${priceRange.min})`}
                          value={filters.priceRange.min}
                          onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder={`Max (${priceRange.max})`}
                          value={filters.priceRange.max}
                          onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rating */}
              <div>
                <button
                  onClick={() => toggleSection('rating')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Calificación Mínima</span>
                  {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {expandedSections.rating && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      {[4, 3, 2, 1].map(rating => (
                        <label key={rating} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => handleFilterChange('rating', rating)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600">y más</span>
                          </div>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Availability */}
              <div>
                <button
                  onClick={() => toggleSection('availability')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Disponibilidad</span>
                  {expandedSections.availability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {expandedSections.availability && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">En stock</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.onSale}
                          onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">En oferta</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('brands')}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                  >
                    <span>Marcas</span>
                    {expandedSections.brands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.brands && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 max-h-48 overflow-y-auto"
                      >
                        {availableBrands.map(brand => (
                          <label key={brand} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.brands.includes(brand)}
                              onChange={() => handleArrayFilterToggle('brands', brand)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{brand}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchFilter;
