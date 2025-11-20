"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Button,
  Checkbox,
  FileInput,
  Alert,
  Textarea,
  Label,
} from "flowbite-react";
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
  Users,
  CreditCard,
  AlertCircle,
  Heart,
} from "lucide-react";
import { FiEye, FiEyeOff, FiChevronDown } from "react-icons/fi";

/* ---------- Reusable glass inputs (uniform UI) ---------- */

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}) {
  return (
    <div>
      <Label htmlFor={id} value={label} className="mb-1 block text-white/85" />
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-11 rounded-xl border bg-white/5 text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-rose-300
            ${error ? "border-rose-300/70" : "border-white/15"}
            ${Icon ? "pl-10" : "pl-3"} pr-3`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function SelectFieldGlass({
  id,
  label,
  value,
  onChange,
  children,
  error,
  placeholder = "Select...",
}) {
  return (
    <div>
      <Label htmlFor={id} value={label} className="mb-1 block text-white/85" />
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 appearance-none rounded-xl border bg-white/5 text-white
            focus:outline-none focus:ring-2 focus:ring-rose-300
            ${error ? "border-rose-300/70" : "border-white/15"} pl-3 pr-10`}
        >
          <option value="" className="bg-[#0b0a12]">
            {placeholder}
          </option>
          {children}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
      </div>
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id} value={label} className="mb-1 block text-white/85" />
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full h-11 rounded-xl border bg-white/5 text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-rose-300
            ${error ? "border-rose-300/70" : "border-white/15"} pl-10 pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
        >
          {show ? (
            <FiEyeOff className="h-4 w-4 text-white/85" />
          ) : (
            <FiEye className="h-4 w-4 text-white/85" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

/* ---------- Main form ---------- */

const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    nid: "",
    passport: "",

    current_city: "",
    preferred_location: "",
    profession: "",
    highest_education: "",
    annual_income: "",

    father_nid: "",
    mother_nid: "",
    siblings: "",

    diet: "",
    hobbies: "",
    smoking_habits: "",
    drinking_habits: "",
    religion: "",
    marital_status: "",
    height: "",
    mother_tongue: "",

    about_me: "",
    looking_for: "",
    age_range_min: "",
    age_range_max: "",

    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const update = (k, v) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + profilePhotos.length > 6) {
      setErrors((p) => ({ ...p, photos: "Maximum 6 photos allowed" }));
      return;
    }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((p) => ({ ...p, photos: "Each photo must be < 5MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) =>
        setProfilePhotos((prev) => [
          ...prev,
          { file, preview: ev.target.result, id: Date.now() + Math.random() },
        ]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id) =>
    setProfilePhotos((p) => p.filter((x) => x.id !== id));

  const validateStep = (s) => {
    const e = {};
    switch (s) {
      case 1:
        if (!formData.first_name) e.first_name = "First name is required";
        if (!formData.last_name) e.last_name = "Last name is required";
        if (!formData.email_address) e.email_address = "Email is required";
        if (!formData.phone_number) e.phone_number = "Phone number is required";
        if (!formData.password) e.password = "Password is required";
        if (formData.password !== formData.confirmPassword)
          e.confirmPassword = "Passwords do not match";
        if (!formData.dob) e.dob = "Date of birth is required";
        if (!formData.gender) e.gender = "Gender is required";
        if (!formData.nid) e.nid = "National ID is required";
        break;
      case 2:
        if (!formData.current_city) e.current_city = "Current city is required";
        if (!formData.profession) e.profession = "Profession is required";
        if (!formData.highest_education)
          e.highest_education = "Education is required";
        if (!formData.annual_income) e.annual_income = "Income is required";
        break;
      case 3:
        if (!formData.religion) e.religion = "Religion is required";
        if (!formData.marital_status)
          e.marital_status = "Marital status is required";
        if (!formData.height) e.height = "Height is required";
        if (!formData.mother_tongue)
          e.mother_tongue = "Mother tongue is required";
        break;
      case 4:
        if (!formData.about_me) e.about_me = "About me is required";
        if (profilePhotos.length < 2)
          e.photos = "At least 2 photos are required";
        break;
      case 5:
        if (!formData.looking_for) e.looking_for = "Looking for is required";
        if (!formData.age_range_min) e.age_range_min = "Minimum age is required";
        if (!formData.age_range_max) e.age_range_max = "Maximum age is required";
        if (!formData.agreeToTerms) e.agreeToTerms = "You must agree to terms";
        if (!formData.agreeToPrivacy)
          e.agreeToPrivacy = "You must agree to privacy policy";
        break;
      default:
        break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => validateStep(currentStep) && setCurrentStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "confirmPassword") fd.append(k, v);
      });
      profilePhotos.forEach((p) => fd.append("profile_photos", p.file));

      const res = await fetch("https://ghotoker-bari-api.vercel.app/api/user/register", {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (!res.ok) setErrors({ submit: result.message || "Registration failed" });
      else alert("Registration successful! Please check your email for verification.");
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  /* ---------- Steps (all fields now use glass inputs + top labels) ---------- */

  const Step1 = (
    <motion.div key="s1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Personal Information</h2>
        <p className="text-white/70">Let’s start with your basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField id="first_name" label="First Name *" icon={User}
          value={formData.first_name} onChange={(v) => update("first_name", v)} placeholder="Enter first name" error={errors.first_name} />
        <InputField id="last_name" label="Last Name *" icon={User}
          value={formData.last_name} onChange={(v) => update("last_name", v)} placeholder="Enter last name" error={errors.last_name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField id="email_address" label="Email Address *" type="email" icon={Mail}
          value={formData.email_address} onChange={(v) => update("email_address", v)} placeholder="Enter email address" error={errors.email_address} />
        <InputField id="phone_number" label="Phone Number *" type="tel" icon={Phone}
          value={formData.phone_number} onChange={(v) => update("phone_number", v)} placeholder="+880 1XXX-XXXXXX" error={errors.phone_number} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PasswordField id="password" label="Password *" value={formData.password} onChange={(v) => update("password", v)} error={errors.password} />
        <PasswordField id="confirmPassword" label="Confirm Password *" value={formData.confirmPassword} onChange={(v) => update("confirmPassword", v)} error={errors.confirmPassword} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField id="dob" label="Date of Birth *" type="date" icon={Calendar}
          value={formData.dob} onChange={(v) => update("dob", v)} error={errors.dob} />
        <SelectFieldGlass id="gender" label="Gender *" value={formData.gender} onChange={(v) => update("gender", v)} error={errors.gender}>
          <option value="male" className="bg-[#0b0a12]">Male</option>
          <option value="female" className="bg-[#0b0a12]">Female</option>
        </SelectFieldGlass>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField id="nid" label="National ID (NID) *" icon={CreditCard}
          value={formData.nid} onChange={(v) => update("nid", v)} placeholder="Enter NID number" error={errors.nid} />
        <InputField id="passport" label="Passport Number (Optional)" icon={CreditCard}
          value={formData.passport} onChange={(v) => update("passport", v)} placeholder="Enter passport number" />
      </div>
    </motion.div>
  );

  const Step2 = (
    <motion.div key="s2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Professional Details</h2>
        <p className="text-white/70">Tell us about your career and education</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="current_city" label="Current City *" value={formData.current_city} onChange={(v) => update("current_city", v)} error={errors.current_city}>
          {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barishal","Rangpur","Mymensingh"].map((c) => (
            <option key={c} value={c.toLowerCase()} className="bg-[#0b0a12]">{c}</option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="preferred_location" label="Preferred Location" value={formData.preferred_location} onChange={(v) => update("preferred_location", v)}>
          {["Anywhere in Bangladesh","Dhaka","Chittagong","Sylhet","Living abroad"].map((c) => (
            <option key={c} value={c.toLowerCase()} className="bg-[#0b0a12]">{c}</option>
          ))}
        </SelectFieldGlass>
      </div>

      <InputField id="profession" label="Profession *" icon={Briefcase}
        value={formData.profession} onChange={(v) => update("profession", v)} placeholder="e.g., Software Engineer, Doctor, Teacher" error={errors.profession} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="highest_education" label="Highest Education *" value={formData.highest_education} onChange={(v) => update("highest_education", v)} error={errors.highest_education}>
          {["HSC","Bachelor's Degree","Master's Degree","PhD","Diploma","Other"].map((d) => (
            <option key={d} value={d.toLowerCase()} className="bg-[#0b0a12]">{d}</option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="annual_income" label="Annual Income *" value={formData.annual_income} onChange={(v) => update("annual_income", v)} error={errors.annual_income}>
          {["Below 2 Lakh BDT","2–5 Lakh BDT","5–8 Lakh BDT","8–12 Lakh BDT","12–20 Lakh BDT","Above 20 Lakh BDT"].map((d) => (
            <option key={d} value={d.toLowerCase()} className="bg-[#0b0a12]">{d}</option>
          ))}
        </SelectFieldGlass>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField id="father_nid" label="Father's NID" icon={Users}
          value={formData.father_nid} onChange={(v) => update("father_nid", v)} placeholder="Father's National ID" />
        <InputField id="mother_nid" label="Mother's NID" icon={Users}
          value={formData.mother_nid} onChange={(v) => update("mother_nid", v)} placeholder="Mother's National ID" />
      </div>

      <div>
        <Label htmlFor="siblings" value="Siblings Information" className="mb-1 block text-white/85" />
        <Textarea
          id="siblings"
          value={formData.siblings}
          onChange={(e) => update("siblings", e.target.value)}
          placeholder="Number of siblings, their professions, etc."
          rows={3}
          className="bg-white/5 text-white placeholder-white/50 border border-white/15 rounded-xl focus:ring-2 focus:ring-rose-300"
        />
      </div>
    </motion.div>
  );

  const Step3 = (
    <motion.div key="s3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Personal & Lifestyle</h2>
        <p className="text-white/70">Share more about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="religion" label="Religion *" value={formData.religion} onChange={(v) => update("religion", v)} error={errors.religion}>
          {["Islam","Hinduism","Christianity","Buddhism","Other"].map((r) => (
            <option key={r} value={r.toLowerCase()} className="bg-[#0b0a12]">{r}</option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="marital_status" label="Marital Status *" value={formData.marital_status} onChange={(v) => update("marital_status", v)} error={errors.marital_status}>
          {["Never Married","Divorced","Widowed"].map((r) => (
            <option key={r} value={r.toLowerCase()} className="bg-[#0b0a12]">{r}</option>
          ))}
        </SelectFieldGlass>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="height" label="Height *" value={formData.height} onChange={(v) => update("height", v)} error={errors.height}>
          {["4'10\"","5'0\"","5'2\"","5'4\"","5'6\"","5'8\"","5'10\"","6'0\"","6'2\""].map((h) => (
            <option key={h} value={h} className="bg-[#0b0a12]">{h}</option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="mother_tongue" label="Mother Tongue *" value={formData.mother_tongue} onChange={(v) => update("mother_tongue", v)} error={errors.mother_tongue}>
          {["Bengali","English","Hindi","Urdu","Arabic","Other"].map((l) => (
            <option key={l} value={l.toLowerCase()} className="bg-[#0b0a12]">{l}</option>
          ))}
        </SelectFieldGlass>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="diet" label="Diet Preference" value={formData.diet} onChange={(v) => update("diet", v)}>
          {["Vegetarian","Non-Vegetarian","Vegan","Halal Only"].map((d) => (
            <option key={d} value={d.toLowerCase()} className="bg-[#0b0a12]">{d}</option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="smoking_habits" label="Smoking Habits" value={formData.smoking_habits} onChange={(v) => update("smoking_habits", v)}>
          {["Never","Occasionally","Regularly","Trying to Quit"].map((d) => (
            <option key={d} value={d.toLowerCase()} className="bg-[#0b0a12]">{d}</option>
          ))}
        </SelectFieldGlass>
      </div>

      <SelectFieldGlass id="drinking_habits" label="Drinking Habits" value={formData.drinking_habits} onChange={(v) => update("drinking_habits", v)}>
        {["Never","Socially","Occasionally","Regularly"].map((d) => (
          <option key={d} value={d.toLowerCase()} className="bg-[#0b0a12]">{d}</option>
        ))}
      </SelectFieldGlass>

      <div>
        <Label htmlFor="hobbies" value="Hobbies & Interests" className="mb-1 block text-white/85" />
        <Textarea
          id="hobbies"
          value={formData.hobbies}
          onChange={(e) => update("hobbies", e.target.value)}
          placeholder="Reading, traveling, cooking, sports, music, etc."
          rows={3}
          className="bg-white/5 text-white placeholder-white/50 border border-white/15 rounded-xl focus:ring-2 focus:ring-rose-300"
        />
      </div>
    </motion.div>
  );

  const Step4 = (
    <motion.div key="s4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">About Yourself</h2>
        <p className="text-white/70">Write about yourself and upload photos</p>
      </div>

      <div>
        <Label htmlFor="about_me" value="About Me *" className="mb-1 block text-white/85" />
        <Textarea
          id="about_me"
          value={formData.about_me}
          onChange={(e) => update("about_me", e.target.value)}
          placeholder="Tell us about yourself, your interests, what you're looking for in a life partner..."
          rows={6}
          className="bg-white/5 text-white placeholder-white/50 border border-white/15 rounded-xl focus:ring-2 focus:ring-rose-300"
        />
        <div className="mt-1 text-xs text-white/60">{formData.about_me.length}/500 characters</div>
        {errors.about_me && <p className="mt-1 text-xs text-rose-300">{errors.about_me}</p>}
      </div>

      <div>
        <Label value="Profile Photos * (At least 2 required)" className="mb-1 block text-white/85" />
        <FileInput
          id="profile_photos"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          helperText="Upload high-quality photos. Max 6 photos, 5MB each."
          className="bg-white/5 text-white"
        />
        {errors.photos && <p className="mt-1 text-xs text-rose-300">{errors.photos}</p>}
      </div>

      {profilePhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profilePhotos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5"
            >
              <img src={p.preview} alt={`Profile ${i + 1}`} className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {i === 0 && (
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded">
                  Main
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const Step5 = (
    <motion.div key="s5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Partner Preferences</h2>
        <p className="text-white/70">Tell us what you’re looking for</p>
      </div>

      <SelectFieldGlass id="looking_for" label="Looking for *" value={formData.looking_for} onChange={(v) => update("looking_for", v)} error={errors.looking_for}>
        <option value="bride" className="bg-[#0b0a12]">Bride</option>
        <option value="groom" className="bg-[#0b0a12]">Groom</option>
      </SelectFieldGlass>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectFieldGlass id="age_range_min" label="Age Range (Min) *" value={formData.age_range_min} onChange={(v) => update("age_range_min", v)} error={errors.age_range_min}>
          {Array.from({ length: 25 }, (_, i) => 18 + i).map((a) => (
            <option key={a} value={String(a)} className="bg-[#0b0a12]">
              {a}
            </option>
          ))}
        </SelectFieldGlass>
        <SelectFieldGlass id="age_range_max" label="Age Range (Max) *" value={formData.age_range_max} onChange={(v) => update("age_range_max", v)} error={errors.age_range_max}>
          {Array.from({ length: 25 }, (_, i) => 25 + i).map((a) => (
            <option key={a} value={String(a)} className="bg-[#0b0a12]">
              {a}
            </option>
          ))}
        </SelectFieldGlass>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="agreeToTerms" checked={formData.agreeToTerms} onChange={(e) => update("agreeToTerms", e.target.checked)} />
          <Label htmlFor="agreeToTerms" className="text-white/90">
            I agree to the <span className="text-rose-300 hover:underline">Terms of Service</span> *
          </Label>
        </div>
        {errors.agreeToTerms && <p className="text-xs text-rose-300">{errors.agreeToTerms}</p>}

        <div className="flex items-center gap-2">
          <Checkbox id="agreeToPrivacy" checked={formData.agreeToPrivacy} onChange={(e) => update("agreeToPrivacy", e.target.checked)} />
          <Label htmlFor="agreeToPrivacy" className="text-white/90">
            I agree to the <span className="text-rose-300 hover:underline">Privacy Policy</span> *
          </Label>
        </div>
        {errors.agreeToPrivacy && <p className="text-xs text-rose-300">{errors.agreeToPrivacy}</p>}
      </div>
    </motion.div>
  );

  const renderStep = () => [Step1, Step2, Step3, Step4, Step5][currentStep - 1];

  /* ---------- Shell ---------- */

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: "#0b0a12" }}>
      {/* background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl opacity-25 bg-fuchsia-600/40" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-20 bg-rose-500/40" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <Heart className="w-4 h-4 text-rose-300" />
            Premium matchmaking — verified & private
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Create Your Profile
            </span>
          </h1>
          <p className="text-white/70 mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Framed glass card */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-fuchsia-300/40 via-pink-300/40 to-rose-300/40">
          <Card className="bg-neutral-900/85 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl">
            <div className="p-6 md:p-8">
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-white/70">{Math.round(progress)}% complete</div>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45 }}
                />
              </div>

              {errors.submit && (
                <Alert color="failure" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.submit}</span>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mt-6">
                  <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                  <Button
                    type="button"
                    color="light"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="cursor-pointer rounded-xl font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:brightness-105"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.agreeToTerms ||
                        !formData.agreeToPrivacy
                      }
                      className="cursor-pointer rounded-xl font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:brightness-105"
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;
