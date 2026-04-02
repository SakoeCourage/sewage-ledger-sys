'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Droplets, EyeOff, Eye, FileText, Users, Activity } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { login } from '@/lib/auth';
import { Button, toast, TextInput } from '@/components/ui';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const systemFeatures = [
  {
    description: "A dedicated platform tailored for seamless sewage utility billing and payments management.",
    icon: FileText
  },
  {
    description: "Easily track individual and corporate client registries, automate invoices, and monitor collections.",
    icon: Users
  },
  {
    description: "Built for efficiency, enabling the Ghana Sewage Authority to maintain accurate operational data.",
    icon: Activity
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % systemFeatures.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.username, values.password);
      window.location.href = '/dashboard';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[550px] relative z-20">
      
      {/* Left Decorative Panel */}
      <div className="hidden md:flex flex-col relative w-1/2 bg-[#d1f2e2] overflow-hidden shrink-0">
        
        {/* Wavy Blob Shape */}
        <div className="absolute top-0 right-0 w-[150%] h-[60%] translate-x-[20%] -translate-y-[10%]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-[#4b625a] opacity-90 fill-current">
            <path d="M0,0 L100,0 L100,60 Q80,70 60,40 T0,50 Z" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col p-12 h-full">
            <div className="flex items-center gap-2 mb-20 text-[#21815d]">
               <div className="w-10 h-10 rounded-full bg-[#34c08e]/30 flex items-center justify-center backdrop-blur-sm border border-[#34c08e]/50">
                 <Droplets className="w-5 h-5" />
               </div>
            </div>

            <div className="relative z-10 flex-col items-center text-center mt-auto mb-16">
              <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-tight mb-4">
                Welcome to SewageLedger!
              </h1>
              <div className="h-10 flex items-center justify-center">
                <p className="text-[13px] font-medium text-zinc-600 leading-relaxed max-w-[90%] mx-auto transition-all duration-500 ease-in-out">
                  {systemFeatures[activeSlide].description}
                </p>
              </div>
            </div>

            {/* Floating Icons (Decorative) */}
            <div className="relative h-24 mt-auto right-4">
              {systemFeatures.map((feature, i) => {
                const positions = [
                  "top-4 left-4 w-14 h-14 z-30",
                  "-top-6 left-24 w-12 h-12 z-20",
                  "top-8 left-40 w-16 h-16 z-10"
                ];
                const isActive = i === activeSlide;
                return (
                  <div 
                    key={i} 
                    className={`absolute rounded-full border-4 flex items-center justify-center transition-all duration-500 ${positions[i]} ${isActive ? "border-[var(--sidebar-bg)] bg-[var(--sidebar-bg)] shadow-2xl scale-125 z-40" : "border-[#d1f2e2] bg-white shadow-lg opacity-60 scale-100"}`}
                  >
                    <feature.icon className={`transition-colors duration-500 ${isActive ? "text-[#d1f2e2] w-6 h-6" : "text-[var(--sidebar-bg)] w-1/2 h-1/2"}`} />
                  </div>
                );
              })}
            </div>
            
            {/* Pagination dots decorative */}
            <div className="flex gap-2 justify-center mt-12 pb-4">
              {systemFeatures.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full outline-none transition-all duration-500 ease-in-out ${i === activeSlide ? 'w-5 bg-[#279870]' : 'w-2 bg-[#82c8af] hover:bg-[#5bb193]'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full md:w-1/2 px-14 py-16 flex flex-col items-center bg-white relative">
        <div className="w-full max-w-[320px] flex-1 flex flex-col justify-center">
          
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-extrabold text-zinc-800 tracking-tight">Welcome Back</h2>
            <p className="text-[13px] text-zinc-500 font-medium mt-1">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Username"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.username?.message}
                  placeholder="Enter your username"
                  required
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Password"
                  name={field.name}
                  type="password"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.password?.message}
                  placeholder="Enter your password"
                  required
                />
              )}
            />

            <Button
              type="submit"
              variant="primary"
              labelText={isSubmitting ? 'Signing in…' : 'Sign In'}
              className="w-full mt-8 bg-[var(--sidebar-bg)] hover:brightness-90 border-none !h-[52px] !rounded-[14px] !text-[15px] text-white !font-bold tracking-wide shadow-md transition-all"
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </form>

        </div>
      </div>
    </div>
  );
}
