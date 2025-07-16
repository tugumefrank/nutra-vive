// Helper function to generate shop URL with search params
export function generateShopUrl(category?: string, search?: string): string {
  const params = new URLSearchParams();
  
  if (category && category !== "All") {
    params.set("category", category);
  }
  
  if (search) {
    params.set("search", search);
  }
  
  const queryString = params.toString();
  return queryString ? `/shop?${queryString}` : "/shop";
}