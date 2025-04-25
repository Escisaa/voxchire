// components/landing/Navbar.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onGetStartedClick: () => void;
}

const Navbar = ({ onGetStartedClick }: NavbarProps) => (
  <nav className="fixed top-0 z-50 w-full">
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/0 pointer-events-none" />
    <div className="relative mx-auto flex h-18 max-w-[1200px] bg-stone-950 border border-gray-500  mt-3 rounded-2xl items-center justify-between px-6 lg:px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="logo"
          height={32}
          width={38}
          className="relative z-10"
        />
        <Link
          href="/"
          className="text-lg font-semibold text-white hover:text-primary-100 transition-colors"
        >
          VoxHire
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="#features"
          className="text-[15px] font-medium text-gray-300/90 hover:text-white transition-colors"
        >
          Features
        </Link>
        <Link
          href="#pricing"
          className="text-[15px] font-medium text-gray-300/90 hover:text-white transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="#faq"
          className="text-[15px] font-medium text-gray-300/90 hover:text-white transition-colors"
        >
          FAQ
        </Link>
      </div>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="bg-white text-black hover:bg-white/90 px-6 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={onGetStartedClick}
        >
          Get started for free
        </Button>
      </div>
    </div>
  </nav>
);

export default Navbar;
