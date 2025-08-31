import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Report from '@/models/Report';

export async function GET() {
  await dbConnect();

  try {
    // Get all reports sorted by creation date
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate non-confusing stats
    const totalReports = reports.length;
    const reportsThisMonth = reports.filter(r => new Date(r.createdAt) >= thisMonth).length;
    
    // 🔑 USE LATEST REPORT ONLY to avoid overlap confusion
    let latestReportRevenue = 0;
    let latestReportCommission = 0;
    let latestReportVendors = 0;
    let latestReportPeriod = null;
    
    if (reports.length > 0) {
      const latestReport = reports[0]; // Most recent
      if (latestReport.rows) {
        latestReportVendors = latestReport.rows.length;
        latestReport.rows.forEach((row: any) => {
          latestReportRevenue += row.gross || 0;
          latestReportCommission += row.commissionAmt || 0;
        });
        latestReportPeriod = {
          start: latestReport.periodStart,
          end: latestReport.periodEnd
        };
      }
    }
    
    // Get last report date
    let lastReportDays: number | undefined;
    if (reports.length > 0) {
      const daysDiff = Math.floor((now.getTime() - new Date(reports[0].createdAt).getTime()) / (1000 * 60 * 60 * 24));
      lastReportDays = daysDiff;
    }
    
    // Calculate average vendors per report (this is safe to sum)
    const avgVendorsPerReport = totalReports > 0 
      ? reports.reduce((sum, r) => sum + (r.rows?.length || 0), 0) / totalReports 
      : 0;

    return NextResponse.json({
      totalReports,
      reportsThisMonth,
      latestReportRevenue: Math.round(latestReportRevenue),
      latestReportCommission: Math.round(latestReportCommission),
      latestReportVendors,
      latestReportPeriod,
      lastReportDays,
      avgVendorsPerReport: Math.round(avgVendorsPerReport * 10) / 10 // Round to 1 decimal
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalReports: 0,
      reportsThisMonth: 0,
      latestReportRevenue: 0,
      latestReportCommission: 0,
      latestReportVendors: 0,
      latestReportPeriod: null,
      avgVendorsPerReport: 0
    });
  }
}