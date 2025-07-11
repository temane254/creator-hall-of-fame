import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, MessageCircle, Phone } from "lucide-react";
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
}

const EntrepreneurDetailPage = () => {
  const { id } = useParams();
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);

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
    const message = `Hi ${entrepreneur.name}, I found your profile on the Job Creators Hall of Fame website. I'd love to connect with you!`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

        {/* Hero Section */}
        <Card className="shadow-elegant mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Profile Image */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={entrepreneur.profile_photo_url || "/placeholder.svg"}
                    alt={entrepreneur.name}
                    className="w-48 h-48 rounded-full object-cover border-4 border-gold/30 shadow-gold"
                  />
                  <div className="absolute -bottom-4 -right-4">
                    <img
                      src={badgeImage}
                      alt="Badge of Honor"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="md:col-span-2">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {entrepreneur.name}
                </h1>
                
                <h2 className="text-2xl font-semibold text-primary mb-6">
                  Featured Entrepreneur
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="bg-primary/10 text-primary mr-3">
                      {entrepreneur.industry}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-5 h-5 mr-2" />
                    <span>Job Creator</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleWhatsAppClick}
                    variant="hero" 
                    size="lg"
                    className="flex-1"
                  >
                    <MessageCircle className="mr-2" />
                    WhatsApp this Entrepreneur
                  </Button>
                  
                  {entrepreneur.whatsapp_number && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => window.open(`tel:${entrepreneur.whatsapp_number}`, '_self')}
                    >
                      <Phone className="mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Bio */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
              Professional Bio
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
              <Button 
                onClick={handleWhatsAppClick}
                variant="gold" 
                size="lg"
                className="text-lg px-8 py-4"
              >
                <MessageCircle className="mr-2" />
                Start WhatsApp Chat
              </Button>
              
              {entrepreneur.whatsapp_number && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => window.open(`tel:${entrepreneur.whatsapp_number}`, '_self')}
                >
                  <Phone className="mr-2" />
                  Call Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntrepreneurDetailPage;