import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SpreadsheetList } from "@/components/spreadsheet-list";
import { UniversalHeader } from "@/components/universal-header";

export default async function SpreadsheetsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <>
      <UniversalHeader 
        title="My Spreadsheets" 
        subtitle="Create and manage your intelligent spreadsheets"
        showNavigation={false}
      />
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="w-full">
          <SpreadsheetList />
        </div>
      </div>
    </>
  );
}
