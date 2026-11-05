"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRequireAuth } from "@/components/auth-provider";
import { FieldHint, NativeSelect } from "@/components/field";
import { ListingFrame } from "@/components/listing-frame";
import { ListingSheet } from "@/components/listing-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backend } from "@/lib/backend";
import { DISTRICTS } from "@/lib/constants";
import { formatPrice, isValidPhone, timeAgo } from "@/lib/format";
import type { Listing, Profile } from "@/lib/types";
import { useListings } from "@/lib/use-listings";
import { cn } from "@/lib/utils";

function MyListings({ userId }: { userId: string }) {
  const { listings, reload } = useListings({ userId, includeSold: true });

  const toggleSold = async (l: Listing) => {
    await backend.updateListing(l.id, { status: l.status === "sold" ? "available" : "sold" });
    toast(l.status === "sold" ? "Back on the market" : "Marked as sold");
    reload();
  };

  const remove = async (l: Listing) => {
    await backend.deleteListing(l.id);
    toast("Listing deleted");
    reload();
  };

  if (!listings) return <p className="text-muted-foreground">Loading…</p>;

  const active = listings.filter((l) => l.status === "available");
  const sold = listings.filter((l) => l.status === "sold");
  const free = listings.filter((l) => l.is_free);

  if (!listings.length) {
    return (
      <div className="paper px-6 py-14">
        <h2 className="text-lead">You have not listed anything yet.</h2>
        <p className="mt-2 text-muted-foreground">It takes about a minute with a photo.</p>
        <Link href="/sell" className={cn(buttonVariants(), "mt-6")}>
          List your first piece
        </Link>
      </div>
    );
  }

  return (
    <div>
      <dl className="grid grid-cols-3 gap-2">
        {[
          ["On the market", active.length],
          ["Sold", sold.length],
          ["Given free", free.length],
        ].map(([label, n]) => (
          <div key={label} className="paper p-4 md:p-6">
            <dt className="text-small text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-[2.5rem] font-extrabold leading-none tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-10">
        {listings.map((l) => (
          <li key={l.id} className="paper mb-3 flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap">
            <Link href={`/listings/${l.id}`} className="block h-16 w-20 shrink-0 overflow-hidden rounded-lg">
              <ListingFrame listing={l} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/listings/${l.id}`} className="block truncate font-semibold hover:text-brand">
                {l.title}
              </Link>
              <p className="text-small text-muted-foreground">
                {formatPrice(l)} · {l.status === "sold" ? "Sold" : "On the market"} · updated {timeAgo(l.updated_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Link href={`/listings/${l.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Edit
              </Link>
              <Button variant="ghost" size="sm" onClick={() => toggleSold(l)}>
                {l.status === "sold" ? "Relist" : "Mark sold"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive" />}>
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete “{l.title}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the listing and its photos for good. To keep it in your history, mark it as sold instead.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => remove(l)}>
                      Delete listing
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Saved({ userId }: { userId: string }) {
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    backend.getFavorites(userId).then(setIds);
  }, [userId]);
  const { listings } = useListings({ ids: ids ?? [], includeSold: true }, ids !== null);

  if (!ids || (ids.length && !listings)) return <p className="text-muted-foreground">Loading…</p>;
  if (!ids.length || !listings?.length) {
    return (
      <div className="paper px-6 py-14">
        <h2 className="text-lead">Nothing saved yet.</h2>
        <p className="mt-2 text-muted-foreground">Tap “Save for later” on any listing to keep it here.</p>
        <Link href="/explore" className="link-quiet mt-5 inline-block text-accent">
          Explore listings
        </Link>
      </div>
    );
  }
  return <ListingSheet listings={listings} />;
}

function ProfileForm() {
  const { profile } = useRequireAuth();
  if (!profile) return <p className="text-muted-foreground">Loading…</p>;
  return <ProfileFields profile={profile} key={profile.id} />;
}

function ProfileFields({ profile }: { profile: Profile }) {
  const { user, refreshProfile } = useRequireAuth();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [district, setDistrict] = useState(profile.district);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (phone && !isValidPhone(phone)) return setError("Enter a 10-digit mobile number.");
    setError(null);
    setBusy(true);
    try {
      await backend.updateProfile(user.id, { name: name.trim(), phone: phone.trim(), district, whatsapp });
      await refreshProfile();
      toast("Profile saved");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="paper grid max-w-xl gap-6 p-6" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="p-email">Email</Label>
        <Input id="p-email" value={user?.email ?? ""} disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="p-name">Name</Label>
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="p-phone">Mobile number</Label>
        <Input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-describedby="p-phone-hint" />
        <FieldHint id="p-phone-hint">Filled in on every new listing.</FieldHint>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="p-district">Home district</Label>
        <NativeSelect id="p-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">Not set</option>
          {DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </NativeSelect>
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#fbefe0] p-4">
        <span className="font-medium">Buyers can message me on WhatsApp</span>
        <Switch checked={whatsapp} onCheckedChange={(v) => setWhatsapp(Boolean(v))} aria-label="WhatsApp enabled" />
      </label>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={busy} className="justify-self-start">
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export default function DashboardPage() {
  const { user, profile, loading } = useRequireAuth();
  const router = useRouter();

  if (loading || !user) {
    return (
      <main className="page py-14">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const signOut = async () => {
    await backend.signOut();
    router.replace("/");
  };

  return (
    <main className="page pb-28 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-head">{profile?.name ? `Hello, ${profile.name.split(" ")[0]}` : "Your account"}</h1>
        <div className="flex items-center gap-5">
          <button type="button" className="link-quiet text-muted-foreground" onClick={signOut}>
            Log out
          </button>
          <Link href="/sell" className={buttonVariants()}>
            New listing
          </Link>
        </div>
      </div>

      <Tabs defaultValue="listings" className="mt-10">
        <TabsList variant="line" className="h-auto gap-6 p-0">
          <TabsTrigger value="listings" className="flex-none px-0 text-body">My listings</TabsTrigger>
          <TabsTrigger value="saved" className="flex-none px-0 text-body">Saved</TabsTrigger>
          <TabsTrigger value="profile" className="flex-none px-0 text-body">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-8 text-body">
          <MyListings userId={user.id} />
        </TabsContent>
        <TabsContent value="saved" className="mt-8 text-body">
          <Saved userId={user.id} />
        </TabsContent>
        <TabsContent value="profile" className="mt-8 text-body">
          <ProfileForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
