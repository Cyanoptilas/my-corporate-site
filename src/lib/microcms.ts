import { createClient, type MicroCMSQueries } from "microcms-js-sdk";

const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || (typeof process !== "undefined" && process.env.MICROCMS_SERVICE_DOMAIN) || "YOUR_DOMAIN",
  apiKey: import.meta.env.MICROCMS_API_KEY || (typeof process !== "undefined" && process.env.MICROCMS_API_KEY) || "YOUR_API_KEY",
});

export type News = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  category?: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
  };
  eyecatch?: {
    url: string;
    height: number;
    width: number;
  };
};

export type NewsResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: News[];
};

// API: Get List of News
export const getNewsList = async (queries?: MicroCMSQueries) => {
  try {
    return await client.get<NewsResponse>({
      endpoint: "news",
      queries,
    });
  } catch (error) {
    console.error("Failed to fetch news list:", error);
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
};

// API: Get Single News Detail
export const getNewsDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  try {
    return await client.getListDetail<News>({
      endpoint: "news",
      contentId,
      queries,
    });
  } catch (error) {
    console.error(`Failed to fetch news detail for ${contentId}:`, error);
    return null;
  }
};
