import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Entrepreneur {
  id: string;
  name: string;
  industry: string;
  bio: string;
  profile_photo_url: string;
  company_logo_url: string;
  whatsapp_number: string;
}

const EntrepreneursPage = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const fetchEntrepreneurs = async () => {
    try {
      const { data, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntrepreneurs(data || []);
    } catch (error) {
      console.error('Error fetching entrepreneurs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading entrepreneurs...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary-light mb-6 transition-colors">
            <ArrowLeft className="mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Featured Entrepreneurs
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Meet the exceptional business leaders who are creating jobs, driving innovation, and making a positive impact in their communities.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center shadow-card">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {entrepreneurs.length}
              </div>
              <p className="text-muted-foreground">Featured Entrepreneurs</p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-card">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gold mb-2">
                {entrepreneurs.length * 5}+
              </div>
              <p className="text-muted-foreground">Jobs Created</p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-card">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {new Set(entrepreneurs.map(e => e.industry)).size}
              </div>
              <p className="text-muted-foreground">Industries Represented</p>
            </CardContent>
          </Card>
        </div>

        {/* Entrepreneurs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {entrepreneurs.length > 0 ? (
            entrepreneurs.map((entrepreneur) => (
              <Card key={entrepreneur.id} className="group shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <img
                      src={entrepreneur.profile_photo_url || "/placeholder.svg"}
                      alt={entrepreneur.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gold/20 group-hover:border-gold/50 transition-colors"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-gold rounded-full p-2">
                      <Users className="w-4 h-4 text-foreground" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-foreground">
                    {entrepreneur.name}
                  </CardTitle>
                  
                  <CardDescription className="font-semibold text-primary">
                    Featured Entrepreneur
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {entrepreneur.industry}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entrepreneur.bio ? entrepreneur.bio.substring(0, 150) + "..." : "Featured entrepreneur making a difference in their community."}
                  </p>
                  
                  <Link to={`/entrepreneur/${entrepreneur.id}`} className="block">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Entrepreneur
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">No featured entrepreneurs yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon to see our amazing job creators!</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <Card className="shadow-elegant bg-gradient-hero text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Know Someone Who Should Be Featured?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Help us recognize more exceptional entrepreneurs who are making a difference through job creation and community impact.
            </p>
            <Link to="/nominate">
              <Button variant="gold" size="lg" className="text-lg px-8 py-4">
                Submit a Nomination
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntrepreneursPage;