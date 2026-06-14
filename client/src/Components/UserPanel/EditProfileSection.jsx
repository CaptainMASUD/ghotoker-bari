import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaCheckCircle,
  FaExclamationCircle,
  FaHeart,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaSave,
  FaShieldAlt,
  FaTrash,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaRulerVertical,
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

function toInputDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function arrayToText(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

function normalizeBool(value) {
  return value === true || value === "true";
}

function emptyForm() {
  return {
    first_name: "",
    last_name: "",
    phone_number: "",
    dob: "",
    gender: "",
    profile_created_by: "",
    marital_status: "",
    religion: "",
    sect: "",
    caste_or_community: "",
    mother_tongue: "",
    nationality: "",
    nid: "",
    passport: "",
    about_me: "",
    profile_photo_visibility: "members_only",

    height: "",
    height_cm: "",
    weight: "",
    weight_kg: "",
    body_type: "",
    complexion: "",
    blood_group: "",

    current_country: "",
    current_division: "",
    current_district: "",
    current_city: "",
    present_address: "",
    permanent_division: "",
    permanent_district: "",
    permanent_upazila: "",
    permanent_address: "",
    preferred_location: "",
    willing_to_relocate: false,

    highest_education: "",
    profession: "",
    occupation_type: "",
    company_or_business_name: "",
    designation: "",
    annual_income: "",
    monthly_income: "",
    monthly_income_min: "",
    monthly_income_max: "",

    looking_for: "",
    age_range_min: "",
    age_range_max: "",

    children: {
      has_children: false,
      number_of_children: "",
      children_living_with: "",
    },

    disability: {
      has_disability: false,
      details: "",
    },

    education_details: {
      degree_name: "",
      institution_name: "",
      passing_year: "",
      result: "",
    },

    family: {
      father_occupation: "",
      mother_occupation: "",
      family_type: "",
      family_status: "",
      family_values: "",
      number_of_brothers: "",
      number_of_sisters: "",
      brothers_married: "",
      sisters_married: "",
      family_details: "",
    },

    lifestyle: {
      diet: "",
      smoking: "",
      drinking: "",
      prayer: "",
      hijab_or_beard_preference: "",
      hobbies: "",
    },

    partner_preferences: {
      looking_for: "",
      age_range_min: "",
      age_range_max: "",
      preferred_height_min_cm: "",
      preferred_height_max_cm: "",
      preferred_religion: "",
      preferred_marital_status: "",
      preferred_education: "",
      preferred_profession: "",
      preferred_division: "",
      preferred_district: "",
      preferred_country: "",
      preferred_family_status: "",
      accept_divorced: false,
      accept_widowed: false,
      accept_with_children: false,
      other_expectations: "",
    },

    privacy: {
      show_phone: false,
      show_email: false,
      show_address: false,
      show_income: false,
      show_family_details: false,
      allow_profile_view: true,
      allow_messages: true,
    },
  };
}

function mapUserToForm(user) {
  const form = emptyForm();

  return {
    ...form,

    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
    dob: toInputDate(user?.dob),
    gender: user?.gender || "",
    profile_created_by: user?.profile_created_by || "",
    marital_status: user?.marital_status || "",
    religion: user?.religion || "",
    sect: user?.sect || "",
    caste_or_community: user?.caste_or_community || "",
    mother_tongue: user?.mother_tongue || "",
    nationality: user?.nationality || "",
    nid: user?.nid || "",
    passport: user?.passport || "",
    about_me: user?.about_me || "",
    profile_photo_visibility: user?.profile_photo_visibility || "members_only",

    height: user?.height || "",
    height_cm: user?.height_cm || "",
    weight: user?.weight || "",
    weight_kg: user?.weight_kg || "",
    body_type: user?.body_type || "",
    complexion: user?.complexion || "",
    blood_group: user?.blood_group || "",

    current_country: user?.current_country || "",
    current_division: user?.current_division || "",
    current_district: user?.current_district || "",
    current_city: user?.current_city || "",
    present_address: user?.present_address || "",
    permanent_division: user?.permanent_division || "",
    permanent_district: user?.permanent_district || "",
    permanent_upazila: user?.permanent_upazila || "",
    permanent_address: user?.permanent_address || "",
    preferred_location: user?.preferred_location || "",
    willing_to_relocate: normalizeBool(user?.willing_to_relocate),

    highest_education: user?.highest_education || "",
    profession: user?.profession || "",
    occupation_type: user?.occupation_type || "",
    company_or_business_name: user?.company_or_business_name || "",
    designation: user?.designation || "",
    annual_income: user?.annual_income || "",
    monthly_income: user?.monthly_income || "",
    monthly_income_min: user?.monthly_income_min || "",
    monthly_income_max: user?.monthly_income_max || "",

    looking_for: user?.looking_for || "",
    age_range_min: user?.age_range_min || "",
    age_range_max: user?.age_range_max || "",

    children: {
      has_children: normalizeBool(user?.children?.has_children),
      number_of_children: user?.children?.number_of_children || "",
      children_living_with: user?.children?.children_living_with || "",
    },

    disability: {
      has_disability: normalizeBool(user?.disability?.has_disability),
      details: user?.disability?.details || "",
    },

    education_details: {
      degree_name: user?.education_details?.degree_name || "",
      institution_name: user?.education_details?.institution_name || "",
      passing_year: user?.education_details?.passing_year || "",
      result: user?.education_details?.result || "",
    },

    family: {
      father_occupation: user?.family?.father_occupation || "",
      mother_occupation: user?.family?.mother_occupation || "",
      family_type: user?.family?.family_type || "",
      family_status: user?.family?.family_status || "",
      family_values: user?.family?.family_values || "",
      number_of_brothers: user?.family?.number_of_brothers || "",
      number_of_sisters: user?.family?.number_of_sisters || "",
      brothers_married: user?.family?.brothers_married || "",
      sisters_married: user?.family?.sisters_married || "",
      family_details: user?.family?.family_details || "",
    },

    lifestyle: {
      diet: user?.lifestyle?.diet || "",
      smoking: user?.lifestyle?.smoking || "",
      drinking: user?.lifestyle?.drinking || "",
      prayer: user?.lifestyle?.prayer || "",
      hijab_or_beard_preference:
        user?.lifestyle?.hijab_or_beard_preference || "",
      hobbies: arrayToText(user?.lifestyle?.hobbies),
    },

    partner_preferences: {
      looking_for: user?.partner_preferences?.looking_for || "",
      age_range_min: user?.partner_preferences?.age_range_min || "",
      age_range_max: user?.partner_preferences?.age_range_max || "",
      preferred_height_min_cm:
        user?.partner_preferences?.preferred_height_min_cm || "",
      preferred_height_max_cm:
        user?.partner_preferences?.preferred_height_max_cm || "",
      preferred_religion: user?.partner_preferences?.preferred_religion || "",
      preferred_marital_status: arrayToText(
        user?.partner_preferences?.preferred_marital_status
      ),
      preferred_education: arrayToText(
        user?.partner_preferences?.preferred_education
      ),
      preferred_profession: arrayToText(
        user?.partner_preferences?.preferred_profession
      ),
      preferred_division: arrayToText(
        user?.partner_preferences?.preferred_division
      ),
      preferred_district: arrayToText(
        user?.partner_preferences?.preferred_district
      ),
      preferred_country: arrayToText(
        user?.partner_preferences?.preferred_country
      ),
      preferred_family_status: arrayToText(
        user?.partner_preferences?.preferred_family_status
      ),
      accept_divorced: normalizeBool(user?.partner_preferences?.accept_divorced),
      accept_widowed: normalizeBool(user?.partner_preferences?.accept_widowed),
      accept_with_children: normalizeBool(
        user?.partner_preferences?.accept_with_children
      ),
      other_expectations: user?.partner_preferences?.other_expectations || "",
    },

    privacy: {
      show_phone: normalizeBool(user?.privacy?.show_phone),
      show_email: normalizeBool(user?.privacy?.show_email),
      show_address: normalizeBool(user?.privacy?.show_address),
      show_income: normalizeBool(user?.privacy?.show_income),
      show_family_details: normalizeBool(user?.privacy?.show_family_details),
      allow_profile_view:
        user?.privacy?.allow_profile_view === false ? false : true,
      allow_messages: user?.privacy?.allow_messages === false ? false : true,
    },
  };
}

const flatFields = [
  "first_name",
  "last_name",
  "phone_number",
  "dob",
  "gender",
  "profile_created_by",
  "marital_status",
  "religion",
  "sect",
  "caste_or_community",
  "mother_tongue",
  "nationality",
  "nid",
  "passport",
  "about_me",
  "profile_photo_visibility",
  "height",
  "height_cm",
  "weight",
  "weight_kg",
  "body_type",
  "complexion",
  "blood_group",
  "current_country",
  "current_division",
  "current_district",
  "current_city",
  "present_address",
  "permanent_division",
  "permanent_district",
  "permanent_upazila",
  "permanent_address",
  "preferred_location",
  "willing_to_relocate",
  "highest_education",
  "profession",
  "occupation_type",
  "company_or_business_name",
  "designation",
  "annual_income",
  "monthly_income",
  "monthly_income_min",
  "monthly_income_max",
  "looking_for",
  "age_range_min",
  "age_range_max",
];

const nestedObjects = [
  "children",
  "disability",
  "education_details",
  "family",
  "lifestyle",
  "partner_preferences",
  "privacy",
];

const arrayPathFields = [
  "lifestyle.hobbies",
  "partner_preferences.preferred_marital_status",
  "partner_preferences.preferred_education",
  "partner_preferences.preferred_profession",
  "partner_preferences.preferred_division",
  "partner_preferences.preferred_district",
  "partner_preferences.preferred_country",
  "partner_preferences.preferred_family_status",
];

export default function EditProfileSection({
  effectiveMe,
  loadingMe = false,
  onProfileUpdated,
}) {
  const navigate = useNavigate();

  const [localUser, setLocalUser] = useState(effectiveMe || null);
  const [fetching, setFetching] = useState(!effectiveMe);
  const [form, setForm] = useState(emptyForm());
  const [newPhotos, setNewPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const photos = Array.isArray(localUser?.profile_photos)
    ? localUser.profile_photos.filter(Boolean)
    : [];

  const photoPreviews = useMemo(() => {
    return newPhotos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [newPhotos]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [photoPreviews]);

  useEffect(() => {
    if (effectiveMe) {
      setLocalUser(effectiveMe);
      setForm(mapUserToForm(effectiveMe));
      setFetching(false);
    }
  }, [effectiveMe]);

  useEffect(() => {
    if (effectiveMe) return;

    let ignore = false;

    async function fetchMe() {
      try {
        setFetching(true);
        setError("");

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
          throw new Error(data?.message || "Failed to load profile.");
        }

        if (!ignore) {
          setLocalUser(data?.user || null);
          setForm(mapUserToForm(data?.user || null));
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Could not load profile.");
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
  }, [effectiveMe]);

  function updateFlatField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateNestedField(objectName, fieldName, value) {
    setForm((prev) => ({
      ...prev,
      [objectName]: {
        ...prev[objectName],
        [fieldName]: value,
      },
    }));
  }

  function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);
    setNewPhotos(files);
  }

  async function handleRemovePhoto(photoUrl) {
    try {
      setRemovingPhoto(photoUrl);
      setError("");
      setSuccess("");

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/api/user/remove-photo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          photo_url: photoUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to remove photo.");
      }

      setLocalUser(data?.user || null);
      setForm(mapUserToForm(data?.user || null));
      onProfileUpdated?.(data?.user || null);
      setSuccess("Profile photo removed successfully.");
    } catch (err) {
      setError(err.message || "Could not remove photo.");
    } finally {
      setRemovingPhoto("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();
      const payload = new FormData();

      for (const field of flatFields) {
        payload.append(field, form[field] ?? "");
      }

      for (const objectName of nestedObjects) {
        payload.append(objectName, JSON.stringify(form[objectName] || {}));
      }

      for (const path of arrayPathFields) {
        const [objectName, fieldName] = path.split(".");
        payload.append(path, form?.[objectName]?.[fieldName] || "");
      }

      for (const file of newPhotos) {
        payload.append("profile_photos", file);
      }

      const res = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "PATCH",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile.");
      }

      setLocalUser(data?.user || null);
      setForm(mapUserToForm(data?.user || null));
      setNewPhotos([]);
      onProfileUpdated?.(data?.user || null);
      setSuccess("Profile updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingMe || fetching) {
    return (
      <section className="space-y-5">
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-8 w-52 animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[#fbf7f4] p-4 sm:p-5">
          <button
            type="button"
            onClick={() => navigate("/profile/profile")}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <FaArrowLeft />
            Back to profile
          </button>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                Edit Profile
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                Update your profile details
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Update your biodata, family details, lifestyle, partner
                preference, privacy and profile photos.
              </p>
            </div>

            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Profile completeness
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {localUser?.profile_completeness ?? 0}%
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5">
          {error ? (
            <AlertBox
              type="error"
              icon={<FaExclamationCircle />}
              message={error}
            />
          ) : null}

          {success ? (
            <AlertBox
              type="success"
              icon={<FaCheckCircle />}
              message={success}
            />
          ) : null}

          <div className="space-y-5">
            <FormSection
              icon={<FaCamera />}
              title="Profile Photos"
              subtitle="Add new photos or remove old photos"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {photos.length > 0 ? (
                      photos.map((photo) => (
                        <div
                          key={photo}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={photo}
                            alt="profile"
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo)}
                            disabled={removingPhoto === photo}
                            className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                        No profile photo added yet.
                      </div>
                    )}
                  </div>

                  {photoPreviews.length > 0 ? (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        New selected photos
                      </p>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {photoPreviews.map((item, index) => (
                          <div
                            key={`${item.file.name}-${index}`}
                            className="aspect-square overflow-hidden rounded-2xl border border-rose-200 bg-rose-50"
                          >
                            <img
                              src={item.url}
                              alt="new-preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-rose-300 bg-white px-4 py-6 text-center transition hover:bg-rose-50">
                    <FaCamera className="text-3xl text-rose-600" />
                    <span className="mt-3 text-sm font-extrabold text-slate-900">
                      Upload new photos
                    </span>
                    <span className="mt-1 text-xs leading-5 text-slate-500">
                      You can select multiple photos.
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </FormSection>

            <FormSection
              icon={<FaUser />}
              title="Basic Profile"
              subtitle="Your personal and matrimony information"
            >
              <FormGrid>
                <Input label="First Name" value={form.first_name} onChange={(value) => updateFlatField("first_name", value)} />
                <Input label="Last Name" value={form.last_name} onChange={(value) => updateFlatField("last_name", value)} />
                <Input label="Phone Number" value={form.phone_number} onChange={(value) => updateFlatField("phone_number", value)} />
                <Input type="date" label="Date of Birth" value={form.dob} onChange={(value) => updateFlatField("dob", value)} />

                <Select label="Gender" value={form.gender} onChange={(value) => updateFlatField("gender", value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>

                <Select label="Profile Created By" value={form.profile_created_by} onChange={(value) => updateFlatField("profile_created_by", value)}>
                  <option value="">Select</option>
                  <option value="self">Self</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="relative">Relative</option>
                  <option value="friend">Friend</option>
                </Select>

                <Select label="Marital Status" value={form.marital_status} onChange={(value) => updateFlatField("marital_status", value)}>
                  <option value="">Select status</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </Select>

                <Input label="Religion" value={form.religion} onChange={(value) => updateFlatField("religion", value)} />
                <Input label="Sect" value={form.sect} onChange={(value) => updateFlatField("sect", value)} />
                <Input label="Community / Caste" value={form.caste_or_community} onChange={(value) => updateFlatField("caste_or_community", value)} />
                <Input label="Mother Tongue" value={form.mother_tongue} onChange={(value) => updateFlatField("mother_tongue", value)} />
                <Input label="Nationality" value={form.nationality} onChange={(value) => updateFlatField("nationality", value)} />
                <Input label="NID" value={form.nid} onChange={(value) => updateFlatField("nid", value)} />
                <Input label="Passport" value={form.passport} onChange={(value) => updateFlatField("passport", value)} />

                <Select label="Photo Visibility" value={form.profile_photo_visibility} onChange={(value) => updateFlatField("profile_photo_visibility", value)}>
                  <option value="members_only">Members Only</option>
                  <option value="premium_only">Premium Only</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </Select>
              </FormGrid>

              <Textarea
                label="About Me"
                value={form.about_me}
                onChange={(value) => updateFlatField("about_me", value)}
              />
            </FormSection>

            <FormSection
              icon={<FaMapMarkerAlt />}
              title="Location Details"
              subtitle="Current address, permanent address and preferred location"
            >
              <FormGrid>
                <Input label="Current Country" value={form.current_country} onChange={(value) => updateFlatField("current_country", value)} />
                <Input label="Current Division" value={form.current_division} onChange={(value) => updateFlatField("current_division", value)} />
                <Input label="Current District" value={form.current_district} onChange={(value) => updateFlatField("current_district", value)} />
                <Input label="Current City" value={form.current_city} onChange={(value) => updateFlatField("current_city", value)} />
                <Input label="Permanent Division" value={form.permanent_division} onChange={(value) => updateFlatField("permanent_division", value)} />
                <Input label="Permanent District" value={form.permanent_district} onChange={(value) => updateFlatField("permanent_district", value)} />
                <Input label="Permanent Upazila" value={form.permanent_upazila} onChange={(value) => updateFlatField("permanent_upazila", value)} />
                <Input label="Preferred Location" value={form.preferred_location} onChange={(value) => updateFlatField("preferred_location", value)} />
              </FormGrid>

              <Textarea label="Present Address" value={form.present_address} onChange={(value) => updateFlatField("present_address", value)} />
              <Textarea label="Permanent Address" value={form.permanent_address} onChange={(value) => updateFlatField("permanent_address", value)} />

              <Toggle
                label="Willing to relocate"
                checked={form.willing_to_relocate}
                onChange={(value) => updateFlatField("willing_to_relocate", value)}
              />
            </FormSection>

            <FormSection
              icon={<FaRulerVertical />}
              title="Physical Details"
              subtitle="Height, weight, complexion and health information"
            >
              <FormGrid>
                <Input label="Height" value={form.height} onChange={(value) => updateFlatField("height", value)} />
                <Input type="number" label="Height CM" value={form.height_cm} onChange={(value) => updateFlatField("height_cm", value)} />
                <Input label="Weight" value={form.weight} onChange={(value) => updateFlatField("weight", value)} />
                <Input type="number" label="Weight KG" value={form.weight_kg} onChange={(value) => updateFlatField("weight_kg", value)} />
                <Input label="Body Type" value={form.body_type} onChange={(value) => updateFlatField("body_type", value)} />
                <Input label="Complexion" value={form.complexion} onChange={(value) => updateFlatField("complexion", value)} />
                <Input label="Blood Group" value={form.blood_group} onChange={(value) => updateFlatField("blood_group", value)} />
              </FormGrid>

              <Toggle
                label="Has disability"
                checked={form.disability.has_disability}
                onChange={(value) => updateNestedField("disability", "has_disability", value)}
              />

              <Textarea
                label="Disability Details"
                value={form.disability.details}
                onChange={(value) => updateNestedField("disability", "details", value)}
              />
            </FormSection>

            <FormSection
              icon={<FaGraduationCap />}
              title="Education Details"
              subtitle="Education level, institution, result and passing year"
            >
              <FormGrid>
                <Input label="Highest Education" value={form.highest_education} onChange={(value) => updateFlatField("highest_education", value)} />
                <Input label="Degree Name" value={form.education_details.degree_name} onChange={(value) => updateNestedField("education_details", "degree_name", value)} />
                <Input label="Institution Name" value={form.education_details.institution_name} onChange={(value) => updateNestedField("education_details", "institution_name", value)} />
                <Input type="number" label="Passing Year" value={form.education_details.passing_year} onChange={(value) => updateNestedField("education_details", "passing_year", value)} />
                <Input label="Result" value={form.education_details.result} onChange={(value) => updateNestedField("education_details", "result", value)} />
              </FormGrid>
            </FormSection>

            <FormSection
              icon={<FaBriefcase />}
              title="Career Details"
              subtitle="Profession, occupation, company and income"
            >
              <FormGrid>
                <Input label="Profession" value={form.profession} onChange={(value) => updateFlatField("profession", value)} />
                <Input label="Occupation Type" value={form.occupation_type} onChange={(value) => updateFlatField("occupation_type", value)} />
                <Input label="Company / Business Name" value={form.company_or_business_name} onChange={(value) => updateFlatField("company_or_business_name", value)} />
                <Input label="Designation" value={form.designation} onChange={(value) => updateFlatField("designation", value)} />
                <Input label="Annual Income" value={form.annual_income} onChange={(value) => updateFlatField("annual_income", value)} />
                <Input label="Monthly Income" value={form.monthly_income} onChange={(value) => updateFlatField("monthly_income", value)} />
                <Input type="number" label="Monthly Income Min" value={form.monthly_income_min} onChange={(value) => updateFlatField("monthly_income_min", value)} />
                <Input type="number" label="Monthly Income Max" value={form.monthly_income_max} onChange={(value) => updateFlatField("monthly_income_max", value)} />
              </FormGrid>
            </FormSection>

            <FormSection
              icon={<FaHome />}
              title="Family Details"
              subtitle="Parents, siblings and family background"
            >
              <FormGrid>
                <Input label="Father Occupation" value={form.family.father_occupation} onChange={(value) => updateNestedField("family", "father_occupation", value)} />
                <Input label="Mother Occupation" value={form.family.mother_occupation} onChange={(value) => updateNestedField("family", "mother_occupation", value)} />
                <Input label="Family Type" value={form.family.family_type} onChange={(value) => updateNestedField("family", "family_type", value)} />
                <Input label="Family Status" value={form.family.family_status} onChange={(value) => updateNestedField("family", "family_status", value)} />
                <Input label="Family Values" value={form.family.family_values} onChange={(value) => updateNestedField("family", "family_values", value)} />
                <Input type="number" label="Number Of Brothers" value={form.family.number_of_brothers} onChange={(value) => updateNestedField("family", "number_of_brothers", value)} />
                <Input type="number" label="Number Of Sisters" value={form.family.number_of_sisters} onChange={(value) => updateNestedField("family", "number_of_sisters", value)} />
                <Input type="number" label="Married Brothers" value={form.family.brothers_married} onChange={(value) => updateNestedField("family", "brothers_married", value)} />
                <Input type="number" label="Married Sisters" value={form.family.sisters_married} onChange={(value) => updateNestedField("family", "sisters_married", value)} />
              </FormGrid>

              <Textarea
                label="Family Details"
                value={form.family.family_details}
                onChange={(value) => updateNestedField("family", "family_details", value)}
              />
            </FormSection>

            <FormSection
              icon={<FaInfoCircle />}
              title="Lifestyle Details"
              subtitle="Diet, prayer, smoking, drinking and hobbies"
            >
              <FormGrid>
                <Input label="Diet" value={form.lifestyle.diet} onChange={(value) => updateNestedField("lifestyle", "diet", value)} />
                <Input label="Smoking" value={form.lifestyle.smoking} onChange={(value) => updateNestedField("lifestyle", "smoking", value)} />
                <Input label="Drinking" value={form.lifestyle.drinking} onChange={(value) => updateNestedField("lifestyle", "drinking", value)} />
                <Input label="Prayer" value={form.lifestyle.prayer} onChange={(value) => updateNestedField("lifestyle", "prayer", value)} />
                <Input label="Hijab / Beard Preference" value={form.lifestyle.hijab_or_beard_preference} onChange={(value) => updateNestedField("lifestyle", "hijab_or_beard_preference", value)} />
                <Input label="Hobbies" value={form.lifestyle.hobbies} onChange={(value) => updateNestedField("lifestyle", "hobbies", value)} helper="Use comma for multiple values." />
              </FormGrid>
            </FormSection>

            <FormSection
              icon={<FaHeart />}
              title="Marriage & Partner Preference"
              subtitle="Expected partner profile and matching preference"
            >
              <FormGrid>
                <Input label="Looking For" value={form.looking_for} onChange={(value) => updateFlatField("looking_for", value)} />
                <Input type="number" label="Age Range Min" value={form.age_range_min} onChange={(value) => updateFlatField("age_range_min", value)} />
                <Input type="number" label="Age Range Max" value={form.age_range_max} onChange={(value) => updateFlatField("age_range_max", value)} />

                <Input label="Partner Looking For" value={form.partner_preferences.looking_for} onChange={(value) => updateNestedField("partner_preferences", "looking_for", value)} />
                <Input type="number" label="Partner Age Min" value={form.partner_preferences.age_range_min} onChange={(value) => updateNestedField("partner_preferences", "age_range_min", value)} />
                <Input type="number" label="Partner Age Max" value={form.partner_preferences.age_range_max} onChange={(value) => updateNestedField("partner_preferences", "age_range_max", value)} />
                <Input type="number" label="Preferred Height Min CM" value={form.partner_preferences.preferred_height_min_cm} onChange={(value) => updateNestedField("partner_preferences", "preferred_height_min_cm", value)} />
                <Input type="number" label="Preferred Height Max CM" value={form.partner_preferences.preferred_height_max_cm} onChange={(value) => updateNestedField("partner_preferences", "preferred_height_max_cm", value)} />
                <Input label="Preferred Religion" value={form.partner_preferences.preferred_religion} onChange={(value) => updateNestedField("partner_preferences", "preferred_religion", value)} />
                <Input label="Preferred Marital Status" value={form.partner_preferences.preferred_marital_status} onChange={(value) => updateNestedField("partner_preferences", "preferred_marital_status", value)} helper="Use comma for multiple values." />
                <Input label="Preferred Education" value={form.partner_preferences.preferred_education} onChange={(value) => updateNestedField("partner_preferences", "preferred_education", value)} helper="Use comma for multiple values." />
                <Input label="Preferred Profession" value={form.partner_preferences.preferred_profession} onChange={(value) => updateNestedField("partner_preferences", "preferred_profession", value)} helper="Use comma for multiple values." />
                <Input label="Preferred Division" value={form.partner_preferences.preferred_division} onChange={(value) => updateNestedField("partner_preferences", "preferred_division", value)} helper="Use comma for multiple values." />
                <Input label="Preferred District" value={form.partner_preferences.preferred_district} onChange={(value) => updateNestedField("partner_preferences", "preferred_district", value)} helper="Use comma for multiple values." />
                <Input label="Preferred Country" value={form.partner_preferences.preferred_country} onChange={(value) => updateNestedField("partner_preferences", "preferred_country", value)} helper="Use comma for multiple values." />
                <Input label="Preferred Family Status" value={form.partner_preferences.preferred_family_status} onChange={(value) => updateNestedField("partner_preferences", "preferred_family_status", value)} helper="Use comma for multiple values." />
              </FormGrid>

              <div className="grid gap-3 md:grid-cols-3">
                <Toggle label="Accept Divorced" checked={form.partner_preferences.accept_divorced} onChange={(value) => updateNestedField("partner_preferences", "accept_divorced", value)} />
                <Toggle label="Accept Widowed" checked={form.partner_preferences.accept_widowed} onChange={(value) => updateNestedField("partner_preferences", "accept_widowed", value)} />
                <Toggle label="Accept With Children" checked={form.partner_preferences.accept_with_children} onChange={(value) => updateNestedField("partner_preferences", "accept_with_children", value)} />
              </div>

              <Textarea
                label="Other Expectations"
                value={form.partner_preferences.other_expectations}
                onChange={(value) => updateNestedField("partner_preferences", "other_expectations", value)}
              />
            </FormSection>

            <FormSection
              icon={<FaInfoCircle />}
              title="Children Information"
              subtitle="Children status and living information"
            >
              <Toggle
                label="Has Children"
                checked={form.children.has_children}
                onChange={(value) => updateNestedField("children", "has_children", value)}
              />

              <FormGrid>
                <Input type="number" label="Number Of Children" value={form.children.number_of_children} onChange={(value) => updateNestedField("children", "number_of_children", value)} />
                <Input label="Children Living With" value={form.children.children_living_with} onChange={(value) => updateNestedField("children", "children_living_with", value)} />
              </FormGrid>
            </FormSection>

            <FormSection
              icon={<FaShieldAlt />}
              title="Privacy Settings"
              subtitle="Control what other members can see"
            >
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Toggle label="Show Phone" checked={form.privacy.show_phone} onChange={(value) => updateNestedField("privacy", "show_phone", value)} />
                <Toggle label="Show Email" checked={form.privacy.show_email} onChange={(value) => updateNestedField("privacy", "show_email", value)} />
                <Toggle label="Show Address" checked={form.privacy.show_address} onChange={(value) => updateNestedField("privacy", "show_address", value)} />
                <Toggle label="Show Income" checked={form.privacy.show_income} onChange={(value) => updateNestedField("privacy", "show_income", value)} />
                <Toggle label="Show Family Details" checked={form.privacy.show_family_details} onChange={(value) => updateNestedField("privacy", "show_family_details", value)} />
                <Toggle label="Allow Profile View" checked={form.privacy.allow_profile_view} onChange={(value) => updateNestedField("privacy", "allow_profile_view", value)} />
                <Toggle label="Allow Messages" checked={form.privacy.allow_messages} onChange={(value) => updateNestedField("privacy", "allow_messages", value)} />
              </div>
            </FormSection>
          </div>

          <div className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Review your changes before saving.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/profile/profile")}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormSection({ icon, title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-100">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function FormGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  helper = "",
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder || label}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
      />

      {helper ? (
        <span className="mt-1 block text-xs leading-5 text-slate-400">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
      >
        {children}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        checked
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <span className="text-sm font-bold text-slate-800">{label}</span>

      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-rose-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function AlertBox({ icon, message, type }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        isSuccess
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-rose-100 bg-rose-50 text-rose-700"
      }`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-sm font-semibold leading-6">{message}</p>
    </div>
  );
}