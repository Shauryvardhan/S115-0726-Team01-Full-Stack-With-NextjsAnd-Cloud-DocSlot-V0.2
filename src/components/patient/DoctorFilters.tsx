"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type DoctorFiltersProps = {
  initialSpecialty?: string;
  initialGender?: string;
  initialMinRating?: string;
  initialMaxFee?: string;
  initialAvailability?: string;
};

export default function DoctorFilters({
  initialSpecialty = "",
  initialGender = "",
  initialMinRating = "",
  initialMaxFee = "500",
  initialAvailability = "",
}: DoctorFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [gender, setGender] = useState<string>(initialGender || searchParams.get("gender") || "");
  const [availability, setAvailability] = useState<string>(initialAvailability || searchParams.get("availability") || "");
  const [minRating, setMinRating] = useState<string>(initialMinRating || searchParams.get("minRating") || "");
  const [maxFee, setMaxFee] = useState<number>(
    Number(initialMaxFee || searchParams.get("maxFee") || "500")
  );
  const [specialty, setSpecialty] = useState<string>(initialSpecialty || searchParams.get("specialty") || "");
  const [isPending, startTransition] = useTransition();

  const applyFilters = (overrides?: {
    gender?: string;
    availability?: string;
    minRating?: string;
    maxFee?: number;
    specialty?: string;
  }) => {
    const activeGender = overrides?.gender ?? gender;
    const activeAvailability = overrides?.availability ?? availability;
    const activeMinRating = overrides?.minRating ?? minRating;
    const activeMaxFee = overrides?.maxFee ?? maxFee ?? 500;
    const activeSpecialty = overrides?.specialty ?? specialty;

    const params = new URLSearchParams();
    if (activeSpecialty) params.set("specialty", activeSpecialty);
    if (activeGender) params.set("gender", activeGender);
    if (activeMinRating) params.set("minRating", activeMinRating);
    if (activeMaxFee < 500) params.set("maxFee", activeMaxFee.toString());
    if (activeAvailability) params.set("availability", activeAvailability);

    const q = searchParams.get("q");
    if (q) params.set("q", q);

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const handleGenderToggle = (selectedGender: string) => {
    const newGender = gender === selectedGender ? "" : selectedGender;
    setGender(newGender);
    applyFilters({ gender: newGender });
  };

  const handleAvailabilityToggle = (selectedAvailability: string) => {
    const newAvailability = availability === selectedAvailability ? "" : selectedAvailability;
    setAvailability(newAvailability);
    applyFilters({ availability: newAvailability });
  };

  const handleRatingChange = (newRating: string) => {
    setMinRating(newRating);
    applyFilters({ minRating: newRating });
  };

  const handleFeeChange = (newFee: number) => {
    setMaxFee(newFee);
  };

  const handleFeeChangeComplete = () => {
    applyFilters();
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialty(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleClearAll = () => {
    setGender("");
    setAvailability("");
    setMinRating("");
    setMaxFee(500);
    setSpecialty("");

    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Filters</h2>
        {isPending && (
          <span className="text-xs text-blue-600 animate-pulse font-medium">Filtering...</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Availability */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Availability</p>
          <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availability === "today"}
              onChange={() => handleAvailabilityToggle("today")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium">Available Today</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availability === "week"}
              onChange={() => handleAvailabilityToggle("week")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium">Available this week</span>
          </label>
        </div>

        {/* Minimum Rating */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Minimum Rating</p>
          <select
            value={minRating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-blue-600 text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="">Any Rating</option>
            <option value="4.5">⭐ 4.5+ Stars</option>
            <option value="4.0">⭐ 4.0+ Stars</option>
            <option value="3.5">⭐ 3.5+ Stars</option>
          </select>
        </div>

        {/* Fee Range */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Fee Range</p>
            <span className="text-xs font-bold text-blue-600">
              {maxFee >= 500 ? "Any Fee (₹500+)" : `Up to ₹${maxFee}`}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={maxFee}
            onChange={(e) => handleFeeChange(Number(e.target.value))}
            onMouseUp={handleFeeChangeComplete}
            onTouchEnd={handleFeeChangeComplete}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
            <span>₹50</span>
            <span>₹500+</span>
          </div>
        </div>

        {/* Gender */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleGenderToggle("Male")}
              className={`flex-1 py-2 text-sm border rounded-lg transition-all cursor-pointer font-medium ${
                gender === "Male"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderToggle("Female")}
              className={`flex-1 py-2 text-sm border rounded-lg transition-all cursor-pointer font-medium ${
                gender === "Female"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Specialty Filter */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialty</p>
          <input
            type="text"
            name="specialty"
            placeholder="e.g. Cardiology"
            value={specialty}
            onChange={handleSpecialtyChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="pt-1 space-y-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      </form>
    </div>
  );
}
