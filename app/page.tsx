import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { CopyButton } from "@/components/copy-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-6xl p-5">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Workflow Plus
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Streamline your data workflows with intelligent spreadsheets and powerful transformations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/spreadsheets">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/transformations">View Transformations</Link>
              </Button>
            </div>
          </section>

          {/* Test Credentials Section */}
          <section className="text-center space-y-6 w-full">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                🔑 Test User Credentials
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Use these credentials to test the application
              </p>
            </div>
            
            <Card className="max-w-sm md:max-w-md mx-auto border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg md:text-xl text-orange-800 dark:text-orange-200">
                  Test Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">Email:</div>
                  <div className="relative">
                    <div className="font-mono text-sm md:text-base bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-700 p-3 pr-10 rounded-lg text-gray-900 dark:text-gray-100 break-all">
                      dtma.cursor@gmail.com
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <CopyButton text="dtma.cursor@gmail.com" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">Password:</div>
                  <div className="relative">
                    <div className="font-mono text-sm md:text-base bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-700 p-3 pr-10 rounded-lg text-gray-900 dark:text-gray-100">
                      123456
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <CopyButton text="123456" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Features Section */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage data workflows efficiently
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Spreadsheets Feature */}
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl">Smart Spreadsheets</CardTitle>
                  <CardDescription className="text-base">
                    Create and manage intelligent spreadsheets with advanced data types and real-time collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Multiple data types (text, number, date, select, checkbox)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Real-time editing and collaboration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Column and row management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Secure data persistence
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/spreadsheets">Explore Spreadsheets</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Transformations Feature */}
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl">Data Transformations</CardTitle>
                  <CardDescription className="text-base">
                    Build and save complex data transformation workflows with visual logic generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Visual logic generator with code output
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Save and reuse transformation templates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Input/output table management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Parameterized transformations
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/transformations">Explore Transformations</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>



          {/* Getting Started Section */}
          <section className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the community and start building powerful data workflows today
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/spreadsheets">Create Your First Spreadsheet</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/logic-generator">Try Logic Generator</Link>
              </Button>
            </div>
          </section>

          
          {!hasEnvVars && (
            <section className="space-y-6">
              <h2 className="font-medium text-xl text-center">Setup Required</h2>
              <ConnectSupabaseSteps />
            </section>
          )}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
