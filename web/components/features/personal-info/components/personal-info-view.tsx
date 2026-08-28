"use client";

import { useState } from "react";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

function splitName(name: string | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

const FIELD_ICON_CLASS = "size-6 shrink-0 text-[#222]";

function ProfileField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex h-[60px] items-center gap-2.5 rounded-2xl bg-[#f3f3f3] px-5">
      {icon}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-base text-[#222] outline-none placeholder:text-[#222] read-only:cursor-not-allowed read-only:opacity-70"
      />
    </label>
  );
}

type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | string | null;
  addressLine1?: string | null;
};

function PersonalInfoForm({ user }: { user: SessionUser }) {
  const fallbackName = splitName(user.name);
  const initial = {
    firstName: user.firstName || fallbackName.firstName,
    lastName: user.lastName || fallbackName.lastName,
    phone: user.phoneNumber ?? "",
    dateOfBirth: toDateInputValue(user.dateOfBirth),
    address: user.addressLine1 ?? "",
  };

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth);
  const [address, setAddress] = useState(initial.address);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await authClient.updateUser({
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phoneNumber: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        addressLine1: address || undefined,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setPhone(initial.phone);
    setDateOfBirth(initial.dateOfBirth);
    setAddress(initial.address);
  }

  return (
    <div className="mt-[30px] flex w-full flex-col gap-[60px] rounded-[20px] bg-white p-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="relative size-[100px] shrink-0 overflow-hidden rounded-full bg-[#e5ebd8]">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- OAuth avatars use arbitrary remote hosts
              <img
                src={user.image}
                alt={user.name ?? "Profile photo"}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl text-[#185b50]">
                {(firstName[0] ?? "?").toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <p className="font-serif text-2xl text-[#185b50]">
              {user.name || "—"}
            </p>
            <p className="text-base text-[#546256]">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Changing your photo is coming soon.")}
          className="h-[39px] rounded-full border border-[#546256] px-[15px] py-[11px] text-sm leading-none text-[#546256] transition-colors hover:bg-[#546256]/5"
        >
          Change Photo
        </button>
      </div>

      <div className="grid w-full grid-cols-1 gap-[30px] sm:grid-cols-2">
        <ProfileField
          icon={<User className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Enter your first name"
          value={firstName}
          onChange={setFirstName}
        />
        <ProfileField
          icon={<User className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Enter your last name"
          value={lastName}
          onChange={setLastName}
        />
        <ProfileField
          icon={<Mail className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Enter your email address"
          value={user.email ?? ""}
          onChange={() => {}}
          type="email"
          readOnly
        />
        <ProfileField
          icon={<Phone className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Enter your contact number"
          value={phone}
          onChange={setPhone}
          type="tel"
        />
        <ProfileField
          icon={<Calendar className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Date of Birth"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          type="date"
        />
        <ProfileField
          icon={<MapPin className={FIELD_ICON_CLASS} aria-hidden />}
          placeholder="Enter your address"
          value={address}
          onChange={setAddress}
        />
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-[60px] rounded-2xl bg-[#185b50] px-[30px] text-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="h-[60px] rounded-2xl bg-[#185b50]/20 px-[30px] text-base text-[#185b50] transition-opacity hover:opacity-90"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PersonalInfoView() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="flex w-full flex-col items-start gap-2.5">
      <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
        Personal Info
      </h1>
      <p className="text-base text-[#546256]">Contact details and preferences</p>

      {isPending || !session?.user ? (
        <div className="mt-[30px] h-[518px] w-full animate-pulse rounded-[20px] bg-white" />
      ) : (
        <PersonalInfoForm key={session.user.id} user={session.user} />
      )}
    </div>
  );
}
