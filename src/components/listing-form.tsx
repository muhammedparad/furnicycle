"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AnalyzeResult } from "@/app/api/ai/analyze/route";
import { useAuth } from "@/components/auth-provider";
import { FieldHint, NativeSelect } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { backend } from "@/lib/backend";
import { CATEGORIES, CONDITIONS, DISTRICTS, MAX_IMAGES, categoryLabel, conditionLabel, districtCoords } from "@/lib/constants";
import { formatRupees, isValidPhone } from "@/lib/format";
import { compressImage, imageForAi } from "@/lib/image";
import type { Category, Condition, Listing } from "@/lib/types";

interface Photo {
  key: string;
  src: string; // object URL for new photos, stored URL for existing ones
  blob?: Blob;
}

type Errors = Partial<Record<"title" | "price" | "district" | "phone" | "photos", string>>;

export function ListingForm({
  existing,
  defaults,
}: {
  existing?: Listing;
  defaults?: { category?: Category; condition?: Condition };
}) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>(
    () => existing?.images.map((src) => ({ key: src, src })) ?? [],
  );
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState<Category>(existing?.category ?? defaults?.category ?? "sofa");
  const [condition, setCondition] = useState<Condition>(existing?.condition ?? defaults?.condition ?? "good");
  const [isFree, setIsFree] = useState(existing?.is_free ?? false);
  const [price, setPrice] = useState(existing && !existing.is_free ? String(existing.price) : "");
  const [district, setDistrict] = useState(existing?.district ?? profile?.district ?? "");
  const [town, setTown] = useState(existing?.town ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    existing?.lat != null && existing?.lng != null ? { lat: existing.lat, lng: existing.lng } : null,
  );
  const [sellerName, setSellerName] = useState(existing?.seller_name ?? profile?.name ?? "");
  const [phone, setPhone] = useState(existing?.contact_phone ?? profile?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp ?? profile?.whatsapp ?? true);
  const [age, setAge] = useState("");
  const [original, setOriginal] = useState("");

  const [ai, setAi] = useState<AnalyzeResult | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(
    () => () => photos.forEach((p) => p.blob && URL.revokeObjectURL(p.src)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - photos.length;
    const chosen = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length > room) toast(`Up to ${MAX_IMAGES} photos per listing.`);
    try {
      const added = await Promise.all(
        chosen.map(async (f) => {
          const blob = await compressImage(f);
          return { key: crypto.randomUUID(), src: URL.createObjectURL(blob), blob };
        }),
      );
      setPhotos((p) => [...p, ...added]);
      setErrors((e) => ({ ...e, photos: undefined }));
    } catch {
      toast.error("One of those files could not be read as an image.");
    }
  };

  const removePhoto = (key: string) =>
    setPhotos((ps) => {
      const p = ps.find((x) => x.key === key);
      if (p?.blob) URL.revokeObjectURL(p.src);
      return ps.filter((x) => x.key !== key);
    });

  const makeCover = (key: string) =>
    setPhotos((ps) => [...ps.filter((x) => x.key === key), ...ps.filter((x) => x.key !== key)]);

  const runAi = async () => {
    setAiBusy(true);
    try {
      const comps = await backend.listListings({ category, limit: 50 });
      const first = photos[0];
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: first ? await imageForAi(first.blob ?? first.src) : undefined,
          category,
          condition,
          ageYears: age ? Number(age) : undefined,
          originalPrice: original ? Number(original) : undefined,
          comparables: comps.filter((l) => !l.is_free && l.id !== existing?.id).map((l) => l.price),
        }),
      });
      if (!res.ok) throw new Error();
      setAi((await res.json()) as AnalyzeResult);
    } catch {
      toast.error("Could not get a suggestion right now. Try again in a moment.");
    } finally {
      setAiBusy(false);
    }
  };

  const applyIdentified = () => {
    if (!ai?.identified) return;
    setTitle(ai.identified.title);
    setDescription((d) => d || ai.identified!.description);
    setCategory(ai.identified.category);
    setCondition(ai.identified.condition);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Your browser cannot share location.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        if (!district) {
          const nearest = [...DISTRICTS].sort(
            (a, b) => Math.hypot(a.lat - lat, a.lng - lng) - Math.hypot(b.lat - lat, b.lng - lng),
          )[0];
          setDistrict(nearest.name);
        }
        toast("Pickup location set from this device");
      },
      () => toast.error("Location permission was not given."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (title.trim().length < 3) e.title = "Give it a short name, at least 3 letters.";
    if (!isFree && !(Number(price) > 0)) e.price = "Enter a price, or switch on “Give it away free”.";
    if (!district) e.district = "Choose the district it will be collected from.";
    if (!isValidPhone(phone)) e.phone = "Enter a 10-digit mobile number.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!user) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setSaving(true);
    try {
      const images = await Promise.all(photos.map((p) => (p.blob ? backend.uploadImage(p.blob, user.id) : p.src)));
      const point = coords ?? districtCoords(district);
      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: isFree ? 0 : Math.round(Number(price)),
        is_free: isFree,
        district,
        town: town.trim(),
        lat: point.lat,
        lng: point.lng,
        images,
        seller_name: sellerName.trim(),
        contact_phone: phone.trim(),
        whatsapp,
      };
      const saved = existing
        ? await backend.updateListing(existing.id, data)
        : await backend.createListing({ ...data, user_id: user.id });
      if (profile && (!profile.phone || !profile.district)) {
        backend
          .updateProfile(user.id, { phone: profile.phone || data.contact_phone, district: profile.district || district })
          .catch(() => {});
      }
      toast(existing ? "Listing updated" : "Your listing is live");
      router.push(`/listings/${saved.id}`);
    } catch (err) {
      toast.error((err as Error).message || "Could not save the listing.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-16 md:grid-cols-12 md:gap-8">
      <div className="space-y-5 md:col-span-7">
        <div className="paper p-5 md:p-6">
        <fieldset>
          <legend className="text-lead font-medium">Photos</legend>
          <p className="mt-1 text-muted-foreground">Up to {MAX_IMAGES}. The first one is the cover. Daylight helps.</p>
          <ul className="mt-5 grid grid-cols-3 gap-2.5">
            {photos.map((p, i) => (
              <li key={p.key} className="group relative aspect-square overflow-hidden rounded-lg bg-[#fbefe0]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local previews and storage URLs */}
                <img src={p.src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-[#1f1a17]/70 text-small text-paper">
                  {i === 0 ? (
                    <span className="px-2 py-1.5">Cover</span>
                  ) : (
                    <button type="button" className="px-2 py-1.5 hover:underline" onClick={() => makeCover(p.key)}>
                      Make cover
                    </button>
                  )}
                  <button type="button" className="px-2 py-1.5 hover:underline" onClick={() => removePhoto(p.key)} aria-label={`Remove photo ${i + 1}`}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {photos.length < MAX_IMAGES && (
              <li className="aspect-square">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-paper-rule bg-[#fbefe0] text-body font-semibold transition-colors hover:bg-[#f6e3cc]"
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M14 5v18M5 14h18" />
                  </svg>
                  Add photos
                </button>
              </li>
            )}
          </ul>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </fieldset>
        </div>

        <div className="paper p-5 md:p-6">
        <fieldset className="grid gap-6">
          <legend className="text-lead font-medium">What it is</legend>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Three-seater teak sofa"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-err" : undefined}
            />
            {errors.title && <FieldHint id="title-err" error>{errors.title}</FieldHint>}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <NativeSelect id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <NativeSelect id="condition" value={condition} onChange={(e) => setCondition(e.target.value as Condition)} aria-describedby="condition-hint">
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </NativeSelect>
              <FieldHint id="condition-hint">{CONDITIONS.find((c) => c.value === condition)?.hint}</FieldHint>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              maxLength={2000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material, size, how old it is, any marks. Does it come apart? Which floor is it on?"
            />
          </div>
        </fieldset>
        </div>

        <div className="paper p-5 md:p-6">
        <fieldset className="grid gap-6">
          <legend className="text-lead font-medium">Price</legend>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#fbefe0] p-4">
            <span>
              <span className="block font-medium">Give it away free</span>
              <span className="text-small text-muted-foreground">Free listings get their own filter and go quickly.</span>
            </span>
            <Switch checked={isFree} onCheckedChange={(v) => setIsFree(Boolean(v))} aria-label="Give it away free" />
          </label>
          {!isFree && (
            <div className="grid gap-2">
              <Label htmlFor="price">Asking price (₹)</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="5000"
                className="text-lead"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-err" : undefined}
              />
              {errors.price && <FieldHint id="price-err" error>{errors.price}</FieldHint>}
            </div>
          )}
        </fieldset>
        </div>

        <div className="paper p-5 md:p-6">
        <fieldset className="grid gap-6">
          <legend className="text-lead font-medium">Pickup location</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <NativeSelect
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                aria-invalid={!!errors.district}
                aria-describedby={errors.district ? "district-err" : undefined}
              >
                <option value="">Choose a district</option>
                {DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </NativeSelect>
              {errors.district && <FieldHint id="district-err" error>{errors.district}</FieldHint>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="town">Town or area</Label>
              <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="Kakkanad" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="button" variant="outline" onClick={useMyLocation}>
              Use my current location
            </Button>
            <span className="text-small text-muted-foreground">
              {coords ? "Set from your device. Buyers see the area, not your address." : "Optional. Otherwise the district centre is shown."}
            </span>
          </div>
        </fieldset>
        </div>

        <div className="paper p-5 md:p-6">
        <fieldset className="grid gap-6">
          <legend className="text-lead font-medium">How buyers reach you</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="seller">Your name</Label>
              <Input id="seller" value={sellerName} onChange={(e) => setSellerName(e.target.value)} autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98470 12345"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-err" : "phone-hint"}
              />
              {errors.phone ? (
                <FieldHint id="phone-err" error>{errors.phone}</FieldHint>
              ) : (
                <FieldHint id="phone-hint">Shown on the listing so buyers can call or message.</FieldHint>
              )}
            </div>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#fbefe0] p-4">
            <span className="font-medium">Buyers can message me on WhatsApp</span>
            <Switch checked={whatsapp} onCheckedChange={(v) => setWhatsapp(Boolean(v))} aria-label="WhatsApp enabled" />
          </label>
        </fieldset>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving…" : existing ? "Save changes" : "Publish listing"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>

      <aside className="md:col-span-5" aria-labelledby="ai-heading">
        <div className="paper border-2 border-stamp/25 p-6 md:sticky md:top-6 md:p-7">
          <h2 id="ai-heading" className="text-lead font-medium">
            Price it with AI
          </h2>
          <p className="mt-2 text-ink-soft">
            {photos.length
              ? "FurniCycle looks at your cover photo, names the piece and suggests a fair price."
              : "Add a photo first for the best result, or get an estimate from the details alone."}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-small text-ink-soft">
              Years used
              <input
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="3"
                className="h-11 w-full min-w-0 rounded-xl border border-input bg-paper px-3 text-body text-ink placeholder:text-ink-soft/60 focus-visible:border-ring"
              />
            </label>
            <label className="grid gap-1.5 text-small text-ink-soft">
              Paid new (₹)
              <input
                inputMode="numeric"
                value={original}
                onChange={(e) => setOriginal(e.target.value.replace(/\D/g, ""))}
                placeholder="Optional"
                className="h-11 w-full min-w-0 rounded-xl border border-input bg-paper px-3 text-body text-ink placeholder:text-ink-soft/60 focus-visible:border-ring"
              />
            </label>
          </div>
          <Button type="button" variant="secondary" size="lg" className="mt-5 w-full" onClick={runAi} disabled={aiBusy}>
            {aiBusy ? "Looking…" : ai ? "Suggest again" : "Suggest a price"}
          </Button>

          {ai && (
            <div className="mt-8 space-y-6" aria-live="polite">
              {ai.identified && (
                <div>
                  {!ai.identified.is_furniture && (
                    <p className="mb-3 text-small text-ink-soft">That photo does not look like furniture. Check the cover photo.</p>
                  )}
                  <p className="text-small text-ink-soft">It looks like</p>
                  <p className="text-lead">{ai.identified.title}</p>
                  <p className="text-small text-ink-soft">
                    {categoryLabel(ai.identified.category)} · {conditionLabel(ai.identified.condition)}
                  </p>
                  <button type="button" className="mt-3 font-semibold text-brand underline underline-offset-4" onClick={applyIdentified}>
                    Use these details
                  </button>
                </div>
              )}
              <div>
                <p className="text-small text-ink-soft">Suggested price</p>
                <p className="text-[3rem] font-extrabold leading-none tracking-tight tabular-nums">{formatRupees(ai.price.suggested)}</p>
                <p className="text-ink-soft">
                  Range {formatRupees(ai.price.low)} to {formatRupees(ai.price.high)}
                </p>
                <p className="mt-2 text-small text-ink-soft">{ai.price.basis}</p>
                <button
                  type="button"
                  className="mt-3 font-semibold text-brand underline underline-offset-4"
                  onClick={() => {
                    setIsFree(false);
                    setPrice(String(ai.price.suggested));
                  }}
                >
                  Use {formatRupees(ai.price.suggested)}
                </button>
              </div>
              {ai.source === "estimate" && photos.length > 0 && (
                <p className="text-small text-ink-soft">Photo recognition is off on this server, so this is estimated from the details above.</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
