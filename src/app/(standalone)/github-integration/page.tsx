"use client";

import { GithubLoginCard } from "@/features/auth/components/github-login-card";
import { PageLoader } from "@/components/page-loader";
import { useState, useEffect } from "react";

export default function GithubIntegrationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <GithubLoginCard />
    </div>
  );
}