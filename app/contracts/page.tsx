import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContractsList } from "@/components/contracts-list";
import { UniversalHeader } from "@/components/universal-header";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <>
      <UniversalHeader 
        title="Contracts" 
        subtitle="Manage your smart contracts and agreements"
        showNavigation={false}
      />
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="w-full">
          <ContractsList />
        </div>
      </div>
    </>
  );
}
