// app/test-page/page.tsx (Next.js 13+), or pages/test-page.tsx (Next.js 12)

export default function TestPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Image from /public/uploads</h1>

      {/* Direct reference to verify the file loads */}
      <img
        src="/uploads/74b3d135-e7b9-4ac4-aacc-bdb16085bd64.png"
        alt="Test from uploads"
        style={{ width: "300px", border: "2px solid #000" }}
      />
    </div>
  );
}
