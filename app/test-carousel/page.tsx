// app/test-carousel/page.tsx (Next.js 13+), or pages/test-carousel.tsx (Next.js 12)

import SimpleCarousel from "@/components/SimpleCarousel";

export default function TestCarouselPage() {
  // Provide filenames that exist in /public/uploads
  const testImages = ["test-image.jpg", "some-other.jpg"];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Carousel Test</h1>
      <SimpleCarousel imageFilenames={testImages} />
    </div>
  );
}
