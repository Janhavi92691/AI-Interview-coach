"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (name.trim().length < 2 || name.trim().length > 100) {
      setErrorMessage("Full name must be between 2 and 100 characters.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "An account with this email already exists.");
      }

      toast.success("Account created successfully!");
      router.push(nextParam);
      router.refresh();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "An account with this email already exists.");
      toast.error(err.message || "An account with this email already exists.");
    }
  };

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-xl">
      <CardHeader className="pb-4 border-b border-[#232C52]">
        <CardTitle className="text-xl font-bold text-white">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Enter your details to register your candidate profile.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-xs font-semibold text-slate-200">
              Full Name
            </Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#0B1020] border-[#232C52] text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-xs font-semibold text-slate-200">
              Email Address
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#0B1020] border-[#232C52] text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-xs font-semibold text-slate-200">
              Password (min 8 characters)
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="bg-[#0B1020] border-[#232C52] text-white pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400 font-medium pt-1">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold py-5 gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Sign Up <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#232C52] text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(nextParam)}`} className="text-[#4F7CFF] hover:underline font-semibold">
            Sign in here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B1020]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              AI Interview Coach
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            Sign up to start practicing AI-powered interviews
          </p>
        </div>

        <Suspense fallback={<div className="text-xs text-slate-400 text-center p-8">Loading sign up...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
