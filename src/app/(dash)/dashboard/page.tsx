'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  FileText,
  Users,
  Building2,
  Play,
  CheckCircle,
  ArrowRight,
  BarChart3,
  DollarSign,
  Calendar,
  Activity,
  Zap,
  AlertCircle,
  Clock
} from "lucide-react";

interface DashboardStats {
  totalVendors: number;
  linkedVendors: number;
  totalReports: number;
  recentReports: number;
  latestReportRevenue: number;
  latestReportCommission: number;
  latestReportVendors: number;
  latestReportPeriod: { start: string; end: string } | null;
  xeroConnected: boolean;
  xeroTenantName?: string;
  lastReportDays?: number;
  avgVendorsPerReport: number;
}
export default function Page() {
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard stats
  useEffect(() => {
    loadStats();
  }, []);

  // Update the loadStats function:
  async function loadStats() {
    try {
      const [vendorsRes, reportsRes, xeroRes] = await Promise.all([
        fetch('/api/vendors/list'),
        fetch('/api/dashboard/stats'),
        fetch('/api/xero/status')
      ]);

      const vendors = await vendorsRes.json();
      const reportsData = await reportsRes.json();
      const xeroData = await xeroRes.json();

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalVendors: vendors.vendors.length,
        linkedVendors: vendors.vendors.filter((v: any) => v.xeroContactId).length,
        totalReports: reportsData.totalReports,
        recentReports: reportsData.reportsThisMonth,
        latestReportRevenue: reportsData.latestReportRevenue,
        latestReportCommission: reportsData.latestReportCommission,
        latestReportVendors: reportsData.latestReportVendors,
        latestReportPeriod: reportsData.latestReportPeriod,
        xeroConnected: xeroData.connected,
        xeroTenantName: xeroData.tenantName,
        lastReportDays: reportsData.lastReportDays,
        avgVendorsPerReport: reportsData.avgVendorsPerReport
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  async function run() {
    setLoading(true);
    try {
      const r = await fetch('/api/run', { method: 'POST' });
      const result = await r.json();
      setRes(result);
      // Reload stats after generating report
      loadStats();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  const setupProgress = stats ? (
    (stats.totalVendors > 0 ? 33 : 0) +
    (stats.xeroConnected ? 33 : 0) +
    (stats.totalReports > 0 ? 34 : 0)
  ) : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome back! Here’s what’s happening with your vendor commissions.
          </p>

        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
            System Online
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Latest Report Revenue</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${stats?.latestReportRevenue ? stats.latestReportRevenue.toLocaleString() : '0'}
                </p>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {stats?.latestReportPeriod
                      ? `${new Date(stats.latestReportPeriod.start).toLocaleDateString()} - ${new Date(stats.latestReportPeriod.end).toLocaleDateString()}`
                      : 'No reports yet'
                    }
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Latest Report Commission</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${stats?.latestReportCommission ? stats.latestReportCommission.toLocaleString() : '0'}
                </p>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <span>From {stats?.latestReportVendors || 0} vendors</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalVendors || 0}</p>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{stats?.linkedVendors || 0} linked to Xero</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalReports || 0}</p>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{stats?.recentReports || 0} this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generate Report - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Generate Commission Report</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Create comprehensive 30-day commission reports for all vendors</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">30 Days</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Report Coverage</span>
                    <span className="text-xs text-slate-500">Last 30 days</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Data Source</span>
                    <span className="text-xs text-slate-500">
                      {process.env.SHOPIFY_STORE_DOMAIN ? 'Shopify Live' : 'Mock Data'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${process.env.SHOPIFY_STORE_DOMAIN ? 'bg-slate-600' : 'bg-slate-400'}`}></div>
                    <span className="text-xs text-slate-600">
                      {process.env.SHOPIFY_STORE_DOMAIN ? 'Production Mode' : 'Development Mode'}
                    </span>
                  </div>
                </div>
              </div>

              {stats && stats.lastReportDays !== undefined && stats.lastReportDays <= 7 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Last Report Generated</p>
                      <p className="text-xs text-slate-600">
                        {stats.lastReportDays === 0 ? 'Today' : `${stats.lastReportDays} days ago`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={run}
                disabled={loading}
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Report...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5" />
                    <span>Generate New Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {res && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-slate-800">Report Generated Successfully!</p>
                        <p className="text-sm text-slate-700">Your commission report is ready for review.</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-600">
                        <span>Report ID: <span className="font-mono bg-slate-200 px-2 py-1 rounded">{res.id.slice(-8)}</span></span>
                        <span>•</span>
                        <span>{res.rows} vendors processed</span>
                        <span>•</span>
                        <span>Source: {res.source}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 border-slate-300 text-slate-700 hover:bg-slate-100" asChild>
                        <a href={`/dashboard/reports/${res.id}`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Report
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Progress & System Status */}
        <div className="space-y-6">
          {/* Setup Progress */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-slate-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">System Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Setup Progress</span>
                  <span className="text-slate-600">{setupProgress}%</span>
                </div>
                <Progress value={setupProgress} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${(stats?.totalVendors || 0) > 0 ? 'bg-slate-900' : 'bg-slate-200'
                    }`}>
                    {(stats?.totalVendors || 0) > 0 ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-slate-600">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Import Vendors</p>
                    <p className="text-xs text-slate-500">
                      {(stats?.totalVendors || 0) > 0
                        ? `${stats?.totalVendors} vendors imported`
                        : 'Upload your brands CSV file'
                      }
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/dashboard/vendors">
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${stats?.xeroConnected ? 'bg-slate-900' : 'bg-slate-200'
                    }`}>
                    {stats?.xeroConnected ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-slate-600">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Connect Xero</p>
                    <p className="text-xs text-slate-500">
                      {stats?.xeroConnected
                        ? `Connected to ${stats.xeroTenantName}`
                        : 'Link your Xero account'
                      }
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/dashboard/xero">
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${(stats?.totalReports || 0) > 0 ? 'bg-slate-900' : 'bg-slate-200'
                    }`}>
                    {(stats?.totalReports || 0) > 0 ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-slate-600">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Generate Reports</p>
                    <p className="text-xs text-slate-500">
                      {(stats?.totalReports || 0) > 0
                        ? `${stats?.totalReports} reports created`
                        : 'Create commission reports'
                      }
                    </p>
                  </div>
                  {(stats?.totalReports || 0) > 0 ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href="/dashboard/reports">
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : (
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-0 shadow-lg bg-slate-50">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mx-auto flex items-center justify-center">
                  <Activity className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">System Status</p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>All systems operational</p>
                    {stats?.avgVendorsPerReport && (
                      <p className="text-xs">Avg {Math.round(stats.avgVendorsPerReport)} vendors per report</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-100">
                  <Activity className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}