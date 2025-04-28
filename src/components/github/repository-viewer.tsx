"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { getRepositoryContents, getRepositoryBranches } from "@/features/auth/api/github-auth";
import { ArrowLeftIcon, BookIcon, CodeIcon, FolderIcon, FileIcon, GitBranchIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import path from "path";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { get } from "http";
import { getCurrent } from "@/features/auth/queries";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  html_url: string;
  download_url: string | null;
  content?: string;
  encoding?: string;
  size: number;
}

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export function RepositoryViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner") || "";
  const repo = searchParams.get("repo") || "";
  const filePath = searchParams.get("path") || "";
  const branch = searchParams.get("branch") || "main";
  
  const [contents, setContents] = useState<FileItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState(branch);
  
  // Parse the path into breadcrumb segments
  const pathSegments = filePath ? filePath.split('/').filter(Boolean) : [];
  
  useEffect(() => {
    if (!owner || !repo) {
      setError("Repository information is missing");
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch repository contents for the specified path
        const contentsData = await getRepositoryContents(owner, repo, filePath);
        // If we get a single file (not an array), wrap it in an array
        setContents(Array.isArray(contentsData) ? contentsData : [contentsData]);
        
        // Fetch repository branches
        const branchesData = await getRepositoryBranches(owner, repo);
        setBranches(branchesData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching repository data:", err);
        setError(err instanceof Error ? err.message : "Failed to load repository data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [owner, repo, filePath, currentBranch]);
  
  const handleBranchChange = (value: string) => {
    setCurrentBranch(value);
    // Navigate to the same path but with the new branch
    router.push(`/github-integration/repository?owner=${owner}&repo=${repo}&path=${filePath}&branch=${value}`);
  };
  
  const navigateToPath = (newPath: string) => {
    router.push(`/github-integration/repository?owner=${owner}&repo=${repo}&path=${newPath}&branch=${currentBranch}`);
  };
  
  const getParentPath = () => {
    if (!filePath) return "";
    const parentPath = path.dirname(filePath);
    return parentPath === "." ? "" : parentPath;
  };
  
  const handleGoBack = () => {
    if (filePath) {
      navigateToPath(getParentPath());
    } else {
      router.push("http://localhost:3000");
    }
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case "dir":
        return <FolderIcon className="size-5 text-blue-500" />;
      case "file":
        return <FileIcon className="size-5 text-gray-500" />;
      default:
        return <CodeIcon className="size-5 text-gray-500" />;
    }
  };
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (error) {
    return <PageError message={error} />;
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeftIcon className="size-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-xl">
              {owner}/{repo}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <GitBranchIcon className="size-4 text-muted-foreground" />
            <Select value={currentBranch} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild variant="outline" size="sm">
              <Link 
                href={`https://github.com/${owner}/${repo}${filePath ? `/tree/${currentBranch}/${filePath}` : ''}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-4 mr-2" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <DottedSeparator className="my-2" />
        
        <CardContent>
          {/* Breadcrumb navigation */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateToPath("")}>
                  <BookIcon className="size-4 mr-1" />
                  <span>Root</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {pathSegments.map((segment, index) => {
                const segmentPath = pathSegments.slice(0, index + 1).join('/');
                return (
                  <React.Fragment key={segmentPath}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={() => navigateToPath(segmentPath)}>
                        {segment}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Repository contents listing */}
          <div className="border rounded-md">
            {contents.length > 0 ? (
              <div className="divide-y">
                {/* Sort to show directories first, then files */}
                {contents
                  .sort((a, b) => {
                    // If types are different, directories come first
                    if (a.type !== b.type) {
                      return a.type === "dir" ? -1 : 1;
                    }
                    // Otherwise sort alphabetically
                    return a.name.localeCompare(b.name);
                  })
                  .map((item) => (
                    <div 
                      key={item.path} 
                      className="p-3 hover:bg-muted cursor-pointer flex items-center"
                      onClick={() => {
                        if (item.type === "dir") {
                          navigateToPath(item.path);
                        } else if (item.type === "file") {
                          window.open(item.html_url, "_blank");
                        }
                      }}
                    >
                      <div className="mr-3">
                        {getFileIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        {item.type === "file" && (
                          <div className="text-xs text-muted-foreground">
                            {(item.size / 1024).toFixed(2)} KB
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">This repository is empty</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}