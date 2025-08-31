'use client'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Link2,
  Mail,
  User,
  ExternalLink,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';

export default function XeroPage() {
  const [status, setStatus] = useState<{connected:boolean; tenantName?:string} | null>(null);
  const [linkVendor, setLinkVendor] = useState<string | null>(null);
  const [search, setSearch] = useState(''); 
  const [results, setResults] = useState<any[]>([]);
  const [manual, setManual] = useState({ name: '', email: '' });
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => { 
    (async() => { 
      try {
        const r = await fetch('/api/xero/status'); 
        setStatus(await r.json()); 
      } catch (error) {
        console.error('Failed to load Xero status:', error);
        setStatus({ connected: false });
      } finally {
        setStatusLoading(false);
      }
    })();
    
    // Check for link parameter in URL
    const params = new URLSearchParams(window.location.search);
    const linkParam = params.get('link');
    if (linkParam) {
      setLinkVendor(decodeURIComponent(linkParam));
    }

    // Check for connection success
    const connected = params.get('connected');
    if (connected === '1') {
      // Remove the parameter and reload status
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);

  async function doSearch() {
    if (!search.trim()) return;
    if (!status?.connected) {
      alert('Please connect to Xero first');
      return;
    }
    
    setSearching(true);
    setResults([]);
    try {
      const r = await fetch(`/api/xero/contacts/search?q=${encodeURIComponent(search)}`);
      if (r.ok) {
        const data = await r.json();
        setResults(data);
      } else {
        alert('Failed to search contacts. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search contacts. Please check your connection.');
    } finally {
      setSearching(false);
    }
  }

  async function createContact() {
    if (!manual.name.trim()) return;
    if (!status?.connected) {
      alert('Please connect to Xero first');
      return;
    }

    setCreating(true);
    try {
      const r = await fetch('/api/xero/contacts/create', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(manual) 
      });
      
      if (r.ok) {
        const j = await r.json(); 
        setResults([j, ...results]);
        setManual({ name: '', email: '' });
      } else {
        alert('Failed to create contact. Please try again.');
      }
    } catch (error) {
      console.error('Create contact error:', error);
      alert('Failed to create contact. Please check your connection.');
    } finally {
      setCreating(false);
    }
  }

  async function link(contact: any) {
    if (!linkVendor) {
      alert('Please set a vendor name first');
      return;
    }
    if (!status?.connected) {
      alert('Please connect to Xero first');
      return;
    }

    setLinking(contact.id);
    setLinkSuccess(null);
    
    try {
      const r = await fetch('/api/vendors/link-xero', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ vendorName: linkVendor, contactId: contact.id }) 
      });
      
      if (r.ok) {
        setLinkSuccess(`Successfully linked ${linkVendor} to ${contact.name}`);
        setLinkVendor(null);
        setSearch('');
        setResults([]);
      } else {
        alert('Failed to link vendor. Please try again.');
      }
    } catch (error) {
      console.error('Link error:', error);
      alert('Failed to link vendor. Please check your connection.');
    } finally {
      setLinking(null);
    }
  }

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Loading Xero status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Xero Integration</h1>
          <p className="text-slate-600 mt-2">Connect your Xero account and manage vendor-contact relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          {status?.connected ? (
            <Badge className="bg-slate-900 text-white border-slate-900 px-3 py-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-600 border-slate-300 px-3 py-1">
              <AlertCircle className="w-4 h-4 mr-2" />
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Success Message */}
      {linkSuccess && (
        <Alert className="border-slate-200 bg-slate-50">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-slate-700">
            {linkSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status?.connected 
                ? 'bg-slate-100' 
                : 'bg-slate-100'
            }`}>
              <Zap className={`w-6 h-6 ${
                status?.connected 
                  ? 'text-slate-700' 
                  : 'text-slate-500'
              }`} />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Xero Connection</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {status?.connected 
                  ? `Connected to: ${status.tenantName}` 
                  : 'Connect your Xero account to manage purchase orders'
                }
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.connected ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">{status.tenantName}</p>
                    <p className="text-sm text-slate-600">Successfully connected</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/api/xero/connect'}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Reconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">Not Connected</p>
                    <p className="text-sm text-slate-600">Connect to start creating purchase orders</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/api/xero/connect'}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Connect to Xero
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Linking Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Link Vendor to Xero Contact</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Connect your vendors with existing Xero contacts for seamless purchase order creation
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Required Alert */}
          {!status?.connected && (
            <Alert className="border-slate-300 bg-slate-50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-slate-700">
                You must connect to Xero before linking vendors to contacts.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Link Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Link2 className="w-4 h-4 text-slate-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-800">Quick Link from Vendors Page</p>
                <p className="text-xs text-slate-600">
                  Go to{' '}
                  <a className="underline font-medium hover:text-slate-800 transition-colors" href="/dashboard/vendors">
                    Vendors
                  </a>{' '}
                  and click &quot;Link&quot; next to any vendor to jump back here with that vendor pre-selected.
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input 
                placeholder="Enter vendor name to link..." 
                value={linkVendor ?? ''} 
                onChange={e => setLinkVendor(e.target.value)}
                className="flex-1 bg-slate-50 border-slate-200 focus:bg-white"
                disabled={!status?.connected}
              />
              <Button 
                variant="outline"
                onClick={() => setLinkVendor(linkVendor || '')}
                disabled={!linkVendor?.trim() || !status?.connected}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Set Vendor
              </Button>
            </div>
            
            {linkVendor && status?.connected && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-sm text-slate-600">
                  Ready to link:{' '}
                  <span className="font-medium text-slate-900">{linkVendor}</span>
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Search */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search existing Xero contacts..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && doSearch()}
                  disabled={!status?.connected}
                />
              </div>
              <Button 
                onClick={doSearch}
                disabled={!search.trim() || searching || !status?.connected}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={!status?.connected}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Create New Xero Contact</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input 
                      placeholder="Contact name *" 
                      value={manual.name} 
                      onChange={e => setManual(s => ({...s, name: e.target.value}))}
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                    <Input 
                      placeholder="Email address" 
                      type="email"
                      value={manual.email} 
                      onChange={e => setManual(s => ({...s, email: e.target.value}))}
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                    <Button 
                      onClick={createContact}
                      disabled={!manual.name.trim() || creating}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {creating ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Create Contact</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">Search Results</h3>
                <Badge variant="outline" className="border-slate-300 text-slate-600">
                  {results.length} contacts found
                </Badge>
              </div>
              
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                {results.map(contact => (
                  <div key={contact.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{contact.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            {contact.email ? (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{contact.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">No email</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => link(contact)}
                        disabled={!linkVendor || linking === contact.id}
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        {linking === contact.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4 mr-2" />
                        )}
                        Link to {linkVendor || '—'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {search && results.length === 0 && !searching && status?.connected && (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>No contacts found for &quot;{search}&quot;</p>
              <p className="text-sm mt-1">Try a different search term or create a new contact</p>
            </div>
          )}

          {!status?.connected && (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>Connect to Xero to search and link contacts</p>
              <Button 
                className="mt-4 bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => window.location.href = '/api/xero/connect'}
              >
                <Zap className="w-4 h-4 mr-2" />
                Connect to Xero
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}