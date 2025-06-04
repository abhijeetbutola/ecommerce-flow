export type ProductDimensions = {
  width: number;
  height: number;
  depth: number;
};

export type ProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type ProductMeta = {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
};

export type ApiProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMeta;
  images: string[];
  thumbnail: string;
};

export async function getProducts(limit = 30, skip = 0): Promise<ApiProduct[]> {
  try {
    const res = await fetch(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const data = await res.json();
    return data.products as ApiProduct[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch product ${id}: ${res.statusText}`);
    }
    return (await res.json()) as ApiProduct;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function searchProducts(query: string): Promise<ApiProduct[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    const res = await fetch(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`Failed to search products: ${res.statusText}`);
    }
    const data = await res.json();
    return data.products as ApiProduct[];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
