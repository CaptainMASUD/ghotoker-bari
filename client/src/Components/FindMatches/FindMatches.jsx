"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Briefcase,
  ShieldCheck,
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
  GraduationCap,
  CalendarDays,
  Lock,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

const DEFAULT_FILTERS = {
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
};

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
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
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

function normalizeImageUrl(value) {
  if (!value) return "";

  const raw =
    typeof value === "string"
      ? value
      : value?.url || value?.secure_url || value?.path || value?.src || "";

  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return `${API_BASE_URL}${raw}`;
  }

  return `${API_BASE_URL}/${raw}`;
}

function getProfilePhoto(profile) {
  if (!profile) return "";

  const directPhoto =
    profile.profile_photo ||
    profile.profile_photo_url ||
    profile.avatar ||
    profile.photo;

  if (directPhoto) return normalizeImageUrl(directPhoto);

  if (Array.isArray(profile.profile_photos) && profile.profile_photos.length > 0) {
    return normalizeImageUrl(profile.profile_photos[0]);
  }

  return "";
}

function canShowProfilePhoto(profile) {
  const photoUrl = getProfilePhoto(profile);

  if (!photoUrl) return false;

  if (profile?.can_view_profile_photo === true) return true;
  if (profile?.can_view_profile_photos === true) return true;
  if (profile?.profile_photo_locked === false) return true;
  if (profile?.photo_locked === false) return true;

  return false;
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 pr-10 text-sm font-bold text-slate-700 outline-none transition hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
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
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    />
  );
}

function EmptyState({ title, message, onReset }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <Users className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        {message}
      </p>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Filters
        </button>
      ) : null}
    </div>
  );
}

function ProfileAvatar({ profile }) {
  const photoUrl = getProfilePhoto(profile);
  const showPhoto = canShowProfilePhoto(profile);

  return (
    <div className="relative mx-auto -mt-11 h-[88px] w-[88px]">
      <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-[5px] border-white bg-white shadow-xl shadow-rose-100 ring-1 ring-rose-100">
        {showPhoto ? (
          <img
            src={photoUrl}
            alt={profile?.full_name || "Profile"}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement.classList.add("bg-rose-50");
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50 text-rose-600">
            <Lock className="h-7 w-7" />
          </div>
        )}
      </div>

      {profile?.isVerified ? (
        <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-emerald-600 text-white shadow-md">
          <BadgeCheck className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-[13px] font-black text-slate-800">
          {value || "Hidden"}
        </p>
      </div>
    </div>
  );
}

function MatchCard({ profile, onView }) {
  const location =
    [profile?.current_district, profile?.current_division]
      .filter(Boolean)
      .join(", ") || "";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      className="group overflow-hidden rounded-[26px] border border-white bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100"
    >
      <div className="relative h-[86px] overflow-hidden bg-gradient-to-br from-rose-100 via-orange-50 to-white">
        <div className="absolute -left-10 -top-16 h-36 w-36 rounded-full bg-white/45" />
        <div className="absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-rose-200/35" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
          <Heart className="h-3.5 w-3.5 text-rose-600" />
          Match Profile
        </div>

        {profile?.match_score ? (
          <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white shadow-sm">
            {profile.match_score}% Match
          </div>
        ) : null}
      </div>

      <div className="px-4 pb-4">
        <ProfileAvatar profile={profile} />

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="max-w-[210px] truncate text-lg font-black text-slate-950">
              {profile?.full_name || "Profile"}
            </h3>

            {profile?.isVerified ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : null}
          </div>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {profile?.age ? `${profile.age} years` : "Age hidden"} ·{" "}
            {formatLabel(profile?.marital_status) || "Status hidden"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <InfoLine
            icon={UserRound}
            label="Gender"
            value={formatLabel(profile?.gender)}
          />

          <InfoLine icon={Heart} label="Religion" value={profile?.religion} />

          <InfoLine icon={MapPin} label="Location" value={location} />

          <InfoLine
            icon={Briefcase}
            label="Profession"
            value={profile?.profession}
          />

          {profile?.highest_education ? (
            <InfoLine
              icon={GraduationCap}
              label="Education"
              value={profile.highest_education}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView(profile)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-rose-700"
          >
            <Eye className="h-4 w-4" />
            View Details
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
            title="Shortlist"
          >
            <Star className="h-4 w-4" />
          </button>
        </div>
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
      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
    >
      <span>
        {label}: {formatLabel(value)}
      </span>
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white bg-white shadow-sm">
      <div className="h-[86px] animate-pulse bg-slate-100" />

      <div className="px-4 pb-4">
        <div className="mx-auto -mt-11 h-[88px] w-[88px] animate-pulse rounded-full border-[5px] border-white bg-slate-100 shadow-lg" />

        <div className="mx-auto mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mx-auto mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="mt-4 space-y-2">
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div className="mt-4 h-11 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function FindMatches() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false;
      return Boolean(value);
    }).length;
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const buildQueryString = (cursor = null, filterState = filters) => {
    const params = new URLSearchParams();

    params.set("limit", "12");

    if (cursor) params.set("cursor", cursor);

    Object.entries(filterState).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });

    return params.toString();
  };

  const fetchUsers = async ({
    append = false,
    cursor = null,
    filtersOverride = null,
  } = {}) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError("");
    }

    try {
      const queryString = buildQueryString(cursor, filtersOverride || filters);
      const url = `${API_BASE_URL}/api/user/browse?${queryString}`;
      const token = getToken();

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : {
            Accept: "application/json",
          };

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not load profiles. Please try again."
        );
      }

      const items = Array.isArray(result.items) ? result.items : [];

      setProfiles((prev) => (append ? [...prev, ...items] : items));
      setNextCursor(result.nextCursor || null);
      setHasNextPage(Boolean(result.hasNextPage));
    } catch (err) {
      setError(err?.message || "Something went wrong while loading profiles.");
      if (!append) setProfiles([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers({ append: false });
  }, []);

  const applyFilters = () => {
    setShowMobileFilters(false);
    fetchUsers({ append: false });
  };

  const resetAndFetch = () => {
    setFilters(DEFAULT_FILTERS);
    fetchUsers({ append: false, filtersOverride: DEFAULT_FILTERS });
  };

  const handleLoadMore = () => {
    if (!nextCursor || isLoadingMore) return;
    fetchUsers({ append: true, cursor: nextCursor });
  };

  const handleViewProfile = (profile) => {
    if (!profile?._id) return;

    const targetPath = `/find-matches/${profile._id}`;
    const token = getToken();

    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    navigate(targetPath);
  };

  const FilterPanel = (
    <div className="rounded-[28px] border border-white bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-950">Match Filters</h3>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Refine profiles by preference.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
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
          className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={applyFilters}
          className="h-11 rounded-2xl bg-rose-600 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[112px] text-slate-800">
      <div className="mx-auto max-w-[1580px] px-5 pb-10 sm:px-7 lg:px-10 xl:px-14 2xl:px-20">
        <div className="mb-6 rounded-[28px] border border-white bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                <Heart className="h-3.5 w-3.5" />
                GhotokerBari Matches
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Find Your Match
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Browse profiles and open details based on your membership access.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") fetchUsers({ append: false });
                  }}
                  placeholder="Search city, profession..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 lg:hidden"
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="mt-5 flex flex-wrap gap-2">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:sticky lg:top-[112px] lg:h-fit">
            {FilterPanel}
          </aside>

          <main className="min-w-0">
            {error ? (
              <div className="mb-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5 text-rose-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <h3 className="font-black">Could not load profiles</h3>

                    <p className="mt-1 text-sm font-semibold">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingCard key={index} />
                ))}
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {profiles.length} profiles loaded
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Open a profile to check available details.
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm sm:flex">
                    <CalendarDays className="h-4 w-4 text-rose-600" />
                    Updated profiles first
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
                title="No profiles found"
                message="Try changing your filters or check that profiles are approved and visible."
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
              className="ml-auto h-full max-w-md overflow-y-auto rounded-[28px] bg-[#f8f3ef] p-4"
            >
              <div className="mb-4 flex items-center justify-between rounded-[28px] bg-white p-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Filters
                  </h3>

                  <p className="text-sm font-semibold text-slate-500">
                    Refine profile list
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
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