import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProductPricingWithPromotions } from '@/lib/actions/promotionServerActions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get user info if available (not required for pricing)
    let customerEmail: string | undefined;
    try {
      const { userId } = await auth();
      if (userId) {
        // In a real implementation, you might fetch the user's email from the database
        // For now, we'll pass the userId as identifier
        customerEmail = userId;
      }
    } catch (error) {
      // Auth is optional for pricing, so we continue without it
      console.log('No auth available for pricing request');
    }

    const result = await getProductPricingWithPromotions(productId, customerEmail);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch product pricing' 
      },
      { status: 500 }
    );
  }
}