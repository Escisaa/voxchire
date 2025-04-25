import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter } from "lucide-react";

const navigation = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/voxhire",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/voxhire",
      icon: Linkedin,
    },
  ],
};

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" height={32} width={38} />
              <span className="text-lg font-bold text-primary-100">
                VoxHire
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              AI-powered interview practice for your next career move.
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#14549d] transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-[#14549d] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-[#14549d] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} VoxHire. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
