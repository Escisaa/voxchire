"use client";

import Image from "next/image";

const CompanyLogos = () => {
  return (
    <div className="w-full bg-black/40 backdrop-blur-sm py-12 mt-[-4rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-wider">
          Backed by leaders of
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          <Image
            src="/covers/amazon.png"
            alt="Amazon"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/covers/adobe.png"
            alt="Adobe"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/covers/facebook.png"
            alt="Facebook"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/covers/spotify.png"
            alt="Spotify"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/covers/pinterest.png"
            alt="Pinterest"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/covers/tiktok.png"
            alt="TikTok"
            width={120}
            height={40}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyLogos;
