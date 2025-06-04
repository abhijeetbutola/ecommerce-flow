import Link from "next/link";
import Image from "next/image";
import { getProducts, type ApiProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function CatalogPage() {
  const products = await getProducts(40, 80);

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>
        <p>
          No products found or failed to load products with the current
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>

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
