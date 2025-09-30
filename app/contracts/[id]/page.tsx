import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContractDetail } from "@/components/contract-detail";

export default async function ContractPage({
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
      <ContractDetail contractId={id} />
    </div>
  );
}
