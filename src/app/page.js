"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasToken } from "@/lib/token";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(hasToken() ? "/explore" : "/settings");
  }, [router]);
  return null;
}
