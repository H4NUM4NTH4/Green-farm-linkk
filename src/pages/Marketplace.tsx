
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGrid, { sampleProducts } from '@/components/marketplace/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Filter, Search, Sliders, X } from 'lucide-react';

const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Specialty'];
const locations = ['All Locations', 'Kansas City, MO', 'San Joaquin Valley, CA', 'Portland, OR', 'Austin, TX', 'Yakima Valley, WA', 'Hudson Valley, NY'];

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8">
        <div className="agri-container">
          <div className="mb-8">
            <h1 className="heading-2 mb-4">Marketplace</h1>
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
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categories</label>
                    <div className="space-y-2">
                      {categories.map((category) => (
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
                        defaultValue={[0, 20]} 
                        max={20} 
                        step={1} 
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as number[])}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select defaultValue="All Locations">
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
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-agri-primary" />
                      <span className="text-sm">Verified Sellers Only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-agri-primary" />
                      <span className="text-sm">AI Recommended</span>
                    </label>
                  </div>
                  
                  <Button className="w-full">Apply Filters</Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="flex-grow">
              {/* Search and sort */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
                  
                  <Select defaultValue="featured">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Mobile filters */}
              {showFilters && (
                <Card className="mb-6 lg:hidden">
                  <CardContent className="py-4">
                    <div className="flex gap-2 flex-wrap">
                      <Select defaultValue="All">
                        <SelectTrigger className="h-8 text-xs px-3 py-1">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="All Locations">
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
                      
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        More
                        <ChevronDown className="h-3 w-3 ml-1" />
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
                    <button className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30">
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 20) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <button className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30">
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
              </div>
              
              {/* Products grid */}
              <ProductGrid
                title=""
                subtitle=""
                products={sampleProducts}
              />
              
              {/* Pagination placeholder */}
              <div className="mt-10 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-agri-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
