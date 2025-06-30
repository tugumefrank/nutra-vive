import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPromotionTargetingOptions } from '@/lib/actions/promotionServerActions';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetingOptions = await getPromotionTargetingOptions();
    
    return NextResponse.json(targetingOptions);
  } catch (error) {
    console.error('Error fetching targeting options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch targeting options' },
      { status: 500 }
    );
  }
}