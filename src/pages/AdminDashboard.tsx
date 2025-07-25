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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Phone, MapPin, Building2, User, Calendar, Edit, Plus, Image, Upload, Briefcase, Trash2, Pin, PinOff, Settings } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

interface Entrepreneur {
  id: string;
  name: string;
  bio: string | null;
  industry: string;
  profile_photo_url: string | null;
  company_logo_url: string | null;
  whatsapp_number: string | null;
  nomination_id: string | null;
  jobs_created: number | null;
  created_at: string;
  updated_at: string;
  email: string | null;
  badge_photo_url: string | null;
  pinned: boolean | null;
  company_name: string | null;
  website: string | null;
}

interface IndustryCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function AdminDashboard() {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [filteredNominations, setFilteredNominations] = useState<Nomination[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [industryCategories, setIndustryCategories] = useState<IndustryCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntrepreneur, setEditingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvedEntrepreneurName, setApprovedEntrepreneurName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entrepreneurToDelete, setEntrepreneurToDelete] = useState<string | null>(null);
  const [industryDialogOpen, setIndustryDialogOpen] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');

  useEffect(() => {
    console.log(user);
    if (user && user?.role === 'authenticated') {
      fetchNominations();
      fetchEntrepreneurs();
      fetchIndustryCategories();
    }
  }, [user]);

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
      console.log("data", data);
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

  const fetchIndustryCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setIndustryCategories((data || []) as IndustryCategory[]);
    } catch (error) {
      console.error('Error fetching industry categories:', error);
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

  const fetchEntrepreneurs = async () => {
    try {
      const { data, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntrepreneurs((data || []) as Entrepreneur[]);
    } catch (error) {
      console.error('Error fetching entrepreneurs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch entrepreneurs",
        variant: "destructive",
      });
    }
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
          nom.id === id ? { ...nom, status: status as Nomination['status'], notes: notes || nom.notes } : nom
        )
      );

      // If approved, create/update entrepreneur entry
      if (status === 'approved') {
        const nomination = nominations.find(n => n.id === id);
        if (nomination) {
          await createEntrepreneurFromNomination(nomination);
        }
      }

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

  const createEntrepreneurFromNomination = async (nomination: Nomination) => {
    try {
      // Check if entrepreneur already exists for this nomination
      const { data: existingEntrepreneur } = await supabase
        .from('entrepreneurs')
        .select('id')
        .eq('nomination_id', nomination.id)
        .maybeSingle();

      if (existingEntrepreneur) {
        toast({
          title: "Already exists",
          description: "An entrepreneur profile already exists for this nomination.",
        });
        return;
      }

      const { error } = await supabase
        .from('entrepreneurs')
        .insert({
          name: nomination.entrepreneur_name,
          industry: nomination.business_type,
          whatsapp_number: nomination.entrepreneur_phone,
          nomination_id: nomination.id,
          company_name: nomination.business_name,
        });

      if (error) throw error;
      
      // Refresh entrepreneurs list
      fetchEntrepreneurs();
      
      // Show success dialog
      setApprovedEntrepreneurName(nomination.entrepreneur_name);
      setApprovalDialogOpen(true);
      
    } catch (error) {
      console.error('Error creating entrepreneur:', error);
      toast({
        title: "Error",
        description: "Failed to create entrepreneur profile",
        variant: "destructive",
      });
    }
  };

  const updateEntrepreneur = async (entrepreneur: Entrepreneur) => {
    try {
      const updateData = {
        name: entrepreneur.name,
        bio: entrepreneur.bio,
        industry: entrepreneur.industry,
        profile_photo_url: entrepreneur.profile_photo_url,
        company_logo_url: entrepreneur.company_logo_url,
        whatsapp_number: entrepreneur.whatsapp_number,
        jobs_created: entrepreneur.jobs_created,
        email: entrepreneur.email,
        badge_photo_url: entrepreneur.badge_photo_url,
        pinned: entrepreneur.pinned,
        company_name: entrepreneur.company_name,
        website: entrepreneur.website,
      };

      if (entrepreneur.id && entrepreneurs.find(ent => ent.id === entrepreneur.id)) {
        // Update existing entrepreneur
        const { error } = await supabase
          .from('entrepreneurs')
          .update(updateData)
          .eq('id', entrepreneur.id);

        if (error) throw error;

        // Update local state
        setEntrepreneurs(prev =>
          prev.map(ent => ent.id === entrepreneur.id ? entrepreneur : ent)
        );
      } else {
        // Create new entrepreneur
        const { data, error } = await supabase
          .from('entrepreneurs')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setEntrepreneurs(prev => [data, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingEntrepreneur(null);

      toast({
        title: "Success",
        description: entrepreneur.id ? "Entrepreneur updated successfully" : "Entrepreneur created successfully",
      });
    } catch (error) {
      console.error('Error saving entrepreneur:', error);
      toast({
        title: "Error",
        description: "Failed to save entrepreneur",
        variant: "destructive",
      });
    }
  };

  const deleteEntrepreneur = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entrepreneurs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntrepreneurs(prev => prev.filter(ent => ent.id !== id));
      
      toast({
        title: "Success",
        description: "Entrepreneur deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entrepreneur:', error);
      toast({
        title: "Error",
        description: "Failed to delete entrepreneur",
        variant: "destructive",
      });
    }
  };

  const addIndustryCategory = async () => {
    if (!newIndustryName.trim()) return;

    try {
      const { error } = await supabase
        .from('industry_categories')
        .insert({ name: newIndustryName.trim() });

      if (error) throw error;

      await fetchIndustryCategories();
      setNewIndustryName('');
      setIndustryDialogOpen(false);

      toast({
        title: "Success",
        description: "Industry category added successfully",
      });
    } catch (error) {
      console.error('Error adding industry category:', error);
      toast({
        title: "Error",
        description: "Failed to add industry category",
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

  if (!loading && (!user || user?.role !== 'authenticated')) {
    return <Navigate to="/auth" replace />;
  }

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
        <div className="md:container mx-auto px-2 md:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="md:container mx-auto md:px-6 py-8">
        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nominations">Nominations</TabsTrigger>
            <TabsTrigger value="entrepreneurs">Featured Entrepreneurs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm lg:text-xl">
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
                            {nomination.status !== 'approved' && (
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
                            )}
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

          <TabsContent value="entrepreneurs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Featured Entrepreneurs Management
                  <Button 
                    onClick={() => {
                      setEditingEntrepreneur({
                        id: '',
                        name: '',
                        bio: '',
                        industry: '',
                        profile_photo_url: '',
                        company_logo_url: '',
                        whatsapp_number: '',
                        nomination_id: null,
                        jobs_created: 0,
                        created_at: '',
                        updated_at: '',
                        email: '',
                        badge_photo_url: '',
                        pinned: false,
                        company_name: '',
                        website: ''
                      });
                      setIsDialogOpen(true);
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entrepreneur
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entrepreneurs.map((entrepreneur) => (
                    <Card key={entrepreneur.id} className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              {entrepreneur.profile_photo_url ? (
                                <img
                                  src={entrepreneur.profile_photo_url}
                                  alt={entrepreneur.name}
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-primary">
                                    {entrepreneur.name}
                                  </h3>
                                  {entrepreneur.pinned && (
                                    <Pin className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {entrepreneur.industry}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {entrepreneur.whatsapp_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span><strong>WhatsApp:</strong> {entrepreneur.whatsapp_number}</span>
                              </div>
                            )}
                            {entrepreneur.jobs_created !== null && entrepreneur.jobs_created > 0 && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Jobs Created:</strong> {entrepreneur.jobs_created}</span>
                              </div>
                            )}
                            {entrepreneur.company_name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Company:</strong> {entrepreneur.company_name}</span>
                              </div>
                            )}
                          </div>

                          {entrepreneur.bio && (
                            <div className="pt-2 border-t">
                              <Label className="text-sm font-medium">Bio:</Label>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                {entrepreneur.bio}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEntrepreneur(entrepreneur);
                              setIsDialogOpen(true);
                            }}
                            className="w-full"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {entrepreneurs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No entrepreneurs found. Approve nominations to create entrepreneur profiles.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Industry Categories Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIndustryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Industry Category
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {industryCategories.map((category) => (
                    <Badge key={category.id} variant="outline" className="p-2 justify-center">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Entrepreneur Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntrepreneur?.id ? 'Edit Entrepreneur' : 'Add New Entrepreneur'}
              </DialogTitle>
            </DialogHeader>
            {editingEntrepreneur && (
              <EntrepreneurForm
                entrepreneur={editingEntrepreneur}
                industryCategories={industryCategories}
                onSave={updateEntrepreneur}
                onDelete={(id) => {
                  setEntrepreneurToDelete(id);
                  setDeleteDialogOpen(true);
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingEntrepreneur(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Industry Category Dialog */}
        <Dialog open={industryDialogOpen} onOpenChange={setIndustryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Industry Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry-name">Industry Name</Label>
                <Input
                  id="industry-name"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  placeholder="Enter industry name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIndustryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addIndustryCategory}>
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the entrepreneur profile.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (entrepreneurToDelete) {
                    deleteEntrepreneur(entrepreneurToDelete);
                    setIsDialogOpen(false);
                  }
                  setDeleteDialogOpen(false);
                  setEntrepreneurToDelete(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Approval Success Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Nomination Approved!</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="text-green-600 text-6xl">✓</div>
              <p className="text-lg">
                <strong>{approvedEntrepreneurName}</strong> has been successfully added to Featured Entrepreneurs.
              </p>
              <p className="text-sm text-muted-foreground">
                You can now update their profile details, upload photos, and add additional information in the Featured Entrepreneurs tab.
              </p>
              <Button 
                onClick={() => {
                  setApprovalDialogOpen(false);
                  // Switch to entrepreneurs tab
                  const entrepreneursTab = document.querySelector('[value="entrepreneurs"]') as HTMLElement;
                  entrepreneursTab?.click();
                }}
                className="w-full"
              >
                Go to Featured Entrepreneurs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// EntrepreneurForm component
interface EntrepreneurFormProps {
  entrepreneur: Entrepreneur;
  industryCategories: IndustryCategory[];
  onSave: (entrepreneur: Entrepreneur) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

function EntrepreneurForm({ entrepreneur, industryCategories, onSave, onDelete, onCancel }: EntrepreneurFormProps) {
  const [formData, setFormData] = useState<Entrepreneur>(entrepreneur);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBadge, setUploadingBadge] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      onSave(formData);
    } else {
      // For new entrepreneurs, we need to create them
      onSave({ ...formData, id: crypto.randomUUID() });
    }
  };

  const handleChange = (field: keyof Entrepreneur, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadImage = async (file: File, type: 'profile' | 'logo' | 'badge' = 'profile') => {
    try {
      if (type === 'profile') setUploading(true);
      else if (type === 'logo') setUploadingLogo(true);
      else setUploadingBadge(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('entrepreneur-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('entrepreneur-photos')
        .getPublicUrl(fileName);

      const urlField = type === 'profile' ? 'profile_photo_url' : 
                       type === 'logo' ? 'company_logo_url' : 'badge_photo_url';

      setFormData(prev => ({
        ...prev,
        [urlField]: data.publicUrl
      }));

      toast({
        title: "Success",
        description: `${type === 'profile' ? 'Profile photo' : type === 'logo' ? 'Company logo' : 'Badge'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${type === 'profile' ? 'profile photo' : type === 'logo' ? 'company logo' : 'badge'}`,
        variant: "destructive",
      });
    } finally {
      if (type === 'profile') setUploading(false);
      else if (type === 'logo') setUploadingLogo(false);
      else setUploadingBadge(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo' | 'badge' = 'profile') => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file, type);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Entrepreneur name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industryCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="entrepreneur@example.com"
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp_number || ''}
            onChange={(e) => handleChange('whatsapp_number', e.target.value)}
            placeholder="+1234567890"
            type="tel"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Entrepreneur's Services</Label>
        <Textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Describe the services this entrepreneur provides..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://company.com"
            type="url"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobs_created">Jobs Created</Label>
          <Input
            id="jobs_created"
            value={formData.jobs_created || 0}
            onChange={(e) => handleChange('jobs_created', parseInt(e.target.value) || 0)}
            placeholder="0"
            type="number"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile_photo">Profile Photo</Label>
          <div className="space-y-2">
            {formData.profile_photo_url && (
              <img
                src={formData.profile_photo_url}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover mx-auto"
              />
            )}
            <Input
              id="profile_photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_logo">Company Logo</Label>
          <div className="space-y-2">
            {formData.company_logo_url && (
              <img
                src={formData.company_logo_url}
                alt="Company logo preview"
                className="h-20 w-20 rounded object-contain border mx-auto"
              />
            )}
            <Input
              id="company_logo"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
              disabled={uploadingLogo}
            />
            {uploadingLogo && (
              <p className="text-sm text-muted-foreground">Uploading logo...</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge_photo">Badge of Honor</Label>
          <div className="space-y-2">
            {formData.badge_photo_url && (
              <img
                src={formData.badge_photo_url}
                alt="Badge preview"
                className="h-20 w-20 rounded object-contain border mx-auto"
              />
            )}
            <Input
              id="badge_photo"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'badge')}
              disabled={uploadingBadge}
            />
            {uploadingBadge && (
              <p className="text-sm text-muted-foreground">Uploading badge...</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="pinned"
          checked={formData.pinned || false}
          onChange={(e) => handleChange('pinned', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="pinned">Pin to top of entrepreneurs list</Label>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <div>
          {entrepreneur.id && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => onDelete(entrepreneur.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {entrepreneur.id ? 'Update' : 'Create'} Entrepreneur
          </Button>
        </div>
      </div>
    </form>
  );
}
