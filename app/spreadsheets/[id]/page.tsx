import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SpreadsheetEditor } from "@/components/spreadsheet-editor";

export default async function SpreadsheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { id } = await params;

  return (
    <div className="flex-1 w-full flex flex-col">
      <SpreadsheetEditor spreadsheetId={id} />
    </div>
  );
}
