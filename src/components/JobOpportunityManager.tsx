import { useEffect, useState } from "react";
import { Briefcase, CalendarDays, Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type JobOpportunity = Tables<"job_opportunities">;

interface JobOpportunityDraft {
  title: string;
  company_name: string;
  industry: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  application_email: string;
  application_url: string;
  whatsapp_number: string;
  application_deadline: string;
  is_active: boolean;
}

const emptyDraft: JobOpportunityDraft = {
  title: "",
  company_name: "",
  industry: "",
  location: "",
  employment_type: "Full-time",
  description: "",
  requirements: "",
  application_email: "",
  application_url: "",
  whatsapp_number: "",
  application_deadline: "",
  is_active: true,
};

const optionalValue = (value: string) => value.trim() || null;

export function JobOpportunityManager() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<JobOpportunity | null>(null);
  const [draft, setDraft] = useState<JobOpportunityDraft>(emptyDraft);
  const [deleteTarget, setDeleteTarget] = useState<JobOpportunity | null>(null);

  useEffect(() => {
    void fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("job_opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data ?? []);
    } catch (error) {
      console.error("Error loading job opportunities:", error);
      toast({ title: "Could not load openings", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingOpportunity(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  };

  const openEditDialog = (opportunity: JobOpportunity) => {
    setEditingOpportunity(opportunity);
    setDraft({
      title: opportunity.title,
      company_name: opportunity.company_name,
      industry: opportunity.industry ?? "",
      location: opportunity.location ?? "",
      employment_type: opportunity.employment_type,
      description: opportunity.description,
      requirements: opportunity.requirements ?? "",
      application_email: opportunity.application_email ?? "",
      application_url: opportunity.application_url ?? "",
      whatsapp_number: opportunity.whatsapp_number ?? "",
      application_deadline: opportunity.application_deadline ?? "",
      is_active: opportunity.is_active,
    });
    setDialogOpen(true);
  };

  const updateDraft = (field: keyof JobOpportunityDraft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveOpportunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const payload: TablesInsert<"job_opportunities"> = {
      title: draft.title.trim(),
      company_name: draft.company_name.trim(),
      industry: optionalValue(draft.industry),
      location: optionalValue(draft.location),
      employment_type: draft.employment_type,
      description: draft.description.trim(),
      requirements: optionalValue(draft.requirements),
      application_email: optionalValue(draft.application_email),
      application_url: optionalValue(draft.application_url),
      whatsapp_number: optionalValue(draft.whatsapp_number),
      application_deadline: draft.application_deadline || null,
      is_active: draft.is_active,
    };

    try {
      if (editingOpportunity) {
        const { data, error } = await supabase
          .from("job_opportunities")
          .update(payload)
          .eq("id", editingOpportunity.id)
          .select()
          .single();
        if (error) throw error;
        setOpportunities((current) => current.map((item) => item.id === data.id ? data : item));
      } else {
        const { data, error } = await supabase
          .from("job_opportunities")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setOpportunities((current) => [data, ...current]);
      }

      setDialogOpen(false);
      toast({
        title: editingOpportunity ? "Opening updated" : "Opening published",
        description: draft.is_active ? "This opportunity is visible to visitors." : "This opportunity is saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving job opportunity:", error);
      toast({ title: "Could not save opening", description: "Please check the details and try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeOpportunity = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from("job_opportunities").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setOpportunities((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast({ title: "Opening removed" });
    } catch (error) {
      console.error("Error deleting job opportunity:", error);
      toast({ title: "Could not remove opening", description: "Please try again.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Careers board</p>
          <h2 className="text-2xl font-bold text-foreground">Job opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create openings and choose which ones visitors can see.</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus aria-hidden="true" />
          Add opening
        </Button>
      </header>

      {loading ? (
        <p className="py-10 text-center text-muted-foreground">Loading openings…</p>
      ) : opportunities.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold text-foreground">{opportunity.title}</h3>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{opportunity.company_name}</p>
                  </div>
                  <Badge variant={opportunity.is_active ? "default" : "secondary"}>
                    {opportunity.is_active ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{opportunity.employment_type}</span>
                  {opportunity.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{opportunity.location}</span>}
                  {opportunity.application_deadline && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Apply by {opportunity.application_deadline}</span>}
                </div>
                <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(opportunity)}>
                    <Edit aria-hidden="true" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(opportunity)}>
                    <Trash2 aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-y border-border py-14 text-center">
          <Briefcase className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-foreground">No openings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add the first opportunity to share it with visitors.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOpportunity ? "Edit opportunity" : "Add an opportunity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveOpportunity} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job title *</Label>
                <Input id="job-title" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-company">Company *</Label>
                <Input id="job-company" value={draft.company_name} onChange={(event) => updateDraft("company_name", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-industry">Industry</Label>
                <Input id="job-industry" value={draft.industry} onChange={(event) => updateDraft("industry", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input id="job-location" value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-employment-type">Employment type</Label>
                <Select value={draft.employment_type} onValueChange={(value) => updateDraft("employment_type", value)}>
                  <SelectTrigger id="job-employment-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-deadline">Application deadline</Label>
                <Input id="job-deadline" type="date" value={draft.application_deadline} onChange={(event) => updateDraft("application_deadline", event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Description *</Label>
              <Textarea id="job-description" rows={5} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-requirements">Requirements</Label>
              <Textarea id="job-requirements" rows={3} value={draft.requirements} onChange={(event) => updateDraft("requirements", event.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="job-email">Application email</Label>
                <Input id="job-email" type="email" value={draft.application_email} onChange={(event) => updateDraft("application_email", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-url">Application link</Label>
                <Input id="job-url" type="url" value={draft.application_url} onChange={(event) => updateDraft("application_url", event.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-whatsapp">WhatsApp number</Label>
                <Input id="job-whatsapp" type="tel" value={draft.whatsapp_number} onChange={(event) => updateDraft("whatsapp_number", event.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-3 border-t border-border pt-4 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(event) => updateDraft("is_active", event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Publish this opening on the public page
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingOpportunity ? "Save changes" : "Publish opening"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this opening?</AlertDialogTitle>
            <AlertDialogDescription>This opportunity will be permanently removed from the job board.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void removeOpportunity()}>Remove opening</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}