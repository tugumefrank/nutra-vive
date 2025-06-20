import FavoritesPage from "@/components/favorites/FavoritesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorites | Nutra-Vive",
  description:
    "Your favorite organic juices and teas - save and revisit the products you love most.",
  keywords: [
    "favorites",
    "wishlist",
    "organic juice",
    "herbal tea",
    "saved products",
  ],
  openGraph: {
    title: "My Favorites | Nutra-Vive",
    description:
      "Your favorite organic juices and teas - save and revisit the products you love most.",
    type: "website",
  },
};

export default function Page() {
  return <FavoritesPage />;
}
