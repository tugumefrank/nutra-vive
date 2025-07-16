import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/actions/productServerActions';

export async function GET() {
  try {
    const productsResponse = await getProducts({
      isActive: true,
      limit: 100, // Get up to 100 products
    });

    const products = productsResponse.products.map(product => ({
      name: product.name,
      description: product.description || 'No description available'
    }));

    return NextResponse.json({
      success: true,
      products,
      total: productsResponse.total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}