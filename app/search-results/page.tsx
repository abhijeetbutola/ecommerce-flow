"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchProducts, type ApiProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchProducts(query);
        setProducts(results);
      } catch (err) {
        console.error("Search error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch search results."
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSearchResults();
  }, [query]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading search results for "{query}"...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Search Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Search Products</h1>
        <p className="text-muted-foreground">
          Please enter a search term in the navbar to find products.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          No Results Found for "{query}"
        </h1>
        <p className="text-muted-foreground mb-6">
          Try a different search term or browse our catalog.
        </p>
        <Button asChild>
          <Link href="/catalog">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
      <p className="text-muted-foreground mb-8">
        Found {products.length} product{products.length === 1 ? "" : "s"}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: ApiProduct) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            legacyBehavior
            passHref
          >
            <a className="block h-full">
              <Card className="h-full transition-all hover:shadow-lg flex flex-col group">
                <div className="aspect-square relative w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      product.thumbnail ||
                      `/placeholder.svg?height=300&width=300&query=${
                        encodeURIComponent(product.title) || "/placeholder.svg"
                      }`
                    }
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h2 className="font-semibold text-lg line-clamp-1">
                    {product.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-grow">
                    {product.description}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-medium text-lg">
                      {formatCurrency(product.price)}
                    </p>
                    {product.discountPercentage > 0 && (
                      <p className="text-xs text-red-500 line-through">
                        {formatCurrency(
                          product.price / (1 - product.discountPercentage / 100)
                        )}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          Loading...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
