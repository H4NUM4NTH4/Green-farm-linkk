
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/marketplace/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Filter, Search, Sliders, X } from 'lucide-react';
import { fetchProducts } from '@/services/productService';
import { ProductWithImages, ProductFilter, productCategories } from '@/types/product';
import { toast } from '@/components/ui/use-toast';
import { useAuthorization } from '@/hooks/useAuthorization';

const locations = ['All Locations', 'Kansas City, MO', 'San Joaquin Valley, CA', 'Portland, OR', 'Austin, TX', 'Yakima Valley, WA', 'Hudson Valley, NY'];

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const { isAuthenticated, userRole } = useAuthorization();
  
  // Define filter object based on UI state
  const filter: ProductFilter = {
    search: searchQuery !== '' ? searchQuery : undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 100 ? priceRange[1] : undefined,
    sortBy: sortBy as 'newest' | 'price-low' | 'price-high' | 'rating',
  };

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        // Fetch all active products regardless of user role
        const data = await fetchProducts(filter);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [filter.category, filter.minPrice, filter.maxPrice, filter.location, filter.sortBy]);

  // Perform search when user submits the search form
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchProducts({...filter, search: searchQuery})
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error searching products:', error);
        setIsLoading(false);
      });
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 100]);
    setSelectedLocation('All Locations');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
            <p className="text-muted-foreground max-w-3xl">
              Browse and purchase fresh produce directly from verified farmers. Our AI-powered marketplace ensures fair prices and quality products.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters section */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categories</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          className={`px-2 py-1 h-auto text-sm justify-start ${
                            selectedCategory === 'All' ? 'text-agri-primary font-medium' : 'text-muted-foreground'
                          }`}
                          onClick={() => setSelectedCategory('All')}
                        >
                          All
                        </Button>
                      </div>
                      {productCategories.map((category) => (
                        <div key={category} className="flex items-center">
                          <Button 
                            variant="ghost" 
                            className={`px-2 py-1 h-auto text-sm justify-start ${
                              selectedCategory === category ? 'text-agri-primary font-medium' : 'text-muted-foreground'
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="px-2">
                      <Slider 
                        defaultValue={[0, 100]} 
                        max={100} 
                        step={1} 
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as number[])}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select 
                      defaultValue="All Locations" 
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full" onClick={() => fetchProducts(filter).then(setProducts)}>
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="flex-grow">
              {/* Search and sort */}
              <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search for products..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="lg:hidden flex items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  
                  <Select 
                    defaultValue="newest"
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
              
              {/* Mobile filters */}
              {showFilters && (
                <Card className="mb-6 lg:hidden">
                  <CardContent className="py-4">
                    <div className="flex gap-2 flex-wrap">
                      <Select 
                        value={selectedCategory !== 'All' ? selectedCategory : 'All'}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="h-8 text-xs px-3 py-1">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {productCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger className="h-8 text-xs px-3 py-1">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Sliders className="h-3 w-3 mr-1" />
                        Price
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Applied filters */}
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {selectedCategory}
                    <button 
                      className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30"
                      onClick={() => setSelectedCategory('All')}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 100) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button 
                      className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30"
                      onClick={() => setPriceRange([0, 100])}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedLocation !== 'All Locations' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {selectedLocation}
                    <button 
                      className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30"
                      onClick={() => setSelectedLocation('All Locations')}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
              </div>
              
              {/* Products grid */}
              <ProductGrid
                title=""
                subtitle=""
                products={products}
                isLoading={isLoading}
                emptyMessage={
                  searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All Locations' || priceRange[0] > 0 || priceRange[1] < 100
                    ? "No products match your search criteria. Try adjusting your filters."
                    : "No products available. Check back soon for new listings."
                }
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
