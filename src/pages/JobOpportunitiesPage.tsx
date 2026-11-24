import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, MapPin, Search, Building2, ArrowLeft, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type JobOpportunity = Tables<"job_opportunities">;

const formatDeadline = (deadline: string) => new Date(`${deadline}T00:00:00`).toLocaleDateString(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const JobOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  useEffect(() => {
    document.title = "Job Opportunities - Job Creators Hall of Fame";
    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription?.setAttribute("content", "Explore current job opportunities from featured entrepreneurs and growing businesses.");
    void fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("job_opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOpportunities(data ?? []);
    } catch (error) {
      console.error("Error loading job opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const industries = useMemo(
    () => [...new Set(opportunities.map((job) => job.industry?.trim()).filter((industry): industry is string => Boolean(industry)))].sort(),
    [opportunities],
  );

  const filteredOpportunities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return opportunities.filter((job) => {
      const matchesIndustry = selectedIndustry === "all" || job.industry === selectedIndustry;
      const matchesSearch = !term || [job.title, job.company_name, job.industry, job.location, job.description]
        .some((value) => value?.toLowerCase().includes(term));
      return matchesIndustry && matchesSearch;
    });
  }, [opportunities, searchTerm, selectedIndustry]);

  const whatsappLink = (job: JobOpportunity) => {
    const number = job.whatsapp_number?.replace(/\D/g, "");
    if (!number) return null;
    const message = `Hello, I am interested in the ${job.title} opportunity at ${job.company_name}.`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <section className="relative isolate overflow-hidden border-b border-border">
        <img src={heroImage} alt="Entrepreneurs building local businesses" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-primary/80" />
        <div className="mx-auto max-w-7xl px-5 py-8 text-primary-foreground sm:px-8 sm:py-10">
          <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-primary-foreground/85 transition-colors hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Open roles</p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Job opportunities</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/90">
                Find your next opportunity with businesses creating jobs and growing communities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-primary-foreground/25 pt-5 md:min-w-64 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <div>
                <p className="text-3xl font-bold">{opportunities.length}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">Current openings</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{new Set(opportunities.map((job) => job.company_name)).size}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">Hiring businesses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Browse openings</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Find work that fits</h2>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_14rem] lg:max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search job opportunities"
                placeholder="Search role, company, or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger aria-label="Filter by industry"><SelectValue placeholder="All industries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industries.map((industry) => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="border-y border-border py-16 text-center text-muted-foreground">Loading opportunities…</div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOpportunities.map((job) => (
              <Card key={job.id} className="flex h-full flex-col border-border/80 transition-shadow hover:shadow-elegant">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-foreground">{job.company_name}</p>
                        {job.industry && <p className="mt-0.5 text-sm text-muted-foreground">{job.industry}</p>}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{job.employment_type}</Badge>
                  </div>

                  <h3 className="break-words text-xl font-bold leading-snug text-foreground">{job.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {job.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>}
                    {job.application_deadline && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Apply by {formatDeadline(job.application_deadline)}</span>}
                  </div>
                  <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                  {job.requirements && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="mb-1 text-sm font-semibold text-foreground">Requirements</p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.requirements}</p>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-5">
                    {job.application_email && (
                      <Button asChild size="sm" className="flex-1">
                        <a href={`mailto:${job.application_email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}>
                          <Mail aria-hidden="true" />Apply by email
                        </a>
                      </Button>
                    )}
                    {job.application_url && (
                      <Button asChild size="sm" variant={job.application_email ? "outline" : "default"} className="flex-1">
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink aria-hidden="true" />Apply online
                        </a>
                      </Button>
                    )}
                    {whatsappLink(job) && (
                      <Button asChild size="icon" variant="outline" aria-label={`Ask about ${job.title} on WhatsApp`}>
                        <a href={whatsappLink(job) ?? undefined} target="_blank" rel="noopener noreferrer">
                          <MessageCircle aria-hidden="true" />
                        </a>
                      </Button>
                    )}
                    {!job.application_email && !job.application_url && !job.whatsapp_number && (
                      <p className="text-sm text-muted-foreground">Application details are not available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border-y border-border py-16 text-center">
            <Briefcase className="mx-auto mb-4 h-9 w-9 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-foreground">No openings match your search</h3>
            <p className="mt-2 text-muted-foreground">Try another search or check back soon for new opportunities.</p>
            {(searchTerm || selectedIndustry !== "all") && (
              <Button variant="outline" className="mt-5" onClick={() => { setSearchTerm(""); setSelectedIndustry("all"); }}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-foreground">Discover the businesses behind the openings</p>
            <p className="mt-1 text-sm text-muted-foreground">Meet the entrepreneurs building these companies.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/entrepreneurs">Explore featured entrepreneurs</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default JobOpportunitiesPage;