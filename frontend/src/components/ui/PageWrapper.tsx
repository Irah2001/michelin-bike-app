export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[url('/images/bg-profile.jpg')] bg-cover bg-center opacity-80" />
      <div className="absolute inset-0 bg-linear-to-b from-[#0B1120]/30 via-[#0B1120]/60 to-[#0B1120]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
