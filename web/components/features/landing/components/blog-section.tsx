import Link from "next/link";

import { landingAssets } from "@/components/features/landing/assets";
import { BlogPostCard } from "@/components/features/landing/components/blog-post-card";
import { siteNavigation } from "@/components/shared/site-navigation";
import { buttonVariants } from "@/components/ui/button";

const posts = [
  {
    title: "5 Simple Steps for Healthier, Glowing Skin",
    excerpt:
      "Build an effective routine with expert tips for clear and radiant skin.",
    date: "27 Apr 2026",
    image: landingAssets.blog.glowingSkin,
  },
  {
    title: "How to Control Hair Fall Naturally",
    excerpt:
      "Discover simple habits and treatments to reduce hair fall and strengthen roots.",
    date: "27 Apr 2026",
    image: landingAssets.blog.hairFall,
  },
  {
    title: "Understanding Acne: Causes & Effective Treatments",
    excerpt: "Learn what triggers acne and how to treat it the right way.",
    date: "27 Apr 2026",
    image: landingAssets.blog.acne,
  },
  {
    title: "Why Professional Facials Make a Difference",
    excerpt:
      "Explore how expert treatments can improve your skin beyond home care.",
    date: "27 Apr 2026",
    image: landingAssets.blog.facials,
  },
] as const;

export function BlogSection() {
  return (
    <section
      id="blog"
      className="bg-[#f2f2f2] px-6 pt-20 pb-24 md:px-12 lg:px-[160px] lg:pt-20 lg:pb-40"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h2 className="font-display text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
            Recent Blogs
          </h2>
          <p className="text-base leading-normal text-[#222]">
            Expert-backed tips for skincare, hair care, and wellness.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {posts.map((post) => (
            <BlogPostCard
              key={post.title}
              {...post}
              href={siteNavigation.comingSoon}
            />
          ))}
        </div>

        <Link
          href={siteNavigation.comingSoon}
          className={buttonVariants({
            className:
              "h-auto w-[200px] rounded-2xl bg-[#023a40] px-[30px] py-4 text-base font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90",
          })}
        >
          View All blogs
        </Link>
      </div>
    </section>
  );
}
