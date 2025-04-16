import React from "react";
import { Metadata } from "next";
import { AdminAnalyticsClient } from "./client";

export const metadata: Metadata = {
  title: "Admin Analytics | SkillSync",
  description: "Admin level analytics and insights for your workspace",
};

const AdminAnalyticsPage = () => {
  return <AdminAnalyticsClient />;
};

export default AdminAnalyticsPage;