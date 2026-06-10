"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Heart,
  Upload,
  X,
  MapPin,
  GraduationCap,
  Users,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { FiEye, FiEyeOff, FiChevronDown } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const steps = [
  { id: 1, title: "Account", subtitle: "Create your login account" },
  { id: 2, title: "Personal", subtitle: "Basic matrimony details" },
  { id: 3, title: "Career", subtitle: "Education and profession" },
  { id: 4, title: "Family", subtitle: "Family and lifestyle" },
  { id: 5, title: "Preference", subtitle: "Partner preference and photos" },
];

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

const religions = ["Islam", "Hinduism", "Buddhism", "Christianity", "Other"];

const maritalStatuses = [
  { label: "Never Married", value: "never_married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
  { label: "Separated", value: "separated" },
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

const occupationTypes = [
  { label: "Government Job", value: "government_job" },
  { label: "Private Job", value: "private_job" },
  { label: "Business", value: "business" },
  { label: "Freelancer", value: "freelancer" },
  { label: "Student", value: "student" },
  { label: "Doctor", value: "doctor" },
  { label: "Engineer", value: "engineer" },
  { label: "Teacher", value: "teacher" },
  { label: "Lawyer", value: "lawyer" },
  { label: "Banker", value: "banker" },
  { label: "Housewife", value: "housewife" },
  { label: "Unemployed", value: "unemployed" },
  { label: "Other", value: "other" },
];

const incomeRanges = [
  "Below 20,000 BDT",
  "20,000 - 40,000 BDT",
  "40,000 - 70,000 BDT",
  "70,000 - 1,00,000 BDT",
  "1,00,000 - 2,00,000 BDT",
  "Above 2,00,000 BDT",
];

const heightOptions = [
  { label: "4 ft 10 in", value: "4 feet 10 inch", cm: 147 },
  { label: "5 ft 0 in", value: "5 feet 0 inch", cm: 152 },
  { label: "5 ft 2 in", value: "5 feet 2 inch", cm: 157 },
  { label: "5 ft 4 in", value: "5 feet 4 inch", cm: 163 },
  { label: "5 ft 6 in", value: "5 feet 6 inch", cm: 168 },
  { label: "5 ft 8 in", value: "5 feet 8 inch", cm: 173 },
  { label: "5 ft 10 in", value: "5 feet 10 inch", cm: 178 },
  { label: "6 ft 0 in", value: "6 feet 0 inch", cm: 183 },
  { label: "6 ft 2 in", value: "6 feet 2 inch", cm: 188 },
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function isValueFilled(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function cleanObject(obj) {
  const cleaned = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (!isValueFilled(value)) return;

    if (Array.isArray(value)) {
      const arr = value.filter((item) => isValueFilled(item));
      if (arr.length > 0) cleaned[key] = arr;
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[13px] font-semibold text-slate-700 sm:text-sm"
    >
      {children}
      {required ? <span className="ml-1 text-rose-600">*</span> : null}
    </label>
  );
}

function InputField({
  id,
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border bg-white text-[15px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:h-11 sm:text-sm ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 ${
            error
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  required = false,
  value,
  onChange,
  children,
  error,
  placeholder = "Select option",
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full appearance-none rounded-xl border bg-white pl-3 pr-10 text-[15px] text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:h-11 sm:text-sm ${
            error
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>

        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  maxLength,
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:text-sm ${
          error
            ? "border-rose-400 bg-rose-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      />

      {maxLength ? (
        <div className="mt-1 text-right text-xs text-slate-400">
          {value.length}/{maxLength}
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <FieldLabel htmlFor={id} required>
        {label}
      </FieldLabel>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Minimum 6 characters"
          className={`h-12 w-full rounded-xl border bg-white pl-10 pr-12 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:h-11 sm:text-sm ${
            error
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <FiEyeOff className="h-4 w-4" />
          ) : (
            <FiEye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function MessageModal({ modal, onClose }) {
  if (!modal.open) return null;

  const isSuccess = modal.type === "success";
  const isWarning = modal.type === "warning";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : isWarning
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-7 w-7" />
          ) : isWarning ? (
            <AlertCircle className="h-7 w-7" />
          ) : (
            <XCircle className="h-7 w-7" />
          )}
        </div>

        <h3 className="mt-4 text-center text-xl font-bold text-slate-900">
          {modal.title}
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-slate-600">
          {modal.message}
        </p>

        {modal.details ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            {modal.details}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className={`mt-6 h-11 w-full rounded-xl text-sm font-semibold text-white transition ${
            isSuccess
              ? "bg-emerald-600 hover:bg-emerald-700"
              : isWarning
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {modal.buttonText || "Okay"}
        </button>
      </motion.div>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="mb-5 sm:mb-8">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((step) => {
          const active = step.id === currentStep;
          const completed = step.id < currentStep;

          return (
            <div key={step.id} className="min-w-0">
              <div
                className={`flex h-10 items-center justify-center rounded-xl border text-sm font-bold transition ${
                  active
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : completed
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {completed ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>

              <p
                className={`mt-1.5 hidden truncate text-center text-[11px] font-semibold sm:block sm:mt-2 sm:text-xs ${
                  active ? "text-rose-700" : "text-slate-500"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileStepSummary({ currentStep, progress }) {
  const current = steps.find((step) => step.id === currentStep);

  return (
    <div className="mb-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-4 shadow-sm lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            Step {currentStep} of {steps.length}
          </p>
          <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
            {current?.title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {current?.subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-rose-700 shadow-sm ring-1 ring-rose-100">
          {progress}%
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/80 ring-1 ring-rose-100">
        <motion.div
          className="h-2 rounded-full bg-rose-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    details: "",
    buttonText: "Okay",
    redirectTo: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    password: "",
    confirmPassword: "",

    dob: "",
    gender: "",
    profile_created_by: "self",
    marital_status: "",
    religion: "",
    sect: "",
    mother_tongue: "Bangla",
    nationality: "Bangladeshi",
    nid: "",
    passport: "",

    current_country: "Bangladesh",
    current_division: "",
    current_district: "",
    current_city: "",
    permanent_division: "",
    permanent_district: "",
    permanent_upazila: "",
    preferred_location: "",
    willing_to_relocate: false,

    height: "",
    height_cm: "",
    weight: "",
    weight_kg: "",
    body_type: "",
    complexion: "",
    blood_group: "",

    highest_education: "",
    degree_name: "",
    institution_name: "",
    passing_year: "",
    profession: "",
    occupation_type: "",
    company_or_business_name: "",
    designation: "",
    annual_income: "",
    monthly_income: "",

    father_occupation: "",
    mother_occupation: "",
    family_type: "",
    family_status: "",
    family_values: "",
    number_of_brothers: "",
    number_of_sisters: "",
    family_details: "",

    diet: "",
    smoking: "no",
    drinking: "no",
    prayer: "",
    hobbies: "",

    about_me: "",

    looking_for: "",
    age_range_min: "",
    age_range_max: "",
    preferred_religion: "",
    preferred_marital_status: "",
    preferred_education: "",
    preferred_profession: "",
    preferred_division: "",
    preferred_district: "",
    other_expectations: "",

    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const currentStepInfo = useMemo(
    () => steps.find((step) => step.id === currentStep),
    [currentStep]
  );

  const progress = Math.round((currentStep / steps.length) * 100);

  const closeModal = () => {
    const redirectTo = modal.redirectTo;

    setModal((prev) => ({
      ...prev,
      open: false,
    }));

    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  const showModal = (payload) => {
    setModal({
      open: true,
      type: payload.type || "success",
      title: payload.title || "",
      message: payload.message || "",
      details: payload.details || "",
      buttonText: payload.buttonText || "Okay",
      redirectTo: payload.redirectTo || "",
    });
  };

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleHeightChange = (value) => {
    const selected = heightOptions.find((item) => item.value === value);
    update("height", value);
    update("height_cm", selected?.cm ? String(selected.cm) : "");
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length + profilePhotos.length > 6) {
      setErrors((prev) => ({
        ...prev,
        photos: "Maximum 6 photos are allowed",
      }));
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photos: "Only image files are allowed",
        }));
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photos: "Each photo must be less than 5MB",
        }));
        continue;
      }

      validFiles.push(file);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (eventReader) => {
        setProfilePhotos((prev) => [
          ...prev,
          {
            file,
            preview: eventReader.target.result,
            id: `${Date.now()}-${Math.random()}`,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setErrors((prev) => ({ ...prev, photos: "" }));
    }

    event.target.value = "";
  };

  const removePhoto = (id) => {
    setProfilePhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const validateStep = (step) => {
    const nextErrors = {};

    if (step === 1) {
      if (!formData.first_name.trim()) nextErrors.first_name = "First name is required";
      if (!formData.last_name.trim()) nextErrors.last_name = "Last name is required";

      if (!formData.email_address.trim()) {
        nextErrors.email_address = "Email address is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email_address)) {
        nextErrors.email_address = "Enter a valid email address";
      }

      if (!formData.phone_number.trim()) nextErrors.phone_number = "Phone number is required";

      if (!formData.password) {
        nextErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = "Confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!formData.dob) nextErrors.dob = "Date of birth is required";
      if (!formData.gender) nextErrors.gender = "Gender is required";
      if (!formData.religion) nextErrors.religion = "Religion is required";
      if (!formData.marital_status) nextErrors.marital_status = "Marital status is required";
      if (!formData.current_division) nextErrors.current_division = "Current division is required";
      if (!formData.current_district.trim()) nextErrors.current_district = "Current district is required";
      if (!formData.current_city.trim()) nextErrors.current_city = "Current city is required";
      if (!formData.height) nextErrors.height = "Height is required";
    }

    if (step === 3) {
      if (!formData.highest_education) nextErrors.highest_education = "Highest education is required";
      if (!formData.profession.trim()) nextErrors.profession = "Profession is required";
      if (!formData.occupation_type) nextErrors.occupation_type = "Occupation type is required";
      if (!formData.annual_income) nextErrors.annual_income = "Income range is required";
    }

    if (step === 4) {
      if (!formData.father_occupation.trim()) nextErrors.father_occupation = "Father occupation is required";
      if (!formData.mother_occupation.trim()) nextErrors.mother_occupation = "Mother occupation is required";
      if (!formData.family_type) nextErrors.family_type = "Family type is required";
      if (!formData.family_status) nextErrors.family_status = "Family status is required";
      if (!formData.about_me.trim()) nextErrors.about_me = "About me is required";
    }

    if (step === 5) {
      if (!formData.looking_for) nextErrors.looking_for = "Looking for is required";
      if (!formData.age_range_min) nextErrors.age_range_min = "Minimum age is required";
      if (!formData.age_range_max) nextErrors.age_range_max = "Maximum age is required";

      if (
        formData.age_range_min &&
        formData.age_range_max &&
        Number(formData.age_range_min) > Number(formData.age_range_max)
      ) {
        nextErrors.age_range_max = "Maximum age must be greater than minimum age";
      }

      if (profilePhotos.length < 1) nextErrors.photos = "At least 1 profile photo is required";
      if (!formData.agreeToTerms) nextErrors.agreeToTerms = "You must agree to the terms";
      if (!formData.agreeToPrivacy) nextErrors.agreeToPrivacy = "You must agree to the privacy policy";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const appendIfValue = (form, key, value) => {
    if (isValueFilled(value)) {
      form.append(key, value);
    }
  };

  const appendJsonIfNotEmpty = (form, key, objectValue) => {
    const cleaned = cleanObject(objectValue);

    if (Object.keys(cleaned).length > 0) {
      form.append(key, JSON.stringify(cleaned));
    }
  };

  const buildRegisterFormData = () => {
    const fd = new FormData();

    appendIfValue(fd, "first_name", formData.first_name);
    appendIfValue(fd, "last_name", formData.last_name);
    appendIfValue(fd, "email_address", formData.email_address);
    appendIfValue(fd, "phone_number", formData.phone_number);
    appendIfValue(fd, "password", formData.password);
    appendIfValue(fd, "dob", formData.dob);
    appendIfValue(fd, "gender", formData.gender);
    appendIfValue(fd, "religion", formData.religion);
    appendIfValue(fd, "marital_status", formData.marital_status);
    appendIfValue(fd, "current_division", formData.current_division);
    appendIfValue(fd, "current_district", formData.current_district);
    appendIfValue(fd, "current_city", formData.current_city);
    appendIfValue(fd, "profession", formData.profession);
    appendIfValue(fd, "highest_education", formData.highest_education);

    profilePhotos.forEach((photo) => {
      fd.append("profile_photos", photo.file);
    });

    return fd;
  };

  const buildProfileUpdateFormData = () => {
    const fd = new FormData();

    const flatFields = [
      "profile_created_by",
      "religion",
      "sect",
      "mother_tongue",
      "nationality",
      "nid",
      "passport",
      "current_country",
      "current_division",
      "current_district",
      "current_city",
      "permanent_division",
      "permanent_district",
      "permanent_upazila",
      "preferred_location",
      "height",
      "height_cm",
      "weight",
      "weight_kg",
      "body_type",
      "complexion",
      "blood_group",
      "highest_education",
      "profession",
      "occupation_type",
      "company_or_business_name",
      "designation",
      "annual_income",
      "monthly_income",
      "looking_for",
      "age_range_min",
      "age_range_max",
      "about_me",
    ];

    flatFields.forEach((key) => appendIfValue(fd, key, formData[key]));

    if (formData.willing_to_relocate) {
      fd.append("willing_to_relocate", "true");
    }

    appendJsonIfNotEmpty(fd, "education_details", {
      degree_name: formData.degree_name,
      institution_name: formData.institution_name,
      passing_year: formData.passing_year ? Number(formData.passing_year) : "",
    });

    appendJsonIfNotEmpty(fd, "family", {
      father_occupation: formData.father_occupation,
      mother_occupation: formData.mother_occupation,
      family_type: formData.family_type,
      family_status: formData.family_status,
      family_values: formData.family_values,
      number_of_brothers: formData.number_of_brothers
        ? Number(formData.number_of_brothers)
        : "",
      number_of_sisters: formData.number_of_sisters
        ? Number(formData.number_of_sisters)
        : "",
      family_details: formData.family_details,
    });

    appendJsonIfNotEmpty(fd, "lifestyle", {
      diet: formData.diet,
      smoking: formData.smoking,
      drinking: formData.drinking,
      prayer: formData.prayer,
      hobbies: formData.hobbies
        ? formData.hobbies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    });

    appendJsonIfNotEmpty(fd, "partner_preferences", {
      looking_for: formData.looking_for,
      age_range_min: formData.age_range_min ? Number(formData.age_range_min) : "",
      age_range_max: formData.age_range_max ? Number(formData.age_range_max) : "",
      preferred_religion: formData.preferred_religion,
      preferred_marital_status: formData.preferred_marital_status
        ? [formData.preferred_marital_status]
        : [],
      preferred_education: formData.preferred_education
        ? [formData.preferred_education]
        : [],
      preferred_profession: formData.preferred_profession
        ? [formData.preferred_profession]
        : [],
      preferred_division: formData.preferred_division
        ? [formData.preferred_division]
        : [],
      preferred_district: formData.preferred_district
        ? [formData.preferred_district]
        : [],
      preferred_country: ["Bangladesh"],
      other_expectations: formData.other_expectations,
    });

    return fd;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: "POST",
        body: buildRegisterFormData(),
      });

      const registerResult = await safeJson(registerResponse);

      if (!registerResponse.ok) {
        showModal({
          type: "error",
          title: "Registration Failed",
          message:
            registerResult.message ||
            registerResult.error ||
            "Could not create your account. Please try again.",
          details:
            registerResult.error && registerResult.message
              ? registerResult.error
              : "",
          buttonText: "Try Again",
        });
        return;
      }

      const token = registerResult.token;

      if (!token) {
        showModal({
          type: "warning",
          title: "Account Created",
          message:
            "Your account was created, but login token was not returned. Please login manually.",
          buttonText: "Go to Login",
          redirectTo: "/login",
        });
        return;
      }

      let finalUser = registerResult.user || null;

      const updateResponse = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: buildProfileUpdateFormData(),
      });

      const updateResult = await safeJson(updateResponse);

      if (!updateResponse.ok) {
        localStorage.setItem("token", token);
        if (registerResult.user) {
          localStorage.setItem("user", JSON.stringify(registerResult.user));
        }

        showModal({
          type: "warning",
          title: "Account Created",
          message:
            "Your account was created successfully, but some profile details could not be saved. You can update them later from your profile page.",
          details:
            updateResult.message ||
            updateResult.error ||
            "Profile update request failed after registration.",
          buttonText: "Continue",
          redirectTo: "/login",
        });
        return;
      }

      finalUser = updateResult.user || finalUser;

      localStorage.setItem("token", token);
      if (finalUser) {
        localStorage.setItem("user", JSON.stringify(finalUser));
      }

      showModal({
        type: "success",
        title: "Registration Successful",
        message:
          "Your account has been created successfully. Your profile is now under admin review.",
        buttonText: "Go to Login",
        redirectTo: "/login",
      });
    } catch (error) {
      showModal({
        type: "error",
        title: "Network Error",
        message:
          "Could not connect to the server. Please make sure your backend is running on localhost:4000.",
        details: error?.message || "",
        buttonText: "Okay",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <motion.div
          key="step-1"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5 sm:space-y-6"
        >
        

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="first_name"
              label="First Name"
              required
              icon={User}
              value={formData.first_name}
              onChange={(value) => update("first_name", value)}
              placeholder="Enter first name"
              error={errors.first_name}
            />

            <InputField
              id="last_name"
              label="Last Name"
              required
              icon={User}
              value={formData.last_name}
              onChange={(value) => update("last_name", value)}
              placeholder="Enter last name"
              error={errors.last_name}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="email_address"
              label="Email Address"
              required
              type="email"
              icon={Mail}
              value={formData.email_address}
              onChange={(value) => update("email_address", value)}
              placeholder="example@gmail.com"
              error={errors.email_address}
            />

            <InputField
              id="phone_number"
              label="Phone Number"
              required
              type="tel"
              icon={Phone}
              value={formData.phone_number}
              onChange={(value) => update("phone_number", value)}
              placeholder="017XXXXXXXX"
              error={errors.phone_number}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <PasswordField
              id="password"
              label="Password"
              value={formData.password}
              onChange={(value) => update("password", value)}
              error={errors.password}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => update("confirmPassword", value)}
              error={errors.confirmPassword}
            />
          </div>
        </motion.div>
      );
    }

    if (currentStep === 2) {
      return (
        <motion.div
          key="step-2"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5 sm:space-y-6"
        >
          <SectionHeader
            icon={Heart}
            title="Personal details"
            subtitle="These details help us create a trusted matrimony profile."
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="dob"
              label="Date of Birth"
              required
              type="date"
              icon={Calendar}
              value={formData.dob}
              onChange={(value) => update("dob", value)}
              error={errors.dob}
            />

            <SelectField
              id="gender"
              label="Gender"
              required
              value={formData.gender}
              onChange={(value) => update("gender", value)}
              error={errors.gender}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <SelectField
              id="religion"
              label="Religion"
              required
              value={formData.religion}
              onChange={(value) => update("religion", value)}
              error={errors.religion}
            >
              {religions.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </SelectField>

            <SelectField
              id="marital_status"
              label="Marital Status"
              required
              value={formData.marital_status}
              onChange={(value) => update("marital_status", value)}
              error={errors.marital_status}
            >
              {maritalStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="sect"
              label="Sect / Community"
              value={formData.sect}
              onChange={(value) => update("sect", value)}
              placeholder="Example: Sunni, Hindu community, etc."
            />

            <InputField
              id="mother_tongue"
              label="Mother Tongue"
              value={formData.mother_tongue}
              onChange={(value) => update("mother_tongue", value)}
              placeholder="Bangla"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <SelectField
              id="height"
              label="Height"
              required
              value={formData.height}
              onChange={handleHeightChange}
              error={errors.height}
            >
              {heightOptions.map((height) => (
                <option key={height.value} value={height.value}>
                  {height.label}
                </option>
              ))}
            </SelectField>

            <InputField
              id="weight_kg"
              label="Weight KG"
              type="number"
              value={formData.weight_kg}
              onChange={(value) => {
                update("weight_kg", value);
                update("weight", value ? `${value} kg` : "");
              }}
              placeholder="Example: 65"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
            <SelectField
              id="current_division"
              label="Current Division"
              required
              value={formData.current_division}
              onChange={(value) => update("current_division", value)}
              error={errors.current_division}
            >
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </SelectField>

            <InputField
              id="current_district"
              label="Current District"
              required
              icon={MapPin}
              value={formData.current_district}
              onChange={(value) => update("current_district", value)}
              placeholder="Example: Dhaka"
              error={errors.current_district}
            />

            <InputField
              id="current_city"
              label="Current City"
              required
              icon={MapPin}
              value={formData.current_city}
              onChange={(value) => update("current_city", value)}
              placeholder="Example: Mirpur"
              error={errors.current_city}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="nid"
              label="NID Number"
              value={formData.nid}
              onChange={(value) => update("nid", value)}
              placeholder="For admin verification"
            />

            <InputField
              id="passport"
              label="Passport Number"
              value={formData.passport}
              onChange={(value) => update("passport", value)}
              placeholder="Optional"
            />
          </div>
        </motion.div>
      );
    }

    if (currentStep === 3) {
      return (
        <motion.div
          key="step-3"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5 sm:space-y-6"
        >
          <SectionHeader
            icon={GraduationCap}
            title="Education and career"
            subtitle="Add your education, profession and income details."
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <SelectField
              id="highest_education"
              label="Highest Education"
              required
              value={formData.highest_education}
              onChange={(value) => update("highest_education", value)}
              error={errors.highest_education}
            >
              {educationOptions.map((education) => (
                <option key={education} value={education}>
                  {education}
                </option>
              ))}
            </SelectField>

            <InputField
              id="degree_name"
              label="Degree Name"
              value={formData.degree_name}
              onChange={(value) => update("degree_name", value)}
              placeholder="Example: BSc in CSE"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="institution_name"
              label="Institution Name"
              value={formData.institution_name}
              onChange={(value) => update("institution_name", value)}
              placeholder="Example: Daffodil International University"
            />

            <InputField
              id="passing_year"
              label="Passing Year"
              type="number"
              value={formData.passing_year}
              onChange={(value) => update("passing_year", value)}
              placeholder="Example: 2026"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="profession"
              label="Profession"
              required
              icon={Briefcase}
              value={formData.profession}
              onChange={(value) => update("profession", value)}
              placeholder="Example: Software Engineer"
              error={errors.profession}
            />

            <SelectField
              id="occupation_type"
              label="Occupation Type"
              required
              value={formData.occupation_type}
              onChange={(value) => update("occupation_type", value)}
              error={errors.occupation_type}
            >
              {occupationTypes.map((occupation) => (
                <option key={occupation.value} value={occupation.value}>
                  {occupation.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="company_or_business_name"
              label="Company / Business Name"
              value={formData.company_or_business_name}
              onChange={(value) => update("company_or_business_name", value)}
              placeholder="Optional"
            />

            <InputField
              id="designation"
              label="Designation"
              value={formData.designation}
              onChange={(value) => update("designation", value)}
              placeholder="Example: Backend Developer"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <SelectField
              id="annual_income"
              label="Income Range"
              required
              value={formData.annual_income}
              onChange={(value) => update("annual_income", value)}
              error={errors.annual_income}
            >
              {incomeRanges.map((income) => (
                <option key={income} value={income}>
                  {income}
                </option>
              ))}
            </SelectField>

            <InputField
              id="monthly_income"
              label="Monthly Income"
              value={formData.monthly_income}
              onChange={(value) => update("monthly_income", value)}
              placeholder="Example: 50000 BDT"
            />
          </div>
        </motion.div>
      );
    }

    if (currentStep === 4) {
      return (
        <motion.div
          key="step-4"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5 sm:space-y-6"
        >
          <SectionHeader
            icon={Users}
            title="Family and lifestyle"
            subtitle="Family information helps build a complete biodata."
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="father_occupation"
              label="Father Occupation"
              required
              value={formData.father_occupation}
              onChange={(value) => update("father_occupation", value)}
              placeholder="Example: Business"
              error={errors.father_occupation}
            />

            <InputField
              id="mother_occupation"
              label="Mother Occupation"
              required
              value={formData.mother_occupation}
              onChange={(value) => update("mother_occupation", value)}
              placeholder="Example: Housewife"
              error={errors.mother_occupation}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
            <SelectField
              id="family_type"
              label="Family Type"
              required
              value={formData.family_type}
              onChange={(value) => update("family_type", value)}
              error={errors.family_type}
            >
              <option value="nuclear">Nuclear</option>
              <option value="joint">Joint</option>
              <option value="extended">Extended</option>
            </SelectField>

            <SelectField
              id="family_status"
              label="Family Status"
              required
              value={formData.family_status}
              onChange={(value) => update("family_status", value)}
              error={errors.family_status}
            >
              <option value="lower_middle_class">Lower Middle Class</option>
              <option value="middle_class">Middle Class</option>
              <option value="upper_middle_class">Upper Middle Class</option>
              <option value="rich">Rich</option>
              <option value="elite">Elite</option>
            </SelectField>

            <SelectField
              id="family_values"
              label="Family Values"
              value={formData.family_values}
              onChange={(value) => update("family_values", value)}
            >
              <option value="traditional">Traditional</option>
              <option value="moderate">Moderate</option>
              <option value="liberal">Liberal</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <InputField
              id="number_of_brothers"
              label="Number of Brothers"
              type="number"
              value={formData.number_of_brothers}
              onChange={(value) => update("number_of_brothers", value)}
              placeholder="0"
            />

            <InputField
              id="number_of_sisters"
              label="Number of Sisters"
              type="number"
              value={formData.number_of_sisters}
              onChange={(value) => update("number_of_sisters", value)}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
            <SelectField
              id="diet"
              label="Diet"
              value={formData.diet}
              onChange={(value) => update("diet", value)}
            >
              <option value="halal">Halal</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non Vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="other">Other</option>
            </SelectField>

            <SelectField
              id="smoking"
              label="Smoking"
              value={formData.smoking}
              onChange={(value) => update("smoking", value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="occasionally">Occasionally</option>
            </SelectField>

            <SelectField
              id="drinking"
              label="Drinking"
              value={formData.drinking}
              onChange={(value) => update("drinking", value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="occasionally">Occasionally</option>
            </SelectField>
          </div>

          <TextAreaField
            id="family_details"
            label="Family Details"
            value={formData.family_details}
            onChange={(value) => update("family_details", value)}
            placeholder="Write short details about your family"
            rows={3}
            maxLength={1000}
          />

          <TextAreaField
            id="about_me"
            label="About Me"
            required
            value={formData.about_me}
            onChange={(value) => update("about_me", value)}
            placeholder="Write about yourself, your values, interests, and future goals"
            rows={5}
            maxLength={1500}
            error={errors.about_me}
          />

          <InputField
            id="hobbies"
            label="Hobbies"
            value={formData.hobbies}
            onChange={(value) => update("hobbies", value)}
            placeholder="Example: Reading, traveling, cooking"
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="step-5"
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-5 sm:space-y-6"
      >
        <SectionHeader
          icon={Heart}
          title="Partner preference"
          subtitle="Tell us what kind of partner you are looking for."
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <SelectField
            id="looking_for"
            label="Looking For"
            required
            value={formData.looking_for}
            onChange={(value) => update("looking_for", value)}
            error={errors.looking_for}
          >
            <option value="bride">Bride</option>
            <option value="groom">Groom</option>
          </SelectField>

          <InputField
            id="age_range_min"
            label="Minimum Age"
            required
            type="number"
            value={formData.age_range_min}
            onChange={(value) => update("age_range_min", value)}
            placeholder="18"
            error={errors.age_range_min}
          />

          <InputField
            id="age_range_max"
            label="Maximum Age"
            required
            type="number"
            value={formData.age_range_max}
            onChange={(value) => update("age_range_max", value)}
            placeholder="30"
            error={errors.age_range_max}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <SelectField
            id="preferred_religion"
            label="Preferred Religion"
            value={formData.preferred_religion}
            onChange={(value) => update("preferred_religion", value)}
          >
            {religions.map((religion) => (
              <option key={religion} value={religion}>
                {religion}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="preferred_marital_status"
            label="Preferred Marital Status"
            value={formData.preferred_marital_status}
            onChange={(value) => update("preferred_marital_status", value)}
          >
            {maritalStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <SelectField
            id="preferred_education"
            label="Preferred Education"
            value={formData.preferred_education}
            onChange={(value) => update("preferred_education", value)}
          >
            {educationOptions.map((education) => (
              <option key={education} value={education}>
                {education}
              </option>
            ))}
          </SelectField>

          <InputField
            id="preferred_profession"
            label="Preferred Profession"
            value={formData.preferred_profession}
            onChange={(value) => update("preferred_profession", value)}
            placeholder="Example: Doctor, Engineer"
          />

          <SelectField
            id="preferred_division"
            label="Preferred Division"
            value={formData.preferred_division}
            onChange={(value) => update("preferred_division", value)}
          >
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </SelectField>
        </div>

        <TextAreaField
          id="other_expectations"
          label="Other Expectations"
          value={formData.other_expectations}
          onChange={(value) => update("other_expectations", value)}
          placeholder="Write any additional expectations"
          rows={3}
          maxLength={1000}
        />

        <div>
          <FieldLabel htmlFor="profile_photos" required>
            Profile Photos
          </FieldLabel>

          <label
            htmlFor="profile_photos"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-4 py-8 text-center transition hover:border-rose-300 hover:bg-rose-50 ${
              errors.photos ? "border-rose-400 bg-rose-50" : "border-slate-200"
            }`}
          >
            <Upload className="mb-3 h-8 w-8 text-rose-500" />
            <p className="text-sm font-semibold text-slate-700">
              Click to upload profile photos
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG or WEBP. Max 6 photos, 5MB each.
            </p>

            <input
              id="profile_photos"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {errors.photos ? (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {errors.photos}
            </p>
          ) : null}
        </div>

        {profilePhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {profilePhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={photo.preview}
                  alt={`Profile ${index + 1}`}
                  className="h-36 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-rose-600 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                {index === 0 ? (
                  <span className="absolute bottom-2 left-2 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                    Main Photo
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => update("agreeToTerms", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm text-slate-700">
              I agree to the{" "}
              <span className="font-semibold text-rose-600">
                Terms and Conditions
              </span>
              .
            </span>
          </label>

          {errors.agreeToTerms ? (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {errors.agreeToTerms}
            </p>
          ) : null}

          <label className="mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.agreeToPrivacy}
              onChange={(e) => update("agreeToPrivacy", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm text-slate-700">
              I agree to the{" "}
              <span className="font-semibold text-rose-600">
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {errors.agreeToPrivacy ? (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {errors.agreeToPrivacy}
            </p>
          ) : null}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <MessageModal modal={modal} onClose={closeModal} />

      <div className="min-h-screen bg-[#f8f3ef] px-3 pb-8 pt-24 text-slate-800 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 text-center sm:mb-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200 sm:mb-4 sm:h-14 sm:w-14">
              <Heart className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Create Your Matrimony Profile
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
              Complete your profile step by step. Your information will be
              reviewed by admin before full approval.
            </p>
          </div>

          <MobileStepSummary currentStep={currentStep} progress={progress} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr] lg:gap-6">
            <aside className="hidden h-fit rounded-3xl border border-white bg-white/80 p-5 shadow-sm backdrop-blur lg:sticky lg:top-28 lg:block">
              <div className="mb-5">
                <p className="text-sm font-semibold text-slate-500">
                  Registration Progress
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {progress}%
                  </h2>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    Step {currentStep} of {steps.length}
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <motion.div
                    className="h-2 rounded-full bg-rose-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step) => {
                  const active = step.id === currentStep;
                  const completed = step.id < currentStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (step.id < currentStep) setCurrentStep(step.id);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-rose-200 bg-rose-50"
                          : completed
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          active
                            ? "bg-rose-600 text-white"
                            : completed
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          {step.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {step.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Secure registration
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your sensitive details are protected and used only for
                      profile verification.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="overflow-hidden rounded-2xl border border-white bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7 md:p-8">
              <div className="mb-5 border-b border-slate-100 pb-4 sm:mb-6 sm:pb-5">
                <StepIndicator currentStep={currentStep} />

                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {currentStepInfo?.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {currentStepInfo?.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-auto"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-auto"
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}