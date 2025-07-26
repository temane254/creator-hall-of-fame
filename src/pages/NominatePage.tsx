import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Award, CheckCircle, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const NominatePage = () => {
  useEffect(() => {
    // Update page title and meta description for SEO
    document.title = "Nominate an Entrepreneur - Job Creators Hall of Fame";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Nominate a visionary entrepreneur who has created jobs and made a positive impact in their community. Help us recognize outstanding business leaders.');
    }
    
    // Add structured data for the nomination page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Nominate an Entrepreneur",
      "description": "Nominate a visionary entrepreneur who has created jobs and made a positive impact in their community",
      "url": "https://your-domain.com/nominate"
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    entrepreneurName: "",
    entrepreneurPhone: "",
    businessName: "",
    businessLocation: "",
    businessType: "",
    nominatorName: "",
    nominatorPhone: "",
  });

  const businessTypes = [
    "Technology",
    "Retail",
    "Manufacturing",
    "Healthcare",
    "Education",
    "Food & Beverage",
    "Professional Services",
    "Construction",
    "Agriculture",
    "Transportation",
    "Entertainment",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = Object.values(formData);
    if (requiredFields.some(field => !field.trim())) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to submit your nomination.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('nominations')
        .insert([
          {
            entrepreneur_name: formData.entrepreneurName,
            entrepreneur_phone: formData.entrepreneurPhone,
            business_name: formData.businessName,
            business_location: formData.businessLocation,
            business_type: formData.businessType,
            nominator_name: formData.nominatorName,
            nominator_phone: formData.nominatorPhone,
          }
        ]);

      if (error) throw error;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-nomination-notification', {
          body: {
            entrepreneur_name: formData.entrepreneurName,
            entrepreneur_phone: formData.entrepreneurPhone,
            business_name: formData.businessName,
            business_location: formData.businessLocation,
            business_type: formData.businessType,
            nominator_name: formData.nominatorName,
            nominator_phone: formData.nominatorPhone,
          }
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the nomination if email fails
      }

      setIsSubmitted(true);

      toast({
        title: "Nomination submitted successfully!",
        description: "Thank you for honoring a job creator.",
      });
    } catch (error) {
      console.error('Error submitting nomination:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your nomination. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        
        <Card className="max-w-2xl w-full shadow-elegant bg-card/80 backdrop-blur-sm border border-border/50 relative z-10">
          <CardHeader className="text-center">
            <div className="bg-gradient-gold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-4">
              Thank You for Your Nomination!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for taking the time to honor a job creator. Your nomination is a spotlight on hope, creativity, and progress. We'll be featuring select entrepreneurs on our website and social media pages as part of our ongoing celebration of change makers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="hero" size="lg">
                  <ArrowLeft className="mr-2" />
                  Back to Home
                </Button>
              </Link>

              <Link to="/entrepreneurs">
                <Button variant="outline" size="lg">
                  View Featured Entrepreneurs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-primary/10 to-gold/10 rounded-full blur-2xl"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary-light mb-6 transition-colors">
            <ArrowLeft className="mr-2" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nominate an Entrepreneur
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Help us recognize exceptional entrepreneurs who are creating jobs, building communities, and driving positive change through their businesses.
          </p>
        </div>

        {/* Guidelines */}
        <Card className="mb-8 shadow-card bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Award className="mr-3 text-gold" />
              Nomination Guidelines
            </CardTitle>
            <CardDescription className="text-lg">
              To be eligible for recognition, the entrepreneur must meet these criteria:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Employment Creation</h3>
                  <p className="text-muted-foreground">Must have at least 3 employees, demonstrating their commitment to job creation and economic growth.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Physical Location</h3>
                  <p className="text-muted-foreground">Must operate from a physical business location, showing their investment in the local community.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nomination Form */}
        <Card className="shadow-elegant bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Nomination Form</CardTitle>
            <CardDescription>
              Please provide detailed information about the entrepreneur you'd like to nominate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Entrepreneur Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                  Entrepreneur Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entrepreneurName" className="text-sm font-medium">
                      Name of the Entrepreneur *
                    </Label>
                    <Input
                      id="entrepreneurName"
                      value={formData.entrepreneurName}
                      onChange={(e) => handleInputChange("entrepreneurName", e.target.value)}
                      placeholder="Enter entrepreneur's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entrepreneurPhone" className="text-sm font-medium">
                      Entrepreneur's Phone Number *
                    </Label>
                    <Input
                      id="entrepreneurPhone"
                      type="tel"
                      value={formData.entrepreneurPhone}
                      onChange={(e) => handleInputChange("entrepreneurPhone", e.target.value)}
                      placeholder="+254 XXXXXXXXX"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                  Business Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">
                    Name of the Business or Venture *
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessLocation" className="text-sm font-medium">
                    Business Location (Town/County/Country) *
                  </Label>
                  <Textarea
                    id="businessLocation"
                    value={formData.businessLocation}
                    onChange={(e) => handleInputChange("businessLocation", e.target.value)}
                    placeholder="Provide the complete business address or location details"
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">
                    Type of Business/Industry *
                  </Label>
                  <Input
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange("businessType", e.target.value)}
                    placeholder="Enter the type of business or industry"
                    required
                  />
                </div>
              </div>

              {/* Nominator Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                  Your Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nominatorName" className="text-sm font-medium">
                      Your Full Name *
                    </Label>
                    <Input
                      id="nominatorName"
                      value={formData.nominatorName}
                      onChange={(e) => handleInputChange("nominatorName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nominatorPhone" className="text-sm font-medium">
                      Your Phone Number *
                    </Label>
                    <Input
                      id="nominatorPhone"
                      type="tel"
                      value={formData.nominatorPhone}
                      onChange={(e) => handleInputChange("nominatorPhone", e.target.value)}
                      placeholder="+254 XXXXXXXXX"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full text-lg">
                Submit Nomination
                <Award className="ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NominatePage;