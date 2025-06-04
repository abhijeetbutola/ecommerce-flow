"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Added Dialog components
import { Input } from "@/components/ui/input"; // Added Input
import { cn } from "@/lib/utils";
import { Package2, ShoppingCart, SearchIcon, Menu } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react"; // Added FormEvent
import { getCart } from "@/lib/cart";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
  ];

  useEffect(() => {
    const updateCount = () => {
      const currentCart = getCart();
      setCartItemCount(currentCart.length);
    };
    updateCount();

    window.addEventListener("storage", updateCount);
    window.addEventListener("cartUpdated", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, [pathname]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search-results?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery(""); // Clear search query
      setIsSearchDialogOpen(false); // Close dialog
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:w-80">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Package2 className="h-6 w-6 text-primary" />
                    <span>eCommerce Menu</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileSheetOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mr-2"
          >
            <Package2 className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">eCommerce</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                asChild
                size="sm"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href ? "" : "text-muted-foreground"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Dialog
            open={isSearchDialogOpen}
            onOpenChange={setIsSearchDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <SearchIcon className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Search Products</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col gap-4"
              >
                <Input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <DialogFooter className="sm:justify-start">
                  <Button type="submit" disabled={!searchQuery.trim()}>
                    Search
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/3 -translate-y-1/3">
                {cartItemCount}
              </span>
            )}
            <span className="sr-only">Cart items: {cartItemCount}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
