'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Download, 
  Building2, 
  CheckCircle2, 
  Loader2,
  DollarSign,
  Package,
  ShoppingCart,
  Percent,
  FileText,
  Zap
} from "lucide-react";

export default function ReportDetail({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creatingPO, setCreatingPO] = useState<string | null>(null);

  useEffect(() => { 
    (async() => {
      try {
        const r = await fetch(`/api/reports/${params.id}`); 
        setReport(await r.json());
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        setLoading(false);
      }
    })() 
  }, [params.id]);

  async function createPo(vendorName: string) {
    setCreatingPO(vendorName);
    setStatus(`Creating PO for ${vendorName}...`);
    try {
      const r = await fetch('/api/xero/create-po', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ reportId: params.id, vendorName }) 
      });
      const json = await r.json();
      setStatus(json.error ? `Error: ${json.error}` : `PO created: ${json.number || json.id}`);
      // Reload report data
      const rep = await fetch(`/api/reports/${params.id}`); 
      setReport(await rep.json());
    } catch (error) {
      setStatus('Failed to create PO');
    } finally {
      setCreatingPO(null);
    }
  }

  async function createAll() {
    setStatus('Creating POs for all linked vendors...');
    try {
      const r = await fetch('/api/xero/create-po/batch', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ reportId: params.id }) 
      });
      const json = await r.json();
      setStatus(`Successfully created ${json.created} purchase orders`);
      const rep = await fetch(`/api/reports/${params.id}`); 
      setReport(await rep.json());
    } catch (error) {
      setStatus('Failed to create batch POs');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-600">Loading report...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Report not found</h3>
        <p className="text-slate-600 mb-4">The requested report could not be loaded.</p>
        <Button variant="outline" asChild>
          <a href="/dashboard/reports">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </a>
        </Button>
      </div>
    );
  }

  const periodStart = new Date(report.periodStart);
  const periodEnd = new Date(report.periodEnd);
  const totalVendors = report.rows?.length || 0;
  const totalOrders = report.rows?.reduce((sum: number, row: any) => sum + (row.orders || 0), 0) || 0;
  const totalRevenue = report.rows?.reduce((sum: number, row: any) => sum + (row.gross || 0), 0) || 0;
  const totalCommission = report.rows?.reduce((sum: number, row: any) => sum + (row.commissionAmt || 0), 0) || 0;
  const linkedVendors = report.rows?.filter((row: any) => row.xeroPoId).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/reports">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Report #{params.id.slice(-8)}
            </h1>
            <p className="text-slate-600 mt-1">
              {periodStart.toLocaleDateString()} → {periodEnd.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={createAll}
            className="bg-slate-900 hover:bg-slate-800 text-white"
            disabled={linkedVendors === totalVendors}
          >
            <Zap className="w-4 h-4 mr-2" />
            Create All POs ({totalVendors - linkedVendors} pending)
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <Card className="border-0 shadow-sm bg-slate-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-700">{status}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                <p className="text-3xl font-bold text-slate-900">{totalVendors}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Commission</p>
                <p className="text-3xl font-bold text-slate-900">${totalCommission.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Details Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Vendor Commission Details</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{totalVendors} vendors with commission data</p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {linkedVendors}/{totalVendors} POs Created
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Orders</TableHead>
                  <TableHead className="font-semibold text-slate-700">Units</TableHead>
                  <TableHead className="font-semibold text-slate-700">Gross Revenue</TableHead>
                  <TableHead className="font-semibold text-slate-700">Refunds</TableHead>
                  <TableHead className="font-semibold text-slate-700">Shipping</TableHead>
                  <TableHead className="font-semibold text-slate-700">Commission</TableHead>
                  <TableHead className="font-semibold text-slate-700">Net Payable</TableHead>
                  <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row: any) => (
                  <TableRow key={row.vendor} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-900">{row.vendor}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {row.orders}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{row.units}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">${row.gross.toFixed(2)} {row.currency}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-red-600">
                        -${row.refunds.toFixed(2)} {row.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">${row.shipping.toFixed(2)} {row.currency}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">{row.commissionPct}%</Badge>
                        <div className="font-mono text-sm">${row.commissionAmt.toFixed(2)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold font-mono text-slate-900">
                        ${row.netPayable.toFixed(2)} {row.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="text-xs"
                        >
                          <a 
                            href={`/api/pdf/${encodeURIComponent(row.vendor)}`} 
                            target="_blank"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </a>
                        </Button>
                        
                        {row.xeroPoId ? (
                          <div className="flex items-center space-x-1 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-slate-600" />
                            <span className="font-medium text-slate-700">PO Created</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => createPo(row.vendor)}
                            disabled={creatingPO === row.vendor}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
                          >
                            {creatingPO === row.vendor ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 mr-1" />
                            )}
                            Create PO
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}