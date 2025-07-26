import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, ArrowRight, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
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
  pinned: boolean;
}

const EntrepreneursPage = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [filteredEntrepreneurs, setFilteredEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  useEffect(() => {
    if (selectedIndustry === "all") {
      setFilteredEntrepreneurs(entrepreneurs);
    } else {
      setFilteredEntrepreneurs(entrepreneurs.filter(e => e.industry === selectedIndustry));
    }
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [selectedIndustry, entrepreneurs]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredEntrepreneurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntrepreneurs = filteredEntrepreneurs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchEntrepreneurs = async () => {
    try {
      const { data, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntrepreneurs(data || []);
      setFilteredEntrepreneurs(data || []);
      
      // Extract unique industries
      const uniqueIndustries = [...new Set((data || []).map(e => e.industry))];
      setIndustries(uniqueIndustries);
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
    <div className="min-h-screen bg-gradient-subtle py-12 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
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

        {/* Search by Industry */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Search by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Entrepreneurs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedEntrepreneurs.length > 0 ? (
            paginatedEntrepreneurs.map((entrepreneur) => (
              <Card key={entrepreneur.id} className="group shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm border border-border/50">
                <CardHeader className="text-center p-4">
                  <div className="relative mx-auto mb-4">
                    <img
                      src={entrepreneur.profile_photo_url || "/placeholder.svg"}
                      alt={entrepreneur.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gold/20 group-hover:border-gold/50 transition-colors"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-gold rounded-full p-1.5">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground break-words">
                    {entrepreneur.name}
                  </CardTitle>
                  
                  <CardDescription className="font-semibold text-primary text-sm">
                    Featured Entrepreneur
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 p-4 pt-0">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {entrepreneur.industry}
                    </Badge>
                  </div>
                  
                  <Link to={`/entrepreneur/${entrepreneur.id}`} className="block">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-sm py-2 px-3">
                      <span className="truncate">View Entrepreneur</span>
                      <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mb-12">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEntrepreneurs.length)} of {filteredEntrepreneurs.length} entrepreneurs
            </p>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Stats Section - Moved to bottom */}
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