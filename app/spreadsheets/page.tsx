import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SpreadsheetList } from "@/components/spreadsheet-list";

export default async function SpreadsheetsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Spreadsheets</h1>
        </div>
        <SpreadsheetList />
      </div>
    </div>
  );
}
