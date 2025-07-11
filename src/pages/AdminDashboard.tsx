import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Phone, MapPin, Building2, User, Calendar } from 'lucide-react';

interface Nomination {
  id: string;
  entrepreneur_name: string;
  entrepreneur_phone: string;
  business_name: string;
  business_location: string;
  business_type: string;
  nominator_name: string;
  nominator_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  created_at: string;
}

export function AdminDashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [filteredNominations, setFilteredNominations] = useState<Nomination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated or not admin
  if (!loading && (!user || profile?.role !== 'admin')) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchNominations();
    }
  }, [user, profile]);

  useEffect(() => {
    filterNominations();
  }, [nominations, searchTerm, statusFilter]);

  const fetchNominations = async () => {
    try {
      const { data, error } = await supabase
        .from('nominations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNominations((data || []) as Nomination[]);
    } catch (error) {
      console.error('Error fetching nominations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nominations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterNominations = () => {
    let filtered = nominations;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(nom => nom.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(nom => 
        nom.entrepreneur_name.toLowerCase().includes(term) ||
        nom.business_location.toLowerCase().includes(term) ||
        nom.business_type.toLowerCase().includes(term) ||
        nom.business_name.toLowerCase().includes(term)
      );
    }

    setFilteredNominations(filtered);
  };

  const updateNominationStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('nominations')
        .update({ status, notes })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNominations(prev => 
        prev.map(nom => 
          nom.id === id ? { ...nom, status: status as any, notes: notes || nom.notes } : nom
        )
      );
      
      toast({
        title: "Success",
        description: `Nomination ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating nomination:', error);
      toast({
        title: "Error",
        description: "Failed to update nomination",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || profile?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nominations">Nominations</TabsTrigger>
            <TabsTrigger value="entrepreneurs">Featured Entrepreneurs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nominations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Nominations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search by name, location, or industry</Label>
                    <Input
                      id="search"
                      placeholder="Search nominations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Filter by status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nominations ({filteredNominations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNominations.map((nomination) => (
                    <Card key={nomination.id} className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-primary">
                                {nomination.entrepreneur_name}
                              </h3>
                              <Badge variant={getStatusBadgeVariant(nomination.status)}>
                                {nomination.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {new Date(nomination.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Business:</strong> {nomination.business_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Location:</strong> {nomination.business_location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Industry:</strong> {nomination.business_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Phone:</strong> {nomination.entrepreneur_phone}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Nominated by:</strong> {nomination.nominator_name}</span>
                              <span className="text-muted-foreground">({nomination.nominator_phone})</span>
                            </div>
                          </div>

                          {nomination.notes && (
                            <div className="pt-2 border-t">
                              <Label className="text-sm font-medium">Admin Notes:</Label>
                              <p className="text-sm text-muted-foreground mt-1">{nomination.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`notes-${nomination.id}`}>Notes</Label>
                            <Textarea
                              id={`notes-${nomination.id}`}
                              placeholder="Add notes about this nomination..."
                              defaultValue={nomination.notes}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                const textarea = document.getElementById(`notes-${nomination.id}`) as HTMLTextAreaElement;
                                updateNominationStatus(nomination.id, 'approved', textarea?.value);
                              }}
                              disabled={nomination.status === 'approved'}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const textarea = document.getElementById(`notes-${nomination.id}`) as HTMLTextAreaElement;
                                updateNominationStatus(nomination.id, 'rejected', textarea?.value);
                              }}
                              disabled={nomination.status === 'rejected'}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const textarea = document.getElementById(`notes-${nomination.id}`) as HTMLTextAreaElement;
                                updateNominationStatus(nomination.id, 'pending', textarea?.value);
                              }}
                              disabled={nomination.status === 'pending'}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {filteredNominations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No nominations found matching your criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="entrepreneurs">
            <Card>
              <CardHeader>
                <CardTitle>Featured Entrepreneurs Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Feature to manage featured entrepreneurs will be implemented here.
                  You can promote approved nominations to the featured entrepreneurs section.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}