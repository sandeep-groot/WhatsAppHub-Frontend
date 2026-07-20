"use client";

import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
];

/** Helper to parse a raw string (e.g. "+919728279578" or "919728279578") into country + national number. */
export function parsePhoneNumber(raw: string): { country: Country; nationalNumber: string } {
  const clean = raw.trim();
  if (!clean) {
    return { country: COUNTRIES[0], nationalNumber: "" };
  }

  const normalized = clean.startsWith("+") ? clean : `+${clean}`;
  
  // Find matching country by longest dial code match
  const matchedCountry = COUNTRIES.slice().sort((a, b) => b.dialCode.length - a.dialCode.length).find((c) =>
    normalized.startsWith(c.dialCode)
  );

  if (matchedCountry) {
    const nationalNumber = normalized.slice(matchedCountry.dialCode.length).replace(/[^\d]/g, "");
    return { country: matchedCountry, nationalNumber };
  }

  const digits = clean.replace(/[^\d]/g, "");
  return { country: COUNTRIES[0], nationalNumber: digits };
}

interface CountryPhoneInputProps {
  label: string;
  value: string;
  onChange: (fullNumber: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function CountryPhoneInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "e.g. 7428730894",
  required = false,
}: CountryPhoneInputProps) {
  const parsed = parsePhoneNumber(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(parsed.country);
  const [nationalNumber, setNationalNumber] = useState<string>(parsed.nationalNumber);

  // Sync external resets (e.g. form cleared)
  useEffect(() => {
    const fresh = parsePhoneNumber(value);
    setNationalNumber(fresh.nationalNumber);
    setSelectedCountry(fresh.country);
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const country = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
    setSelectedCountry(country);

    const fullNumber = nationalNumber ? `${country.dialCode}${nationalNumber}` : "";
    onChange(fullNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value.trim();

    // 1. If input starts with "+", auto-parse country and national number
    if (rawInput.startsWith("+")) {
      const parsed = parsePhoneNumber(rawInput);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
      onChange(parsed.nationalNumber ? `${parsed.country.dialCode}${parsed.nationalNumber}` : "");
      return;
    }

    const digitsOnly = rawInput.replace(/[^\d]/g, "");

    // 2. If user pastes a full number starting with selected dial code (e.g., "917428730894" when dialCode is "+91")
    const currentDialDigits = selectedCountry.dialCode.replace(/[^\d]/g, "");
    if (digitsOnly.length > 10 && digitsOnly.startsWith(currentDialDigits)) {
      const stripped = digitsOnly.slice(currentDialDigits.length);
      setNationalNumber(stripped);
      onChange(`${selectedCountry.dialCode}${stripped}`);
      return;
    }

    // 3. If user pastes a full number with another country code (e.g. "17174300078" for US)
    if (digitsOnly.length > 10) {
      const parsed = parsePhoneNumber(`+${digitsOnly}`);
      if (parsed.nationalNumber) {
        setSelectedCountry(parsed.country);
        setNationalNumber(parsed.nationalNumber);
        onChange(`${parsed.country.dialCode}${parsed.nationalNumber}`);
        return;
      }
    }

    // Standard national number input
    setNationalNumber(digitsOnly);
    const fullNumber = digitsOnly ? `${selectedCountry.dialCode}${digitsOnly}` : "";
    onChange(fullNumber);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="flex items-center gap-2">
        {/* Country Dropdown */}
        <div className="relative shrink-0 w-[95px] sm:w-[105px]">
          <select
            disabled={disabled}
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className="w-full appearance-none pl-2.5 pr-7 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 truncate"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code} ({country.dialCode})
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Phone Input with Prefix Badge */}
        <div className="relative flex-1 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all overflow-hidden">
          <span className="px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-r border-gray-200 dark:border-gray-700 select-none shrink-0">
            {selectedCountry.dialCode}
          </span>
          <input
            type="tel"
            required={required}
            disabled={disabled}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 text-sm font-medium bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
