"use client";

import { useEffect, useState } from "react";

const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductImageInput({
  required = false,
}: {
  required?: boolean;
}) {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="w-full">
      <input
        type="file"
        name="imageFile"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        className="block w-full rounded-xl border border-white/10 bg-[#080d0a] p-3 text-white"
        onChange={(event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];

          setPreview(null);
          setFilename("");

          if (!file) {
            setError("");
            return;
          }

          if (!TYPES.includes(file.type)) {
            input.value = "";
            setError("الصيغة غير مدعومة. اختار JPG أو PNG أو WebP.");
            return;
          }

          if (file.size > MAX_SIZE) {
            input.value = "";
            setError("الصورة كتفوت 5MB. اختار صورة أصغر.");
            return;
          }

          setError("");
          setFilename(file.name);
          setPreview(URL.createObjectURL(file));
        }}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-red-400">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 rounded-2xl border border-green-500/30 bg-black/40 p-4">
          <p className="mb-3 text-sm font-bold text-green-400">
            معاينة الصورة
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="معاينة صورة المنتج"
            className="mx-auto h-48 w-full rounded-xl object-contain"
          />
          <p className="mt-3 break-all text-center text-xs text-zinc-400">
            {filename}
          </p>
        </div>
      )}

      <p className="mt-2 text-xs text-zinc-500">
        JPG / PNG / WebP — الحد الأقصى 5MB
      </p>
    </div>
  );
}
