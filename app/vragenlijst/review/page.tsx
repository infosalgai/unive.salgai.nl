"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * De review-stap is vervangen door direct versturen op stap q21.
 * Oude links naar /vragenlijst/review leiden naar de laatste vraag zodat
 * de gebruiker daar kan versturen.
 */
export default function ReviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vragenlijst?stap=q21");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Doorverwijzen">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
    </div>
  );
}
