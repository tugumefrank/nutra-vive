import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { assignPromotionToCustomers } from '@/lib/actions/promotionServerActions';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { promotionId, customerSegment, customerIds, sendNotification = true } = body;

    if (!promotionId) {
      return NextResponse.json({ error: 'Promotion ID is required' }, { status: 400 });
    }

    const result = await assignPromotionToCustomers({
      promotionId,
      customerSegment,
      customerIds,
      sendNotification
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      assignedCount: result.assignedCount,
      message: `Promotion assigned to ${result.assignedCount} customers`
    });
  } catch (error) {
    console.error('Error assigning promotion:', error);
    return NextResponse.json(
      { error: 'Failed to assign promotion' },
      { status: 500 }
    );
  }
}