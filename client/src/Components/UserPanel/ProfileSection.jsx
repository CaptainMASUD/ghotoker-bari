// ProfileSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaUserCheck,
  FaCrown,
  FaInfoCircle,
  FaMars,
  FaVenus,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaIdCard,
  FaShieldAlt,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaHome,
  FaHeart,
  FaRulerVertical,
  FaChevronDown,
} from "react-icons/fa";
import { DetailField, GridSkeleton } from "./blocks";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function capitalize(value) {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function computeAgeFromDOB(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function formatRange(min, max) {
  const a = min !== undefined && min !== null && min !== "" ? String(min) : null;
  const b = max !== undefined && max !== null && max !== "" ? String(max) : null;

  if (a && b) return `${a} – ${b}`;
  if (a) return `${a}+`;
  if (b) return `≤ ${b}`;

  return "—";
}

function formatBool(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "—";
}

function formatList(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(capitalize).join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return capitalize(value);
  }

  return "—";
}

export default function ProfileSection(props) {
  const usingProps = !!props.effectiveMe || props.loadingMe !== undefined;

  const [fetchedMe, setFetchedMe] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (usingProps) return;

    let ignore = false;

    async function fetchMe() {
      try {
        setFetching(true);
        setFetchError("");

        const token = getToken();

        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load your profile.");
        }

        if (!ignore) {
          setFetchedMe(data?.user || null);
        }
      } catch (error) {
        if (!ignore) {
          setFetchError(error.message || "Couldn’t load your profile.");
          setFetchedMe(null);
        }
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    }

    fetchMe();

    return () => {
      ignore = true;
    };
  }, [usingProps]);

  const effectiveMe = props.effectiveMe ?? fetchedMe;
  const loadingMe = props.loadingMe ?? fetching;
  const membership = props.membership ?? effectiveMe?.membership_status ?? null;
  const completeness =
    props.completeness ?? effectiveMe?.profile_completeness ?? 0;

  if (loadingMe) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold">Profile</h3>
          <GridSkeleton />
        </div>
      </section>
    );
  }

  if (!effectiveMe) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="mt-3 text-white/70">
            {fetchError || "Couldn’t load your profile."}
          </p>
        </div>
      </section>
    );
  }

  const name =
    effectiveMe.full_name ||
    [effectiveMe.first_name, effectiveMe.last_name].filter(Boolean).join(" ") ||
    effectiveMe.username ||
    "—";

  const age = effectiveMe.age ?? computeAgeFromDOB(effectiveMe.dob);

  const photos = Array.isArray(effectiveMe.profile_photos)
    ? effectiveMe.profile_photos.filter(Boolean)
    : [];

  const avatarFallback =
    photos[0] ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || "User"
    )}`;

  const completenessTone =
    Number(completeness || 0) >= 80
      ? "ok"
      : Number(completeness || 0) >= 50
      ? "warn"
      : "muted";

  const genderLower = String(effectiveMe.gender || "").toLowerCase();

  const genderIcon =
    genderLower === "male" ? (
      <FaMars />
    ) : genderLower === "female" ? (
      <FaVenus />
    ) : (
      <FaInfoCircle />
    );

  const verification = effectiveMe.verification || {};
  const family = effectiveMe.family || {};
  const lifestyle = effectiveMe.lifestyle || {};
  const partner = effectiveMe.partner_preferences || {};
  const education = effectiveMe.education_details || {};
  const children = effectiveMe.children || {};
  const disability = effectiveMe.disability || {};
  const privacy = effectiveMe.privacy || {};

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <PhotoGallery photos={photos} fallback={avatarFallback} />

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">{name}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Chip
                icon={<FaUserCheck />}
                label={effectiveMe.isVerified ? "Verified" : "Not Verified"}
                tone={effectiveMe.isVerified ? "ok" : "muted"}
              />

              <Chip
                icon={<FaCrown />}
                label={`${capitalize(membership?.type || "free")} • ${
                  membership?.active ? "Active" : "Inactive"
                }`}
                tone={membership?.active ? "ok" : "warn"}
              />

              <Chip
                label={`Profile ${Number(completeness || 0)}%`}
                tone={completenessTone}
              />

              <Chip
                icon={<FaShieldAlt />}
                label={capitalize(effectiveMe.profile_status || "incomplete")}
                tone={
                  effectiveMe.profile_status === "approved"
                    ? "ok"
                    : effectiveMe.profile_status === "pending_review"
                    ? "warn"
                    : "muted"
                }
              />
            </div>

            <div className="mt-3 h-2 w-full max-w-[360px] rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full ${
                  completenessTone === "ok"
                    ? "bg-emerald-400/70"
                    : completenessTone === "warn"
                    ? "bg-amber-300/70"
                    : "bg-white/30"
                }`}
                style={{
                  width: `${Math.min(100, Number(completeness || 0))}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:text-right">
            <MiniFact icon={genderIcon} value={capitalize(effectiveMe.gender)} />
            <MiniFact
              icon={<FaInfoCircle />}
              value={age != null ? `${age} yrs` : "Age —"}
            />
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <CardRow
            icon={<FaEnvelope className="text-rose-300" />}
            label="Email"
            value={effectiveMe.email_address || "—"}
          />
          <CardRow
            icon={<FaPhoneAlt className="text-rose-300" />}
            label="Phone"
            value={effectiveMe.phone_number || "—"}
          />
          <CardRow
            icon={<FaMapMarkerAlt className="text-rose-300" />}
            label="City"
            value={effectiveMe.current_city || "—"}
          />
        </div>

        <div className="mt-8 space-y-4">
          <AccordionSection
            defaultOpen
            icon={<FaUser />}
            title="Basic Profile"
            subtitle="Name, gender, religion and core matrimony information"
          >
            <DetailGrid>
              <DetailField label="Full Name" value={name} />
              <DetailField label="Username" value={effectiveMe.username || "—"} />
              <DetailField label="Gender" value={capitalize(effectiveMe.gender)} />
              <DetailField label="Age" value={age ?? "—"} />
              <DetailField label="Date of Birth" value={formatDate(effectiveMe.dob)} />
              <DetailField
                label="Profile Created By"
                value={capitalize(effectiveMe.profile_created_by)}
              />
              <DetailField
                label="Marital Status"
                value={capitalize(effectiveMe.marital_status)}
              />
              <DetailField label="Religion" value={capitalize(effectiveMe.religion)} />
              <DetailField label="Sect" value={effectiveMe.sect || "—"} />
              <DetailField
                label="Community / Caste"
                value={effectiveMe.caste_or_community || "—"}
              />
              <DetailField
                label="Mother Tongue"
                value={effectiveMe.mother_tongue || "—"}
              />
              <DetailField
                label="Nationality"
                value={effectiveMe.nationality || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaMapMarkerAlt />}
            title="Location Details"
            subtitle="Current, permanent and preferred location"
          >
            <DetailGrid>
              <DetailField
                label="Current Country"
                value={effectiveMe.current_country || "—"}
              />
              <DetailField
                label="Current Division"
                value={effectiveMe.current_division || "—"}
              />
              <DetailField
                label="Current District"
                value={effectiveMe.current_district || "—"}
              />
              <DetailField
                label="Current City"
                value={effectiveMe.current_city || "—"}
              />
              <DetailField
                label="Permanent Division"
                value={effectiveMe.permanent_division || "—"}
              />
              <DetailField
                label="Permanent District"
                value={effectiveMe.permanent_district || "—"}
              />
              <DetailField
                label="Permanent Upazila"
                value={effectiveMe.permanent_upazila || "—"}
              />
              <DetailField
                label="Preferred Location"
                value={effectiveMe.preferred_location || "—"}
              />
              <DetailField
                label="Willing To Relocate"
                value={formatBool(effectiveMe.willing_to_relocate)}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaRulerVertical />}
            title="Physical Details"
            subtitle="Height, weight, body type and health related information"
          >
            <DetailGrid>
              <DetailField label="Height" value={effectiveMe.height || "—"} />
              <DetailField
                label="Height CM"
                value={effectiveMe.height_cm ? `${effectiveMe.height_cm} cm` : "—"}
              />
              <DetailField label="Weight" value={effectiveMe.weight || "—"} />
              <DetailField
                label="Weight KG"
                value={effectiveMe.weight_kg ? `${effectiveMe.weight_kg} kg` : "—"}
              />
              <DetailField
                label="Body Type"
                value={capitalize(effectiveMe.body_type)}
              />
              <DetailField
                label="Complexion"
                value={capitalize(effectiveMe.complexion)}
              />
              <DetailField
                label="Blood Group"
                value={effectiveMe.blood_group || "—"}
              />
              <DetailField
                label="Has Disability"
                value={formatBool(disability.has_disability)}
              />
              <DetailField
                label="Disability Details"
                value={disability.details || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaGraduationCap />}
            title="Education Details"
            subtitle="Education level, institute, result and passing year"
          >
            <DetailGrid>
              <DetailField
                label="Highest Education"
                value={effectiveMe.highest_education || "—"}
              />
              <DetailField
                label="Degree Name"
                value={education.degree_name || "—"}
              />
              <DetailField
                label="Institution"
                value={education.institution_name || "—"}
              />
              <DetailField
                label="Passing Year"
                value={education.passing_year || "—"}
              />
              <DetailField label="Result" value={education.result || "—"} />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaBriefcase />}
            title="Career Details"
            subtitle="Profession, occupation, company and income"
          >
            <DetailGrid>
              <DetailField
                label="Profession"
                value={effectiveMe.profession || "—"}
              />
              <DetailField
                label="Occupation Type"
                value={capitalize(effectiveMe.occupation_type)}
              />
              <DetailField
                label="Company / Business"
                value={effectiveMe.company_or_business_name || "—"}
              />
              <DetailField
                label="Designation"
                value={effectiveMe.designation || "—"}
              />
              <DetailField
                label="Annual Income"
                value={effectiveMe.annual_income || "—"}
              />
              <DetailField
                label="Monthly Income"
                value={effectiveMe.monthly_income || "—"}
              />
              <DetailField
                label="Monthly Income Min"
                value={effectiveMe.monthly_income_min || "—"}
              />
              <DetailField
                label="Monthly Income Max"
                value={effectiveMe.monthly_income_max || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaHome />}
            title="Family Details"
            subtitle="Family type, status, siblings and family background"
          >
            <DetailGrid>
              <DetailField
                label="Father Occupation"
                value={family.father_occupation || "—"}
              />
              <DetailField
                label="Mother Occupation"
                value={family.mother_occupation || "—"}
              />
              <DetailField
                label="Family Type"
                value={capitalize(family.family_type)}
              />
              <DetailField
                label="Family Status"
                value={capitalize(family.family_status)}
              />
              <DetailField
                label="Family Values"
                value={capitalize(family.family_values)}
              />
              <DetailField
                label="Brothers"
                value={family.number_of_brothers ?? "—"}
              />
              <DetailField
                label="Sisters"
                value={family.number_of_sisters ?? "—"}
              />
              <DetailField
                label="Married Brothers"
                value={family.brothers_married ?? "—"}
              />
              <DetailField
                label="Married Sisters"
                value={family.sisters_married ?? "—"}
              />
              <DetailField
                label="Family Details"
                value={family.family_details || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaInfoCircle />}
            title="Lifestyle Details"
            subtitle="Diet, smoking, drinking, prayer and hobbies"
          >
            <DetailGrid>
              <DetailField label="Diet" value={capitalize(lifestyle.diet)} />
              <DetailField label="Smoking" value={capitalize(lifestyle.smoking)} />
              <DetailField label="Drinking" value={capitalize(lifestyle.drinking)} />
              <DetailField label="Prayer" value={capitalize(lifestyle.prayer)} />
              <DetailField
                label="Hijab / Beard Preference"
                value={lifestyle.hijab_or_beard_preference || "—"}
              />
              <DetailField label="Hobbies" value={formatList(lifestyle.hobbies)} />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaHeart />}
            title="Marriage & Partner Preference"
            subtitle="Expected partner, age, height, location and family preference"
          >
            <DetailGrid>
              <DetailField
                label="Looking For"
                value={capitalize(partner.looking_for || effectiveMe.looking_for)}
              />
              <DetailField
                label="Preferred Age Range"
                value={formatRange(
                  partner.age_range_min ?? effectiveMe.age_range_min,
                  partner.age_range_max ?? effectiveMe.age_range_max
                )}
              />
              <DetailField
                label="Preferred Height"
                value={formatRange(
                  partner.preferred_height_min_cm,
                  partner.preferred_height_max_cm
                )}
              />
              <DetailField
                label="Preferred Religion"
                value={partner.preferred_religion || "—"}
              />
              <DetailField
                label="Preferred Marital Status"
                value={formatList(partner.preferred_marital_status)}
              />
              <DetailField
                label="Preferred Education"
                value={formatList(partner.preferred_education)}
              />
              <DetailField
                label="Preferred Profession"
                value={formatList(partner.preferred_profession)}
              />
              <DetailField
                label="Preferred Division"
                value={formatList(partner.preferred_division)}
              />
              <DetailField
                label="Preferred District"
                value={formatList(partner.preferred_district)}
              />
              <DetailField
                label="Preferred Country"
                value={formatList(partner.preferred_country)}
              />
              <DetailField
                label="Preferred Family Status"
                value={formatList(partner.preferred_family_status)}
              />
              <DetailField
                label="Accept Divorced"
                value={formatBool(partner.accept_divorced)}
              />
              <DetailField
                label="Accept Widowed"
                value={formatBool(partner.accept_widowed)}
              />
              <DetailField
                label="Accept With Children"
                value={formatBool(partner.accept_with_children)}
              />
              <DetailField
                label="Other Expectations"
                value={partner.other_expectations || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaInfoCircle />}
            title="Children Information"
            subtitle="Children status and living information"
          >
            <DetailGrid>
              <DetailField
                label="Has Children"
                value={formatBool(children.has_children)}
              />
              <DetailField
                label="Number Of Children"
                value={children.number_of_children ?? "—"}
              />
              <DetailField
                label="Children Living With"
                value={capitalize(children.children_living_with)}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaShieldAlt />}
            title="Verification"
            subtitle="Email, phone, NID, photo and biodata verification status"
          >
            <DetailGrid>
              <DetailField
                icon={<FaIdCard />}
                label="Overall Verified"
                value={effectiveMe.isVerified ? "Yes" : "No"}
              />
              <DetailField
                icon={<FaIdCard />}
                label="Verification Status"
                value={capitalize(verification.verification_status)}
              />
              <DetailField
                label="Email Verified"
                value={formatBool(verification.email_verified)}
              />
              <DetailField
                label="Phone Verified"
                value={formatBool(verification.phone_verified)}
              />
              <DetailField
                label="NID Verified"
                value={formatBool(verification.nid_verified)}
              />
              <DetailField
                label="Photo Verified"
                value={formatBool(verification.photo_verified)}
              />
              <DetailField
                label="Biodata Verified"
                value={formatBool(verification.biodata_verified)}
              />
              <DetailField
                label="Rejection Reason"
                value={verification.rejection_reason || "—"}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaCrown />}
            title="Membership"
            subtitle="Plan status, expiry and profile access permissions"
          >
            <DetailGrid>
              <DetailField
                label="Type"
                value={capitalize(membership?.type || "free")}
              />
              <DetailField
                label="Status"
                value={membership?.active ? "Active" : "Inactive"}
              />
              <DetailField label="Expires" value={formatDate(membership?.expiry)} />
              <DetailField
                label="Days Left"
                value={
                  typeof membership?.days_left === "number"
                    ? String(membership.days_left)
                    : "—"
                }
              />
              <DetailField
                label="Can Chat"
                value={membership?.can_chat ? "Yes" : "No"}
              />
              <DetailField
                label="Can View Full Profiles"
                value={membership?.can_view_full_profiles ? "Yes" : "No"}
              />
              <DetailField
                label="Message Limit / Day"
                value={String(membership?.message_limit_per_day ?? 0)}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaShieldAlt />}
            title="Privacy Settings"
            subtitle="Profile visibility, contact visibility and message permission"
          >
            <DetailGrid>
              <DetailField
                label="Show Phone"
                value={formatBool(privacy.show_phone)}
              />
              <DetailField
                label="Show Email"
                value={formatBool(privacy.show_email)}
              />
              <DetailField
                label="Show Address"
                value={formatBool(privacy.show_address)}
              />
              <DetailField
                label="Show Income"
                value={formatBool(privacy.show_income)}
              />
              <DetailField
                label="Show Family Details"
                value={formatBool(privacy.show_family_details)}
              />
              <DetailField
                label="Allow Profile View"
                value={formatBool(privacy.allow_profile_view)}
              />
              <DetailField
                label="Allow Messages"
                value={formatBool(privacy.allow_messages)}
              />
              <DetailField
                label="Photo Visibility"
                value={capitalize(effectiveMe.profile_photo_visibility)}
              />
            </DetailGrid>
          </AccordionSection>

          <AccordionSection
            icon={<FaInfoCircle />}
            title="About & Account Timestamps"
            subtitle="About me, joined date, update date and last active time"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs text-white/60 flex items-center gap-2">
                  <FaInfoCircle className="text-rose-300" />
                  About Me
                </div>
                <p className="mt-2 text-white/90 whitespace-pre-wrap">
                  {effectiveMe.about_me || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs text-white/60 flex items-center gap-2">
                  <FaClock className="text-rose-300" />
                  Account Timestamps
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                  <RowKV k="Joined" v={formatDateTime(effectiveMe.createdAt)} />
                  <RowKV k="Updated" v={formatDateTime(effectiveMe.updatedAt)} />
                  <RowKV k="Last Login" v={formatDateTime(effectiveMe.last_login)} />
                  <RowKV
                    k="Last Active"
                    v={formatDateTime(effectiveMe.last_active_at)}
                  />
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            icon={<FaInfoCircle />}
            title="Account Meta"
            subtitle="Role, account status, profile status and profile activity"
          >
            <DetailGrid>
              <DetailField label="User ID" value={effectiveMe._id || "—"} />
              <DetailField label="Role" value={capitalize(effectiveMe.role)} />
              <DetailField
                label="Account Status"
                value={capitalize(effectiveMe.account_status)}
              />
              <DetailField
                label="Profile Status"
                value={capitalize(effectiveMe.profile_status)}
              />
              <DetailField
                label="Profile Views"
                value={effectiveMe.profile_views_count ?? "—"}
              />
              <DetailField
                label="Shortlisted Count"
                value={effectiveMe.shortlisted_by_count ?? "—"}
              />
              <DetailField
                label="Membership Expiry"
                value={formatDate(effectiveMe.membership_expiry)}
              />
              <DetailField
                label="Membership ID"
                value={
                  effectiveMe.membership
                    ? typeof effectiveMe.membership === "object"
                      ? effectiveMe.membership._id || "Populated Membership"
                      : String(effectiveMe.membership)
                    : "—"
                }
              />
            </DetailGrid>
          </AccordionSection>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/settings/profile"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition"
          >
            Edit profile
          </a>

          <a
            href="/settings/account"
            className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Change password
          </a>
        </div>
      </div>
    </section>
  );
}

function AccordionSection({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.04]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
              open
                ? "border-rose-300/40 bg-rose-300/10 text-rose-200"
                : "border-white/10 bg-white/5 text-white/70"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition ${
            open ? "rotate-180 text-rose-200" : ""
          }`}
        >
          <FaChevronDown size={14} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-4 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function PhotoGallery({ photos, fallback }) {
  const [active, setActive] = useState(0);

  const list = useMemo(
    () => (Array.isArray(photos) && photos.length ? photos : [fallback]),
    [photos, fallback]
  );

  useEffect(() => {
    setActive(0);
  }, [list.length]);

  return (
    <div>
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
        <img
          src={list[active]}
          alt={`profile-${active}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                active === i
                  ? "border-rose-300/70"
                  : "border-white/10 hover:border-white/20"
              }`}
              aria-label={`photo ${i + 1}`}
              type="button"
            >
              <img
                src={src}
                alt={`thumb-${i}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallback;
                }}
              />

              {active === i && (
                <span className="absolute inset-0 ring-2 ring-rose-300/60 rounded-xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label, tone = "muted" }) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : tone === "warn"
      ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
      : "border-white/10 bg-white/5 text-white/80";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${toneClass}`}
    >
      {icon ? <span className="text-current">{icon}</span> : null}
      {label}
    </span>
  );
}

function MiniFact({ icon, value }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-white/85 justify-end md:justify-start">
      <span className="text-rose-300">{icon}</span>
      <span>{value || "—"}</span>
    </div>
  );
}

function CardRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
      {icon}
      <div className="text-xs text-white/60">{label}</div>
      <div className="ml-auto font-medium break-all">{value || "—"}</div>
    </div>
  );
}

function RowKV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/70">{k}</span>
      <span className="font-medium text-right">{v || "—"}</span>
    </div>
  );
}