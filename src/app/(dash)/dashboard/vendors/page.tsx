'use client'
import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Upload, 
  Users, 
  Search, 
  ExternalLink, 
  Mail, 
  Percent, 
  CheckCircle2,
  Link2,
  AlertCircle,
  Filter,
  FileText,
  TrendingUp
} from "lucide-react";

type Vendor = { name:string; commissionPct:number; email?:string; website?:string; xeroContactId?:string };

export default function VendorsPage() {
  const [status, setStatus] = useState(''); 
  const ref = useRef<HTMLInputElement>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function load() {
    try {
      const r = await fetch('/api/vendors/list'); 
      const data = await r.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onImport() {
    const f = ref.current?.files?.[0]; 
    if (!f) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const text = await f.text();
      const res = await fetch('/api/vendors/import', { method:'POST', body:text });
      const json = await res.json(); 
      setStatus(`Successfully imported ${json.imported} vendors. Total: ${json.total}`); 
      load();
      // Reset file input
      if (ref.current) ref.current.value = '';
    } catch (error) {
      setStatus('Failed to import vendors. Please check your file format.');
    } finally {
      setLoading(false);
    }
  }

  const linkedVendors = vendors.filter(v => v.xeroContactId).length;
  const totalCommission = vendors.reduce((sum, v) => sum + v.commissionPct, 0);
  const vendorsWithEmail = vendors.filter(v => v.email).length;
  const vendorsWithWebsite = vendors.filter(v => v.website).length;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-slate-600 mt-2">Import, manage, and link your vendor relationships with Xero contacts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-700">
            <Users className="w-3 h-3 mr-1" />
            {vendors.length} Total
          </Badge>
          <Badge 
            variant={linkedVendors > 0 ? "default" : "secondary"} 
            className={`px-3 py-1 ${
              linkedVendors > 0 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <Link2 className="w-3 h-3 mr-1" />
            {linkedVendors} Linked
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                <p className="text-3xl font-bold text-slate-900">{vendors.length}</p>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Ready for reporting</span>
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
              <div>
                <p className="text-sm font-medium text-slate-600">Xero Linked</p>
                <p className="text-3xl font-bold text-slate-900">{linkedVendors}</p>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <span>{Math.round((linkedVendors / (vendors.length || 1)) * 100)}% connected</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Commission</p>
                <p className="text-3xl font-bold text-slate-900">
                  {vendors.length ? (totalCommission / vendors.length).toFixed(1) : '0'}%
                </p>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <span>Across all vendors</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">With Contact Info</p>
                <p className="text-3xl font-bold text-slate-900">{vendorsWithEmail}</p>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{vendorsWithWebsite} with websites</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Import Vendor Data</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Upload a CSV file containing your vendor information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input 
                type="file" 
                accept=".csv" 
                ref={ref}
                className="cursor-pointer file:bg-slate-100 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={onImport}
              disabled={loading || !ref.current?.files?.[0]}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Import CSV</span>
                </div>
              )}
            </Button>
          </div>
          
          {status && (
            <div className={`rounded-lg p-4 border ${
              status.includes('Failed') || status.includes('Error')
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-3">
                {status.includes('Failed') || status.includes('Error') ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-slate-700" />
                )}
                <p className={`text-sm font-medium ${
                  status.includes('Failed') || status.includes('Error')
                    ? 'text-red-800'
                    : 'text-slate-800'
                }`}>
                  {status}
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">CSV Format Requirements:</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>• <strong>Required columns:</strong> name, commissionPct (or similar)</p>
                  <p>• <strong>Optional columns:</strong> email, website</p>
                  <p>• <strong>Commission format:</strong> Numeric value (e.g., 15 for 15%)</p>
                  <p>• <strong>Supported headers:</strong> &quot;Brand&quot;, &quot;Supplier / Brand&quot;, &quot;Commission Rate&quot;, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Vendor Directory</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredVendors.length === vendors.length 
                    ? `${vendors.length} vendors total`
                    : `${filteredVendors.length} of ${vendors.length} vendors`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search vendors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {vendors.length === 0 ? 'No vendors found' : 'No matching vendors'}
              </h3>
              <p className="text-slate-600 mb-6">
                {vendors.length === 0 
                  ? "Import a CSV file to get started with vendor management."
                  : "Try adjusting your search terms or clearing filters."
                }
              </p>
              {vendors.length === 0 && (
                <Button 
                  variant="outline" 
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => ref.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Vendors
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-slate-200">
                    <TableHead className="font-semibold text-slate-700">Vendor Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Commission</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="font-semibold text-slate-700">Website</TableHead>
                    <TableHead className="font-semibold text-slate-700">Xero Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.name} className="hover:bg-slate-50 transition-colors border-slate-100">
                      <TableCell>
                        <div className="font-medium text-slate-900">{vendor.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono border-slate-300 text-slate-700">
                          {vendor.commissionPct}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vendor.email ? (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate max-w-[200px]" title={vendor.email}>
                              {vendor.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No email</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vendor.website ? (
                          <a 
                            href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm">Visit</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vendor.xeroContactId ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Linked</span>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            className="text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <a href={`/dashboard/xero?link=${encodeURIComponent(vendor.name)}`}>
                              <Link2 className="w-4 h-4 mr-2" />
                              Link
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}