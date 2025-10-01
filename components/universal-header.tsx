import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

interface UniversalHeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  className?: string;
}

export function UniversalHeader({ 
  title, 
  subtitle, 
  showNavigation = true, 
  className = "" 
}: UniversalHeaderProps) {
  return (
    <header className={`w-full border-b border-b-foreground/10 ${className}`}>
      {/* Main Navigation Bar */}
      {showNavigation && (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Workflow Plus</Link>
              <Link href={"/spreadsheets"} className="text-blue-600 hover:text-blue-700">
                Spreadsheets
              </Link>
              <Link href={"/contracts"} className="text-blue-600 hover:text-blue-700">
                Contracts
              </Link>
              <Link href={"/transformations"} className="text-blue-600 hover:text-blue-700">
                Transformations
              </Link>
              <Link href={"/logic-generator"} className="text-blue-600 hover:text-blue-700">
                Logic Generator
              </Link>
              <a 
                href="https://pcd-test.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                TCB automation POC
              </a>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
      )}

      {/* Page Title Section */}
      {(title || subtitle) && (
        <div className="w-full flex justify-center bg-white border-b border-gray-200">
          <div className="w-full max-w-5xl px-6 py-6">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
