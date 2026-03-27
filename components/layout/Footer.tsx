// components/layout/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import ttlogo from "../../app/utils/tt.jpeg";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Side */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#F8E9ED] ring-1 ring-[#A01C33]/10">
                <Image
                  src={ttlogo}
                  alt="Tech Titans logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-3xl font-black tracking-tight text-[#A01C33]">
                HackSphere
              </div>
            </div>

            <p className="mt-6 max-w-xl text-base leading-9 text-[#6B7280]">
              A premium college hackathon platform proudly organized by Tech Titans
              Technical Club of DPGU — built to celebrate innovation, execution,
              and student leadership.
            </p>

            <p className="mt-6 text-base font-semibold text-[#202225]">
              Organized by Tech Titans Technical Club of DPGU
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              Quick Links
            </h4>

            <div className="mt-6 space-y-2 text-base text-[#6B7280]">
              <Link href="/" className="block hover:text-[#A01C33] transition-colors">
                Home
              </Link>
              <Link href="/about" className="block hover:text-[#A01C33] transition-colors">
                About Hackathon
              </Link>
              <Link
                href="/techtitans"
                className="block hover:text-[#A01C33] transition-colors"
              >
                TechTitans
              </Link>
              <Link
                href="/register"
                className="block hover:text-[#A01C33] transition-colors"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              Connect
            </h4>

            <div className="mt-6 space-y-2 text-base text-[#6B7280]">
              <p>Email Placeholder</p>
              <p>Instagram Placeholder</p>
              <p>LinkedIn Placeholder</p>
              <p>College Campus Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}