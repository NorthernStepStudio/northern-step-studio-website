import BottomTabs from "./_components/BottomTabs";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-6 sm:px-8">
        {children}
      </div>
      <BottomTabs />
    </div>
  );
}
