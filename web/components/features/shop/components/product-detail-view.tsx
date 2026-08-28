"use client";

import { notFound } from "next/navigation";

import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2PlatformCtaSection } from "@/components/features/home-page-v2/components/home-page-v2-platform-cta-section";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { ProductDetailBuyBox } from "@/components/features/shop/components/product-detail-buy-box";
import { ProductDetailGallery } from "@/components/features/shop/components/product-detail-gallery";
import { ProductRelatedSection } from "@/components/features/shop/components/product-related-section";
import { ShopVoicesBrandSection } from "@/components/features/shop/components/shop-voices-brand-section";
import { useShopProduct } from "@/components/features/shop/hooks/use-shop-products";
import { shopFallbackGallery } from "@/components/features/shop/shop-data";

type ProductDetailViewProps = {
  slug: string;
};

export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const productQuery = useShopProduct(slug);

  if (productQuery.isLoading) {
    return (
      <>
        <main className="flex min-h-screen flex-col bg-[#faf7ee]">
          <HomePageV2ScrollHeader overlayVariant="sticky" />
          <div className="mx-auto w-full max-w-[1600px] px-6 pt-28 pb-16 lg:px-20 lg:pt-[140px]">
            <div className="flex flex-col gap-12 lg:flex-row lg:gap-5">
              <div className="aspect-square min-w-0 flex-1 animate-pulse rounded-[20px] bg-[#edffe3]" />
              <div className="flex w-full flex-col gap-6 lg:max-w-[45%]">
                <div className="h-8 w-40 animate-pulse rounded bg-[#edffe3]" />
                <div className="h-14 w-3/4 animate-pulse rounded bg-[#edffe3]" />
                <div className="h-10 w-32 animate-pulse rounded bg-[#edffe3]" />
                <div className="h-24 w-full animate-pulse rounded bg-[#edffe3]" />
              </div>
            </div>
          </div>
        </main>
        <HomePageV2FooterSection />
      </>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    notFound();
  }

  const product = productQuery.data;
  const images =
    product.images.length > 0 ? product.images : [...shopFallbackGallery];

  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <section className="relative bg-[#faf7ee]">
          <HomePageV2ScrollHeader overlayVariant="sticky" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pt-28 pb-16 lg:px-20 lg:pt-[140px] lg:pb-[100px]">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-5">
              <ProductDetailGallery
                images={images}
                className="min-w-0 flex-1"
              />
              <ProductDetailBuyBox
                product={product}
                className="w-full shrink-0 lg:w-[min(100%,825px)] lg:max-w-[45%]"
              />
            </div>
          </div>
        </section>

        <ProductRelatedSection slug={product.slug} />
        <HomePageV2PlatformCtaSection />
        <ShopVoicesBrandSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
