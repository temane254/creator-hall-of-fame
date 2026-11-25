import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Briefcase, Building2, ChevronLeft, ChevronRight, Globe, MessageCircle, Pin, Search, Users, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Entrepreneur = Tables<"entrepreneurs">;
type IndustryCategory = Tables<"industry_categories">;

const ITEMS_PER_PAGE = 10;

const getWhatsAppUrl = (number: string | null, name: string) => {
  const normalizedNumber = number?.replace(/\D/g, "");
  if (!normalizedNumber) return null;
  const message = `Hello ${name}, I found your business on the Job Creators Hall of Fame and would like to learn more about your services.`;
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
};

const getWebsiteUrl = (website: string) => /^https?:\/\//i.test(website) ? website : `https://${website}`;

const EntrepreneursPage = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [industryCategories, setIndustryCategories] = useState<IndustryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Featured Entrepreneurs - Job Creators Hall of Fame";
    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription?.setAttribute(
      "content",
      "Discover featured entrepreneurs, the businesses they build, the services they offer, and the jobs they create.",
    );

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Featured Entrepreneurs",
      description: "Discover featured entrepreneurs and the businesses they build.",
      url: `${window.location.origin}/entrepreneurs`,
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    void fetchDirectory();
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedIndustry]);

  const fetchDirectory = async () => {
    try {
      const [entrepreneurResult, industryResult] = await Promise.all([
        supabase
          .from("entrepreneurs")
          .select("*")
          .order("pinned", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false }),
        supabase.from("industry_categories").select("*").order("name", { ascending: true }),
      ]);

      if (entrepreneurResult.error) throw entrepreneurResult.error;
      setEntrepreneurs(entrepreneurResult.data ?? []);
      setIndustryCategories(industryResult.data ?? []);
    } catch (error) {
      console.error("Error fetching entrepreneurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const industries = useMemo(() => {
    const categoryNames = industryCategories.map((category) => category.name);
    const entrepreneurIndustries = entrepreneurs.map((entrepreneur) => entrepreneur.industry).filter(Boolean);
    return [...new Set([...categoryNames, ...entrepreneurIndustries])].sort((a, b) => a.localeCompare(b));
  }, [industryCategories, entrepreneurs]);

  const filteredEntrepreneurs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return entrepreneurs.filter((entrepreneur) => {
      const matchesIndustry = selectedIndustry === "all" || entrepreneur.industry === selectedIndustry;
      const matchesSearch = !term || [
        entrepreneur.name,
        entrepreneur.company_name,
        entrepreneur.industry,
        entrepreneur.bio,
      ].some((value) => value?.toLowerCase().includes(term));
      return matchesIndustry && matchesSearch;
    });
  }, [entrepreneurs, searchTerm, selectedIndustry]);

  const totalPages = Math.ceil(filteredEntrepreneurs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntrepreneurs = filteredEntrepreneurs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const jobsCreated = entrepreneurs.reduce((total, entrepreneur) => total + (entrepreneur.jobs_created ?? 0), 0);
  const representedIndustries = new Set(entrepreneurs.map((entrepreneur) => entrepreneur.industry).filter(Boolean)).size;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-muted-foreground">
        Loading entrepreneurs…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-gold/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link to="/jobs"><Briefcase className="h-4 w-4" aria-hidden="true" />Job opportunities</Link>
            </Button>
          </div>

          <div className="mt-9 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Meet the job creators</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">The businesses behind the impact</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Explore what these entrepreneurs do, the companies they have built, and the work they make possible.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search entrepreneurs and businesses"
                placeholder="Search a name, company, or service"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 bg-background pl-9"
              />
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger aria-label="Search by industry" className="h-11 bg-background">
                <SelectValue placeholder="Search by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            {selectedIndustry === "all" ? "Featured businesses" : selectedIndustry}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredEntrepreneurs.length} {filteredEntrepreneurs.length === 1 ? "business" : "businesses"}
          </p>
        </div>

        {paginatedEntrepreneurs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {paginatedEntrepreneurs.map((entrepreneur) => {
              const whatsappUrl = getWhatsAppUrl(entrepreneur.whatsapp_number, entrepreneur.name);
              return (
                <Card key={entrepreneur.id} className="group flex h-full flex-col overflow-hidden border-border/80 transition-shadow hover:shadow-elegant">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {entrepreneur.profile_photo_url ? (
                      <img
                        src={entrepreneur.profile_photo_url}
                        alt={entrepreneur.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <UserRound className="h-12 w-12" aria-hidden="true" />
                      </div>
                    )}
                    {entrepreneur.pinned && (
                      <Badge className="absolute left-2 top-2 gap-1 shadow-sm">
                        <Pin className="h-3 w-3" aria-hidden="true" />Pinned
                      </Badge>
                    )}
                    {typeof entrepreneur.jobs_created === "number" && (
                      <Badge variant="secondary" className="absolute bottom-2 right-2 gap-1 bg-background/95 text-foreground shadow-sm">
                        <Users className="h-3 w-3" aria-hidden="true" />{entrepreneur.jobs_created} jobs
                      </Badge>
                    )}
                  </div>

                  <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
                    <Badge variant="secondary" className="mb-2 w-fit max-w-full truncate">{entrepreneur.industry}</Badge>
                    <h3 className="line-clamp-2 break-words text-base font-bold leading-snug text-foreground">{entrepreneur.name}</h3>

                    {entrepreneur.company_name && (
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        {entrepreneur.company_logo_url ? (
                          <img src={entrepreneur.company_logo_url} alt="" className="h-8 w-8 shrink-0 rounded border border-border bg-background object-contain p-0.5" loading="lazy" />
                        ) : (
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <p className="line-clamp-1 break-words text-sm font-medium text-muted-foreground">{entrepreneur.company_name}</p>
                      </div>
                    )}

                    <p className="mt-3 line-clamp-3 min-h-[4.25rem] whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {entrepreneur.bio || "Services not listed yet."}
                    </p>

                    <div className="mt-auto space-y-2 border-t border-border pt-3">
                      {entrepreneur.website && (
                        <a
                          href={getWebsiteUrl(entrepreneur.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">Visit business website</span>
                        </a>
                      )}
                      <div className="grid gap-2">
                        {whatsappUrl && (
                          <Button asChild variant="outline" size="sm" className="w-full whitespace-normal px-2 text-xs leading-tight">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                              WhatsApp for services
                            </a>
                          </Button>
                        )}
                        <Button asChild size="sm" className="w-full whitespace-normal px-2 text-xs leading-tight">
                          <Link to={`/entrepreneur/${entrepreneur.id}`}>
                            View profile
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border-y border-border py-14 text-center">
            <Building2 className="mx-auto mb-4 h-9 w-9 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-foreground">No businesses match those filters</h3>
            <p className="mt-2 text-muted-foreground">Try a different search, or check back as more entrepreneurs are featured.</p>
            {(searchTerm || selectedIndustry !== "all") && (
              <Button variant="outline" className="mt-5" onClick={() => { setSearchTerm(""); setSelectedIndustry("all"); }}>
                Clear search
              </Button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-5">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} · 10 per page</span>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              Next<ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        <div className="mt-12 grid grid-cols-3 divide-x divide-border border-y border-border py-6 text-center">
          <div className="px-2">
            <p className="text-2xl font-bold text-primary">{entrepreneurs.length}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Featured entrepreneurs</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold text-primary">{jobsCreated}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Jobs created</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold text-primary">{representedIndustries}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Industries represented</p>
          </div>
        </div>

        <section className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Know a business worth celebrating?</h2>
            <p className="mt-2 text-muted-foreground">Nominate an entrepreneur creating opportunity in their community.</p>
          </div>
          <Button asChild variant="gold" size="lg" className="shrink-0">
            <Link to="/nominate">Submit a nomination<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </Button>
        </section>
      </section>
    </main>
  );
};

export default EntrepreneursPage;