import type { NextConfig } from "next";

// GITHUB_PAGES=1: xuất site tĩnh vào out/ cho GitHub Pages (repo nguyenxuanhoa493/thi-ai-vn → /thi-ai-vn)
const pages = process.env.GITHUB_PAGES === "1";
const basePath = pages ? "/thi-ai-vn" : "";

const nextConfig: NextConfig = {
  ...(pages && { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  cacheComponents: !pages, // PPR không chạy được ở chế độ export
  partialPrefetching: !pages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
