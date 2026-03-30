export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5f5ec] px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-[#4b625a] rounded-full opacity-80" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[45%] h-[60%] bg-[#4b625a] rounded-full opacity-60" />
      
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
