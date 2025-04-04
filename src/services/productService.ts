
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFilter, ProductWithImages, ProductImage } from "@/types/product";
import { toast } from "@/components/ui/use-toast";

// Fetch products with filtering
export const fetchProducts = async (filter?: ProductFilter) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active'); // Only fetch active products

    // Apply filters
    if (filter) {
      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }
      
      if (filter.category && filter.category !== 'All') {
        query = query.eq('category', filter.category);
      }
      
      if (filter.location && filter.location !== 'All Locations') {
        query = query.eq('location', filter.location);
      }
      
      if (filter.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
      }
      
      if (filter.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
      }
      
      if (filter.verifiedOnly) {
        // Logic for verified sellers would go here
        // This is a placeholder as we don't have a verified field yet
      }
      
      if (filter.aiRecommended) {
        query = query.eq('ai_recommended', true);
      }
      
      // Apply sorting
      if (filter.sortBy) {
        switch (filter.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          // Rating would require a ratings table
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        // Default sorting by newest
        query = query.order('created_at', { ascending: false });
      }
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Fetch product images separately for each product
    const productsWithImages: ProductWithImages[] = await Promise.all(
      products.map(async (product: Product) => {
        // Get images for this product
        const { data: productImages, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id);
        
        if (imagesError) {
          console.error('Error fetching product images:', imagesError);
          return {
            ...product,
            images: [],
            primary_image: '/placeholder.svg'
          };
        }

        // Get seller info
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', product.user_id)
          .single();
        
        // Process images to add URLs
        const processedImages = productImages.map((img: ProductImage) => ({
          ...img,
          url: supabase.storage.from('product-images').getPublicUrl(img.image_path).data.publicUrl
        }));
        
        // Find primary image or use first one
        const primaryImage = processedImages.find((img) => img.is_primary);
        const imageUrl = primaryImage 
          ? primaryImage.url
          : processedImages.length > 0 
            ? processedImages[0].url
            : '/placeholder.svg';
        
        return {
          ...product,
          images: processedImages || [],
          primary_image: imageUrl,
          seller: sellerError ? undefined : {
            id: sellerData.id,
            full_name: sellerData.full_name,
            avatar_url: sellerData.avatar_url,
            verified: true // Placeholder, we can add verification logic later
          }
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

// Fetch a single product by ID
export const fetchProductById = async (id: string) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    // Get images for this product
    const { data: productImages, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id);
    
    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
    }

    // Get seller info
    const { data: sellerData, error: sellerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', product.user_id)
      .single();

    // Process images to add full URLs
    const images = productImages ? productImages.map((img: ProductImage) => ({
      ...img,
      url: supabase.storage.from('product-images').getPublicUrl(img.image_path).data.publicUrl
    })) : [];

    // Find primary image
    const primaryImage = images.find(img => img.is_primary);
    const primaryImageUrl = primaryImage
      ? primaryImage.url
      : images.length > 0
        ? images[0].url
        : '/placeholder.svg';

    return {
      ...product,
      images,
      primary_image: primaryImageUrl,
      seller: sellerError ? undefined : {
        id: sellerData.id,
        full_name: sellerData.full_name,
        avatar_url: sellerData.avatar_url,
        verified: true // Placeholder for verification
      }
    } as ProductWithImages;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (
  productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>, 
  images: File[]
) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...productData,
        user_id: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (productError) throw productError;

    // Upload images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Insert image reference in database
        const { error: imageRefError } = await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_path: fileName,
            is_primary: i === 0 // First image is primary
          });

        if (imageRefError) throw imageRefError;
      }
    }

    toast({
      title: "Product created successfully",
      description: "Your product has been listed in the marketplace",
    });

    return product.id;
  } catch (error: any) {
    console.error('Error creating product:', error);
    toast({
      title: "Error creating product",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  newImages?: File[],
  imagesToDelete?: string[]
) => {
  try {
    console.log("Updating product with ID:", id);
    console.log("Product data:", productData);
    
    // Update the product data only, not trying to update non-existent 'images' column
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      console.error("Error updating product data:", productError);
      throw productError;
    }

    // Handle image deletions if specified
    if (imagesToDelete && imagesToDelete.length > 0) {
      console.log("Deleting images:", imagesToDelete);
      for (const imageId of imagesToDelete) {
        // Get the image path first
        const { data: imageData, error: fetchError } = await supabase
          .from('product_images')
          .select('image_path')
          .eq('id', imageId)
          .single();
        
        if (fetchError) {
          console.error("Error fetching image to delete:", fetchError);
          continue; // Skip this image if we can't fetch it
        }
        
        if (imageData) {
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([imageData.image_path]);
            
          if (storageError) {
            console.error("Error removing image from storage:", storageError);
          }
          
          // Delete from database
          const { error: dbError } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);
            
          if (dbError) {
            console.error("Error removing image from database:", dbError);
          }
        }
      }
    }

    // Upload new images
    if (newImages && newImages.length > 0) {
      console.log("Uploading new images:", newImages.length);
      for (const file of newImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading new image:", uploadError);
          throw uploadError;
        }

        // Get count of existing images
        const { count, error: countError } = await supabase
          .from('product_images')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', id);
        
        if (countError) {
          console.error("Error counting existing images:", countError);
        }
        
        // Insert image reference in database
        const { error: imageRefError } = await supabase
          .from('product_images')
          .insert({
            product_id: id,
            image_path: fileName,
            is_primary: count === 0 // First image is primary if no other images exist
          });

        if (imageRefError) {
          console.error("Error inserting image reference:", imageRefError);
          throw imageRefError;
        }
      }
    }

    toast({
      title: "Product updated successfully",
      description: "Your product has been updated in the marketplace",
    });

    return product.id;
  } catch (error: any) {
    console.error('Error updating product:', error);
    toast({
      title: "Error updating product",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string) => {
  try {
    // Get all images for this product
    const { data: images } = await supabase
      .from('product_images')
      .select('image_path')
      .eq('product_id', id);
    
    // Delete images from storage
    if (images && images.length > 0) {
      const imagePaths = images.map(img => img.image_path);
      await supabase.storage
        .from('product-images')
        .remove(imagePaths);
    }
    
    // Delete the product (this will cascade delete the product_images records)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Product deleted successfully",
      description: "Your product has been removed from the marketplace",
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    toast({
      title: "Error deleting product",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
    throw error;
  }
};
