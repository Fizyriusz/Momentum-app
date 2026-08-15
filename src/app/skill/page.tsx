"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function SkillRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/projects?id=${id}`);
    } else {
      router.replace(`/projects`);
    }
  }, [id, router]);

  return <div className="text-zinc-500 text-center py-20">Przekierowywanie do projektów...</div>;
}

export default function SkillPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Ładowanie...</div>}>
      <SkillRedirectContent />
    </Suspense>
  );
}
