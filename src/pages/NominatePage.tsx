import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Award, CheckCircle, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const NominatePage = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate form submission
    console.log("Nomination submitted:", formData);
    setIsSubmitted(true);
    
    toast({
      title: "Nomination submitted successfully!",
      description: "Thank you for honoring a job creator.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-6">
        <Card className="max-w-2xl w-full shadow-elegant">
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
    <div className="min-h-screen bg-gradient-subtle py-12 px-6">
      <div className="max-w-4xl mx-auto">
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
        <Card className="mb-8 shadow-card">
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
        <Card className="shadow-elegant">
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
                      placeholder="+1 (555) 123-4567"
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
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="+1 (555) 123-4567"
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