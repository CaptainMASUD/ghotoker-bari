import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  FaEdit,
  FaLock,
} from "react-icons/fa";

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
      <section className="space-y-5">
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">Profile</h3>
            <p className="mt-1 text-sm text-slate-500">
              Loading your profile information...
            </p>
          </div>

          <GridSkeleton />
        </div>
      </section>
    );
  }

  if (!effectiveMe) {
    return (
      <section className="space-y-5">
        <div className="rounded-[1.7rem] border border-rose-100 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
              <FaInfoCircle />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Profile</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {fetchError || "Couldn’t load your profile."}
              </p>
            </div>
          </div>
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
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[#fbf7f4] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                Profile Details
              </p>
              <p className="mt-2 text-sm text-slate-500">
                View your biodata, verification, membership and privacy details.
              </p>
            </div>

            <Link
              to="/profile/edit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
            >
              <FaEdit />
              Edit Profile
            </Link>
          </div>

          <PhotoGallery photos={photos} fallback={avatarFallback} />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip
                  icon={<FaUserCheck />}
                  label={effectiveMe.isVerified ? "Verified" : "Not Verified"}
                  tone={effectiveMe.isVerified ? "ok" : "muted"}
                />

                <Chip
                  icon={<FaCrown />}
                  label={`${capitalize(
                    membership?.name ||
                      membership?.type ||
                      membership?.slug ||
                      "free"
                  )} • ${membership?.active ? "Active" : "Inactive"}`}
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

              <div className="mt-4 h-2 w-full max-w-[380px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completenessTone === "ok"
                      ? "bg-emerald-500"
                      : completenessTone === "warn"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                  style={{
                    width: `${Math.min(100, Number(completeness || 0))}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-auto">
              <MiniFact
                icon={genderIcon}
                label="Gender"
                value={capitalize(effectiveMe.gender)}
              />
              <MiniFact
                icon={<FaInfoCircle />}
                label="Age"
                value={age != null ? `${age} yrs` : "—"}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <CardRow
              icon={<FaEnvelope />}
              label="Email"
              value={effectiveMe.email_address || "—"}
            />

            <CardRow
              icon={<FaPhoneAlt />}
              label="Phone"
              value={effectiveMe.phone_number || "—"}
            />

            <CardRow
              icon={<FaMapMarkerAlt />}
              label="City"
              value={effectiveMe.current_city || "—"}
            />
          </div>

          <div className="mt-6 space-y-3">
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
                  label="Plan Name"
                  value={membership?.name || capitalize(membership?.type || "free")}
                />
                <DetailField
                  label="Slug"
                  value={membership?.slug || "free"}
                />
                <DetailField
                  label="Status"
                  value={capitalize(membership?.status || "free")}
                />
                <DetailField
                  label="Active"
                  value={membership?.active ? "Yes" : "No"}
                />
                <DetailField
                  label="Free Plan"
                  value={membership?.is_free ? "Yes" : "No"}
                />
                <DetailField
                  label="Paid Active"
                  value={membership?.is_paid ? "Yes" : "No"}
                />
                <DetailField label="Started" value={formatDate(membership?.started_at)} />
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
                  value={membership?.features?.can_chat ? "Yes" : "No"}
                />
                <DetailField
                  label="Can View Full Profiles"
                  value={
                    membership?.features?.can_view_full_profiles ? "Yes" : "No"
                  }
                />
                <DetailField
                  label="Can View Profile Photos"
                  value={
                    membership?.features?.can_view_profile_photos ? "Yes" : "No"
                  }
                />
                <DetailField
                  label="Message Limit / Day"
                  value={String(membership?.features?.message_limit_per_day ?? 0)}
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
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <FaInfoCircle className="text-rose-600" />
                    About Me
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {effectiveMe.about_me || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <FaClock className="text-rose-600" />
                    Account Timestamps
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
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
            <Link
              to="/profile/edit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
            >
              <FaEdit />
              Edit profile
            </Link>

            <Link
              to="/profile/settings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <FaLock />
              Change password
            </Link>
          </div>
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-rose-100">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-rose-50/40"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition ${
              open
                ? "bg-rose-600 text-white shadow-md shadow-rose-100"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {title}
            </h3>

            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition duration-300 ${
            open ? "rotate-180 border-rose-100 bg-rose-50 text-rose-600" : ""
          }`}
        >
          <FaChevronDown size={12} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function DetailField({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon ? <span className="text-rose-600">{icon}</span> : null}
        {label}
      </div>

      <div className="break-words text-sm font-semibold leading-6 text-slate-800">
        {value !== undefined && value !== null && value !== "" ? value : "—"}
      </div>
    </div>
  );
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
      <div className="aspect-[16/8] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-sm">
        <img
          src={list[active]}
          alt={`profile-${active}`}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = fallback;
          }}
        />
      </div>

      {list.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {list.map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-white transition ${
                active === index
                  ? "border-rose-500 shadow-md shadow-rose-100"
                  : "border-slate-200 hover:border-rose-200"
              }`}
              aria-label={`photo ${index + 1}`}
              type="button"
            >
              <img
                src={src}
                alt={`thumb-${index}`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = fallback;
                }}
              />

              {active === index ? (
                <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-rose-500/40" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Chip({ icon, label, tone = "muted" }) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-white text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${toneClass}`}
    >
      {icon ? <span className="text-current">{icon}</span> : null}
      {label}
    </span>
  );
}

function MiniFact({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className="text-rose-600">{icon}</span>
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

function CardRow({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </div>

        <div className="mt-0.5 break-all text-sm font-semibold text-slate-800">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function RowKV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {k}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {v || "—"}
      </span>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}