"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type UniveFormData,
  UNIVE_INITIAL_FORM_DATA,
  normalizeFormData,
} from "@/lib/unive-questionnaire";

const FORM_STORAGE_KEY = "univeFormV2";

export function useUniveFormState() {
  const [formData, setFormData] = useState<UniveFormData>(UNIVE_INITIAL_FORM_DATA);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as unknown;
      setFormData(normalizeFormData(parsed));
    } catch {
      // Bij parsefout: blijf bij initiële data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Als storage faalt (bijv. vol of disabled), negeer rustig.
    }
  }, [formData]);

  const update = useCallback((partial: Partial<UniveFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleMulti = useCallback(
    (field: keyof UniveFormData, value: string, max?: number) => {
      setFormData((prev) => {
        const current = (prev[field] as string[]) ?? [];
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter((v) => v !== value) };
        }
        if (max && current.length >= max) return prev;
        return { ...prev, [field]: [...current, value] };
      });
    },
    []
  );

  return {
    formData,
    update,
    toggleMulti,
  };
}

