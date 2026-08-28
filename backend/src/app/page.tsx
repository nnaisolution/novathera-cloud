export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Nova Thera API</h1>
      <p>This service is not a public website. Use the mobile app or authenticated API clients.</p>
      <ul>
        <li>tRPC: /api/trpc</li>
        <li>OTP request: POST /api/auth/otp/request</li>
        <li>OTP verify: POST /api/auth/otp/verify</li>
        <li>Health ingest: POST /api/health/ingest</li>
      </ul>
    </main>
  );
}
