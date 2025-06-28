// app/api/cron/discount-scheduler/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { runDiscountScheduler } from '@/lib/services/discountScheduler';

/**
 * API route for running the discount scheduler
 * This can be called by external cron services or internal scheduling
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Verify cron secret if provided
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Discount scheduler API endpoint called');
    
    // Run the scheduler
    const result = await runDiscountScheduler();
    
    return NextResponse.json({
      success: true,
      message: 'Discount scheduler completed successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error in discount scheduler API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Discount scheduler failed'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Allow both GET and POST
}