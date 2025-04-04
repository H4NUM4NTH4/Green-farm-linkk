
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { Product, productCategories, ProductWithImages, ProductImage } from '@/types/product';
import { toast } from '@/components/ui/use-toast';

interface ProductFormProps {
  initialData?: Partial<ProductWithImages>;
  onSubmit: (data: Partial<Product>, images: File[], deletedImageIds: string[]) => Promise<void>;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    quantity_unit: 'kg',
    location: '',
    category: '',
    ...initialData,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize with existing images if editing
  useEffect(() => {
    if (initialData && initialData.images) {
      setExistingImages(initialData.images);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file size and type
      const invalidFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return !isValidType || !isValidSize;
      });
      
      if (invalidFiles.length > 0) {
        setImageError('Please select only image files (JPG, PNG, WebP) up to 5MB');
        return;
      }
      
      // Check total number of images
      const totalImages = existingImages.length - deletedImageIds.length + newImages.length + newFiles.length;
      if (totalImages > 6) {
        setImageError('Maximum 6 images allowed. Please remove some images first.');
        return;
      }
      
      // Clear any previous errors
      setImageError(null);
      
      // Store the new files
      setNewImages([...newImages, ...newFiles]);
      
      // Create and store URLs for preview
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setNewImageUrls([...newImageUrls, ...newUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    const newImagesList = [...newImages];
    const newUrlsList = [...newImageUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newUrlsList[index]);
    
    newImagesList.splice(index, 1);
    newUrlsList.splice(index, 1);
    
    setNewImages(newImagesList);
    setNewImageUrls(newUrlsList);
  };

  const removeExistingImage = (image: ProductImage) => {
    // Mark the image for deletion
    setDeletedImageIds([...deletedImageIds, image.id]);
    
    // Remove from the UI
    setExistingImages(existingImages.filter(img => img.id !== image.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.quantity || 
        !formData.quantity_unit || !formData.location || !formData.category) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate images - only for new products
    if (!initialData?.id && newImages.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await onSubmit(formData, newImages, deletedImageIds);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Get remaining images count (existing - deleted + new)
  const remainingImagesCount = existingImages.length - deletedImageIds.length + newImages.length;
  const canAddMoreImages = remainingImagesCount < 6;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your product"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.quantity || ''}
                  onChange={handleChange}
                  required
                  className="flex-1"
                />
                <Select
                  value={formData.quantity_unit || 'kg'}
                  onValueChange={(value) => handleSelectChange('quantity_unit', value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="ton">ton</SelectItem>
                    <SelectItem value="box">box</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="bushel">bushel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter location (e.g., City, State)"
              value={formData.location || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label className="block mb-2">Product Images *</Label>
          <Card className="border-dashed border-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Display existing images that haven't been marked for deletion */}
                {initialData?.id && existingImages
                  .filter(img => !deletedImageIds.includes(img.id))
                  .map((image) => (
                    <div key={image.id} className="relative group h-32 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Product preview`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                {/* Display newly added images */}
                {newImageUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group h-32 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={url}
                      alt={`New product preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* Image upload button */}
                {canAddMoreImages && (
                  <label className="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      multiple={remainingImagesCount === 0}
                    />
                  </label>
                )}
              </div>

              {imageError && (
                <p className="text-sm text-red-500 mb-4">{imageError}</p>
              )}

              <div className="text-xs text-muted-foreground">
                <p>Upload up to 6 images (JPG, PNG, WebP)</p>
                <p>First image will be the main product image</p>
                <p>Max file size: 5MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/farmer/products')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 size={16} className="mr-2 animate-spin" />
              {initialData?.id ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            <>{initialData?.id ? 'Update Product' : 'Create Product'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
