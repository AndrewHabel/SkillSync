"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, GitBranchIcon, GithubIcon, StarIcon, RssIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubProfile, getGithubRepositories } from "@/features/auth/api/github-auth";

interface GitHubProfileData {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  company?: string;
  location?: string;
  blog?: string;
}

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
}

export const GitHubProfileCard = () => {
  const [profile, setProfile] = useState<GitHubProfileData | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        
        // Fetch GitHub profile data
        const profileData = await getGithubProfile();
        setProfile(profileData);
        
        // Fetch GitHub repositories data
        const reposData = await getGithubRepositories();
        // Only take the first 5 repos for display
        setRepositories(reposData.slice(0, 5));
        
        setError(null);
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setError(err instanceof Error ? err.message : "Failed to load GitHub data");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  if (loading) {
    return (
      <Card className="workspace-section scale-in w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <GithubIcon className="size-5 mr-2 text-primary" />
            <CardTitle className="workspace-section-title">GitHub Profile</CardTitle>
          </div>
        </CardHeader>
        <DottedSeparator className="my-4" />
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="workspace-section scale-in w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <GithubIcon className="size-5 mr-2 text-primary" />
            <CardTitle className="workspace-section-title">GitHub Profile</CardTitle>
          </div>
        </CardHeader>
        <DottedSeparator className="my-4" />
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <GithubIcon className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">{error}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/standalone/github-integration">
                <GithubIcon className="size-4 mr-2" /> Connect GitHub Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card className="workspace-section scale-in w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GithubIcon className="size-5 mr-2 text-primary" />
            <CardTitle className="workspace-section-title">GitHub Profile</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={profile.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="size-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </CardHeader>
      <DottedSeparator className="my-4" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-full border">
            <AvatarImage src={profile.avatar_url} alt={profile.name || profile.login} />
            <AvatarFallback>{profile.login.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{profile.name || profile.login}</h3>
            <p className="text-sm text-muted-foreground">@{profile.login}</p>
            {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Repositories</p>
            <p className="text-xl font-semibold">{profile.public_repos}</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Followers</p>
            <p className="text-xl font-semibold">{profile.followers}</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Following</p>
            <p className="text-xl font-semibold">{profile.following}</p>
          </div>
        </div>
        
        {repositories.length > 0 && (
          <>
            <div>
              <h3 className="text-md font-semibold mb-3">Recent Repositories</h3>
              <div className="space-y-3">
                {repositories.map((repo) => (
                  <div key={repo.id} className="p-3 border rounded-md hover:bg-muted transition-colors">
                    <div className="flex justify-between items-start">
                      <Link 
                        href={`/github-integration/repository?owner=${profile.login}&repo=${repo.name}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {repo.name}
                      </Link>
                      <div className="flex items-center text-muted-foreground">
                        <StarIcon className="size-3.5 mr-1" /> 
                        <span className="text-xs">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
                    )}
                    <div className="flex items-center mt-2">
                      {repo.language && (
                        <Badge variant="outline" className="text-xs mr-2">
                          {repo.language}
                        </Badge>
                      )}
                      {repo.fork && (
                        <Badge variant="secondary" className="text-xs">
                          <GitBranchIcon className="size-3 mr-1" /> Fork
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/standalone/github-integration" className="text-sm">
            <GithubIcon className="size-4 mr-2" />
            Manage GitHub Connection
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};