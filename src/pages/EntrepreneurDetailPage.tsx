import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, MessageCircle, Mail, Upload, Pin, Trash2, Globe, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import badgeImage from "@/assets/badge-of-honor.png";

interface Entrepreneur {
  id: string;
  name: string;
  industry: string;
  bio: string;
  profile_photo_url: string;
  company_logo_url: string;
  whatsapp_number: string;
  badge_photo_url: string;
  company_name: string;
  website: string;
  email: string;
  pinned: boolean;
}

const EntrepreneurDetailPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntrepreneur(id);
    }
  }, [id]);

  const fetchEntrepreneur = async (entrepreneurId: string) => {
    try {
      const { data, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .eq('id', entrepreneurId)
        .single();
      
      if (error) throw error;
      setEntrepreneur(data);
    } catch (error) {
      console.error('Error fetching entrepreneur:', error);
      setEntrepreneur(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!entrepreneur?.whatsapp_number) return;
    const phoneNumber = entrepreneur.whatsapp_number.replace(/\D/g, ''); // Remove non-digits
    const message = `Hi ${entrepreneur.name}, I found your profile on the Job Creators Hall of Fame website. I'd love to connect with you for services!`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    if (!entrepreneur?.email) return;
    const subject = "CV Submission for Future Opportunities";
    const body = `Dear ${entrepreneur.name},\n\nI found your profile on the Job Creators Hall of Fame website and would like to submit my CV for future opportunities.\n\nBest regards,`;
    window.open(`mailto:${entrepreneur.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleBadgeUpload = async (file: File) => {
    if (!entrepreneur || !user || profile?.role !== 'admin') return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${entrepreneur.id}-badge-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('entrepreneur-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('entrepreneur-photos')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('entrepreneurs')
        .update({ badge_photo_url: publicUrl })
        .eq('id', entrepreneur.id);
      
      if (updateError) throw updateError;
      
      setEntrepreneur(prev => prev ? { ...prev, badge_photo_url: publicUrl } : null);
      
      toast({
        title: "Badge updated successfully!",
        description: "The badge photo has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading badge:', error);
      toast({
        title: "Error uploading badge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePinToggle = async () => {
    if (!entrepreneur || !user || profile?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('entrepreneurs')
        .update({ pinned: !entrepreneur.pinned })
        .eq('id', entrepreneur.id);
      
      if (error) throw error;
      
      setEntrepreneur(prev => prev ? { ...prev, pinned: !prev.pinned } : null);
      
      toast({
        title: entrepreneur.pinned ? "Entrepreneur unpinned" : "Entrepreneur pinned",
        description: entrepreneur.pinned ? "Removed from top of list" : "Added to top of list",
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!entrepreneur || !user || profile?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('entrepreneurs')
        .delete()
        .eq('id', entrepreneur.id);
      
      if (error) throw error;
      
      toast({
        title: "Entrepreneur deleted",
        description: "The entrepreneur has been removed from the platform.",
      });
      
      // Redirect to entrepreneurs page
      window.location.href = '/entrepreneurs';
    } catch (error) {
      console.error('Error deleting entrepreneur:', error);
      toast({
        title: "Error deleting entrepreneur",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-6">
        <div>Loading entrepreneur details...</div>
      </div>
    );
  }

  if (!entrepreneur) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Entrepreneur Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The entrepreneur you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/entrepreneurs">
            <Button variant="outline">
              <ArrowLeft className="mr-2" />
              Back to Entrepreneurs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/entrepreneurs" className="inline-flex items-center text-primary hover:text-primary-light transition-colors">
            <ArrowLeft className="mr-2" />
            Back to All Entrepreneurs
          </Link>
        </div>

        {/* Admin Controls */}
        {profile?.role === 'admin' && (
          <Card className="shadow-card mb-8 border-amber-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handlePinToggle}
                  variant={entrepreneur.pinned ? "default" : "outline"}
                  size="sm"
                >
                  <Pin className="mr-2 w-4 h-4" />
                  {entrepreneur.pinned ? "Unpin" : "Pin to Top"}
                </Button>
                
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete
                </Button>
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBadgeUpload(file);
                    }}
                    className="hidden"
                    id="badge-upload"
                  />
                  <label htmlFor="badge-upload">
                    <Button asChild variant="outline" size="sm" disabled={isUploading}>
                      <span>
                        <Upload className="mr-2 w-4 h-4" />
                        {isUploading ? "Uploading..." : "Upload Badge"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <Card className="shadow-elegant mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Profile Image */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={entrepreneur.profile_photo_url || "/placeholder.svg"}
                    alt={entrepreneur.name}
                    className="w-48 h-48 rounded-full object-cover border-4 border-gold/30 shadow-gold"
                  />
                </div>
              </div>

              {/* Badge Image */}
              <div className="text-center">
                <img
                  src={entrepreneur.badge_photo_url || badgeImage}
                  alt="Badge of Honor"
                  className="w-48 h-48 rounded-full object-cover border-4 border-gold/30 shadow-gold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info Section */}
        <Card className="shadow-elegant mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {entrepreneur.name}
              </h1>
              
              <h2 className="text-2xl font-semibold text-primary mb-6">
                Featured Entrepreneur
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="bg-primary/10 text-primary mr-3">
                    {entrepreneur.industry}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-center text-muted-foreground">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Job Creator</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleWhatsAppClick}
                  variant="hero" 
                  size="lg"
                  className="flex-1 max-w-md"
                >
                  <MessageCircle className="mr-2" />
                  WhatsApp for Services
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Entrepreneur's Services */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
              Entrepreneur's Services
            </h3>
            
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              {entrepreneur.bio ? (
                entrepreneur.bio.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>This entrepreneur is making a positive impact in their community through job creation and business innovation.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
              Company Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Company Name
                  </h4>
                  <p className="text-muted-foreground">
                    {entrepreneur.company_name || "Company name not provided"}
                  </p>
                </div>
                
                {entrepreneur.website && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Website
                    </h4>
                    <a 
                      href={entrepreneur.website.startsWith('http') ? entrepreneur.website : `https://${entrepreneur.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {entrepreneur.website}
                    </a>
                  </div>
                )}
              </div>
              
              {entrepreneur.company_logo_url && (
                <div className="text-center">
                  <h4 className="font-semibold text-foreground mb-4">Company Logo</h4>
                  <img
                    src={entrepreneur.company_logo_url}
                    alt="Company Logo"
                    className="w-32 h-32 object-contain mx-auto border rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
              Business Impact
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  3+
                </div>
                <p className="text-muted-foreground">Jobs Created</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-gold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-foreground" />
                </div>
                <div className="text-3xl font-bold text-gold mb-2">
                  {entrepreneur.industry}
                </div>
                <p className="text-muted-foreground">Industry</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connect Section */}
        <Card className="shadow-elegant bg-gradient-hero text-primary-foreground">
          <CardContent className="text-center p-8">
            <h3 className="text-3xl font-bold mb-4">
              Connect with {entrepreneur.name.split(' ')[0]}
            </h3>
            <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Reach out to learn more about their entrepreneurial journey, explore potential collaborations, or simply connect with a fellow business leader.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {entrepreneur.email && (
                <Button 
                  onClick={handleEmailClick}
                  variant="gold" 
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  <Mail className="mr-2" />
                  Submit CV for Future Opportunities
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Entrepreneur</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {entrepreneur.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EntrepreneurDetailPage;