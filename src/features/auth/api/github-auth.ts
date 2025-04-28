"use server";

import { cookies } from "next/headers";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

// Function to save and validate GitHub personal access token
export async function saveGithubToken(token: string) {
  try {
    // Validate the token by making a request to GitHub API
    const response = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillSync-App"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Invalid GitHub token");
    }

    // Get user data to confirm token works and to store user information
    const userData = await response.json();
    
    // Store the token in an HTTP-only cookie
    cookies().set("github_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    // Save the token to the user's database record
    try {
      const { databases, account } = await createSessionClient();
      const user = await account.get();
      
      // Find all workspace members associated with this user
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
      );
      
      // Update each member record with the GitHub token
      if (members.documents.length > 0) {
        await Promise.all(
          members.documents.map(async (member) => {
            await databases.updateDocument(
              DATABASE_ID,
              MEMBERS_ID,
              member.$id,
              {
                gitHubToken: token
              }
            );
          })
        );
      }
    } catch (error) {
      console.error("Error saving GitHub token to user database record:", error);
      // Continue even if database update fails - at least we have the cookie
    }

    return {
      success: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url
      }
    };
  } catch (error) {
    console.error("GitHub token validation error:", error);
    throw error;
  }
}

// Function to get user's GitHub profile information
export async function getGithubProfile() {
  try {
    const token = cookies().get("github_token")?.value;
    
    if (!token) {
      throw new Error("GitHub token not found. Please connect your GitHub account first.");
    }
    
    const response = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillSync-App"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub profile");
    }

    return response.json();
  } catch (error) {
    console.error("GitHub profile fetch error:", error);
    throw error;
  }
}

// Function to get user's GitHub repositories
export async function getGithubRepositories() {
  try {
    const token = cookies().get("github_token")?.value;
    
    if (!token) {
      throw new Error("GitHub token not found. Please connect your GitHub account first.");
    }
    
    const response = await fetch("https://api.github.com/user/repos?sort=updated", {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillSync-App"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub repositories");
    }

    return response.json();
  } catch (error) {
    console.error("GitHub repositories fetch error:", error);
    throw error;
  }
}

// Function to get repository contents (files and folders)
export async function getRepositoryContents(owner: string, repo: string, path: string = "") {
  try {
    const token = cookies().get("github_token")?.value;
    
    if (!token) {
      throw new Error("GitHub token not found. Please connect your GitHub account first.");
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillSync-App"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch repository contents");
    }

    return response.json();
  } catch (error) {
    console.error("GitHub repository contents fetch error:", error);
    throw error;
  }
}

// Function to get repository branches
export async function getRepositoryBranches(owner: string, repo: string) {
  try {
    const token = cookies().get("github_token")?.value;
    
    if (!token) {
      throw new Error("GitHub token not found. Please connect your GitHub account first.");
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillSync-App"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch repository branches");
    }

    return response.json();
  } catch (error) {
    console.error("GitHub repository branches fetch error:", error);
    throw error;
  }
}