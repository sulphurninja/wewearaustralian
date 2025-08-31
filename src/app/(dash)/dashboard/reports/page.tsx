import { dbConnect } from '@/lib/mongo';
import Report from '@/models/Report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await dbConnect();
  const reports: any[] = await Report.find({}, {}, { sort: { createdAt: -1 } }).lean();

  const totalReports = reports.length;
  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Commission Reports</h1>
          <p className="text-slate-600 mt-2">View and manage your vendor commission reports and purchase orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            {totalReports} Total Reports
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-3xl font-bold text-slate-900">{totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Month</p>
                <p className="text-3xl font-bold text-slate-900">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Vendors</p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalReports ? Math.round(reports.reduce((sum, r) => sum + (r.rows?.length || 0), 0) / totalReports) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Latest Report</p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalReports ? `${Math.ceil((Date.now() - new Date(reports[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))}d` : '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Report History</CardTitle>
                <p className="text-sm text-slate-600 mt-1">All commission reports ordered by creation date</p>
              </div>
            </div>
            {/* <Button variant="outline" asChild>
              <a href="/dashboard">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate New
              </a>
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No reports yet</h3>
              <p className="text-slate-600 mb-6">Generate your first commission report to get started.</p>
              <Button asChild>
                <a href="/dashboard">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const periodStart = new Date(report.periodStart);
                const periodEnd = new Date(report.periodEnd);
                const createdAt = new Date(report.createdAt);
                const vendorCount = report.rows?.length || 0;
                const totalOrders = report.rows?.reduce((sum: number, row: any) => sum + (row.orders || 0), 0) || 0;
                
                return (
                  <div
                    key={report._id}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-slate-900">
                              Report #{report._id.toString().slice(-8)}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {vendorCount} vendors
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {totalOrders} orders
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Period: {periodStart.toLocaleDateString()} → {periodEnd.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                Created: {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/dashboard/reports/${report._id}`}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View Details
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}