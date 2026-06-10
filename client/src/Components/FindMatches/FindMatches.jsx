"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Briefcase,
  ShieldCheck,
  Lock,
  SlidersHorizontal,
  Users,
  RefreshCw,
  ChevronDown,
  Star,
  Eye,
  Filter,
  X,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Search,
  UserRound,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const religions = ["Islam", "Hinduism", "Buddhism", "Christianity", "Other"];

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const educationOptions = [
  "SSC",
  "HSC",
  "Diploma",
  "Bachelor",
  "Masters",
  "PhD",
  "Other",
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const maritalStatuses = [
  { label: "Never Married", value: "never_married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
  { label: "Separated", value: "separated" },
];

function getToken() {
  return localStorage.getItem("token") || "";
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatLabel(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function InputField({ type = "text", value, onChange, placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    />
  );
}

function EmptyState({ title, message, onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <Users className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Filters
        </button>
      ) : null}
    </div>
  );
}

function LockedAvatar({ verified }) {
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-rose-100 bg-rose-50">
      <div className="flex h-full items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white text-rose-600 shadow-sm">
          <Lock className="h-7 w-7" />
        </div>
      </div>

      <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
        Photo Locked
      </div>

      {verified ? (
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
          <BadgeCheck className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

function MatchCard({ profile, onView }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-3xl border border-white bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100"
    >
      <LockedAvatar verified={profile?.isVerified} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black text-slate-900">
              {profile?.full_name || "Profile"}
            </h3>

            {profile?.isVerified ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : null}
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {profile?.age ? `${profile.age} years` : "Age hidden"} ·{" "}
            {formatLabel(profile?.marital_status) || "Status hidden"}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Heart className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-rose-500" />
          <span className="truncate">
            {formatLabel(profile?.gender) || "Gender hidden"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Heart className="h-4 w-4 text-rose-500" />
          <span className="truncate">
            {profile?.religion || "Religion hidden"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-rose-500" />
          <span className="truncate">
            {[profile?.current_district, profile?.current_division]
              .filter(Boolean)
              .join(", ") || "Location hidden"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Briefcase className="h-4 w-4 text-rose-500" />
          <span className="truncate">
            {profile?.profession || "Profession hidden"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
        Profile picture and full biodata are locked for privacy.
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(profile)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          <Eye className="h-4 w-4" />
          View Profile
        </button>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
          title="Shortlist"
        >
          <Star className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}

function ActiveFilterChip({ label, value, onRemove }) {
  if (!value) return null;

  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
    >
      <span>
        {label}: {formatLabel(value)}
      </span>
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

export default function FindMatch() {
  const [profiles, setProfiles] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    gender: "",
    religion: "",
    marital_status: "",
    division: "",
    district: "",
    city: "",
    profession: "",
    education: "",
    minAge: "",
    maxAge: "",
    verified: "",
  });

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false;
      return Boolean(value);
    }).length;
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFiltersOnly = () => {
    setFilters({
      search: "",
      gender: "",
      religion: "",
      marital_status: "",
      division: "",
      district: "",
      city: "",
      profession: "",
      education: "",
      minAge: "",
      maxAge: "",
      verified: "",
    });
  };

  const buildQueryString = (cursor = null) => {
    const params = new URLSearchParams();

    params.set("limit", "12");

    if (cursor) params.set("cursor", cursor);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });

    return params.toString();
  };

  const fetchUsers = async ({ append = false, cursor = null } = {}) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError("");
    }

    try {
      const queryString = buildQueryString(cursor);
      const url = `${API_BASE_URL}/api/user/browse?${queryString}`;

      const token = getToken();

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not load users. Please try again."
        );
      }

      const items = Array.isArray(result.items) ? result.items : [];

      setProfiles((prev) => (append ? [...prev, ...items] : items));
      setNextCursor(result.nextCursor || null);
      setHasNextPage(Boolean(result.hasNextPage));
    } catch (err) {
      setError(err?.message || "Something went wrong while loading users.");
      if (!append) setProfiles([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers({ append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setShowMobileFilters(false);
    fetchUsers({ append: false });
  };

  const resetAndFetch = () => {
    resetFiltersOnly();
    setTimeout(() => fetchUsers({ append: false }), 0);
  };

  const handleLoadMore = () => {
    if (!nextCursor || isLoadingMore) return;
    fetchUsers({ append: true, cursor: nextCursor });
  };

  const handleViewProfile = (profile) => {
    if (!profile?._id) return;
    window.location.href = `/profile/${profile._id}`;
  };

  const FilterPanel = (
    <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Find Match Filters
          </h3>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Filter all public normal users.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel>Looking For</FieldLabel>
          <SelectField
            value={filters.gender}
            onChange={(value) => updateFilter("gender", value)}
          >
            <option value="">Any Gender</option>
            {genderOptions.map((gender) => (
              <option key={gender.value} value={gender.value}>
                {gender.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div>
          <FieldLabel>Religion</FieldLabel>
          <SelectField
            value={filters.religion}
            onChange={(value) => updateFilter("religion", value)}
          >
            <option value="">Any Religion</option>
            {religions.map((religion) => (
              <option key={religion} value={religion}>
                {religion}
              </option>
            ))}
          </SelectField>
        </div>

        <div>
          <FieldLabel>Marital Status</FieldLabel>
          <SelectField
            value={filters.marital_status}
            onChange={(value) => updateFilter("marital_status", value)}
          >
            <option value="">Any Status</option>
            {maritalStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div>
          <FieldLabel>Division</FieldLabel>
          <SelectField
            value={filters.division}
            onChange={(value) => updateFilter("division", value)}
          >
            <option value="">Any Division</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </SelectField>
        </div>

        <div>
          <FieldLabel>District</FieldLabel>
          <InputField
            value={filters.district}
            onChange={(value) => updateFilter("district", value)}
            placeholder="Example: Dhaka"
          />
        </div>

        <div>
          <FieldLabel>City</FieldLabel>
          <InputField
            value={filters.city}
            onChange={(value) => updateFilter("city", value)}
            placeholder="Example: Mirpur"
          />
        </div>

        <div>
          <FieldLabel>Profession</FieldLabel>
          <InputField
            value={filters.profession}
            onChange={(value) => updateFilter("profession", value)}
            placeholder="Example: Engineer"
          />
        </div>

        <div>
          <FieldLabel>Education</FieldLabel>
          <SelectField
            value={filters.education}
            onChange={(value) => updateFilter("education", value)}
          >
            <option value="">Any Education</option>
            {educationOptions.map((education) => (
              <option key={education} value={education}>
                {education}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Min Age</FieldLabel>
            <InputField
              type="number"
              value={filters.minAge}
              onChange={(value) => updateFilter("minAge", value)}
              placeholder="18"
            />
          </div>

          <div>
            <FieldLabel>Max Age</FieldLabel>
            <InputField
              type="number"
              value={filters.maxAge}
              onChange={(value) => updateFilter("maxAge", value)}
              placeholder="35"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Verification</FieldLabel>
          <SelectField
            value={filters.verified}
            onChange={(value) => updateFilter("verified", value)}
          >
            <option value="">All Profiles</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </SelectField>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={resetAndFetch}
          className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={applyFilters}
          className="h-11 rounded-xl bg-rose-600 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[120px] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-white bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Find Match
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Showing all public normal users. Use filters to find a better
                match.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchUsers({ append: false });
                  }}
                  placeholder="Search name, city, profession..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 lg:hidden"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => fetchUsers({ append: false })}
                disabled={isLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Search
              </button>
            </div>
          </div>

          {activeFilterCount > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <ActiveFilterChip
                label="Gender"
                value={filters.gender}
                onRemove={() => updateFilter("gender", "")}
              />

              <ActiveFilterChip
                label="Religion"
                value={filters.religion}
                onRemove={() => updateFilter("religion", "")}
              />

              <ActiveFilterChip
                label="Marital"
                value={filters.marital_status}
                onRemove={() => updateFilter("marital_status", "")}
              />

              <ActiveFilterChip
                label="Division"
                value={filters.division}
                onRemove={() => updateFilter("division", "")}
              />

              <ActiveFilterChip
                label="District"
                value={filters.district}
                onRemove={() => updateFilter("district", "")}
              />

              <ActiveFilterChip
                label="City"
                value={filters.city}
                onRemove={() => updateFilter("city", "")}
              />

              <ActiveFilterChip
                label="Profession"
                value={filters.profession}
                onRemove={() => updateFilter("profession", "")}
              />

              <ActiveFilterChip
                label="Education"
                value={filters.education}
                onRemove={() => updateFilter("education", "")}
              />

              <ActiveFilterChip
                label="Min Age"
                value={filters.minAge}
                onRemove={() => updateFilter("minAge", "")}
              />

              <ActiveFilterChip
                label="Max Age"
                value={filters.maxAge}
                onRemove={() => updateFilter("maxAge", "")}
              />

              <ActiveFilterChip
                label="Verified"
                value={
                  filters.verified === "true"
                    ? "Verified Only"
                    : filters.verified === "false"
                    ? "Unverified Only"
                    : ""
                }
                onRemove={() => updateFilter("verified", "")}
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="hidden lg:block lg:sticky lg:top-[120px] lg:h-fit">
            {FilterPanel}
          </aside>

          <main className="min-w-0">
            {error ? (
              <div className="mb-6 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <h3 className="font-black">Could not load users</h3>

                    <p className="mt-1 text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-white bg-white p-4 shadow-sm"
                  >
                    <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />

                    <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-100" />

                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />

                    <div className="mt-5 space-y-2">
                      <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence>
                    {profiles.map((profile) => (
                      <MatchCard
                        key={profile._id}
                        profile={profile}
                        onView={handleViewProfile}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-center pb-6">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={!hasNextPage || isLoadingMore}
                    className={`inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black transition ${
                      hasNextPage
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : hasNextPage ? (
                      <>
                        <Users className="h-4 w-4" />
                        See More
                      </>
                    ) : (
                      "No More Profiles"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <EmptyState
                title="No users found"
                message="By default this page shows all public normal users. Try resetting filters or check if users are approved/pending review from the admin panel."
                onReset={resetAndFetch}
              />
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showMobileFilters ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/50 p-4 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              className="ml-auto h-full max-w-md overflow-y-auto rounded-3xl bg-[#f8f3ef] p-4"
            >
              <div className="mb-4 flex items-center justify-between rounded-3xl bg-white p-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Filters
                  </h3>

                  <p className="text-sm font-medium text-slate-500">
                    Refine public user list
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {FilterPanel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}