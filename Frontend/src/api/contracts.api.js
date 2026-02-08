import { supabase } from "./supabaseClient";

export async function createContract({
    title,
    file,
    emails,
    ownerId,
}) {
    // 1. Upload PDF
    const filePath = `${ownerId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Insert contract
    const { data: contract, error: contractError } =
        await supabase
            .from("contracts")
            .insert({
                title,
                owner_id: ownerId,
                file_path: filePath,
            })
            .select()
            .single();

    if (contractError) throw contractError;

    // 3. Insert signees
    const signeeRows = emails.map((email) => ({
        contract_id: contract.id,
        email,
    }));

    const { error: signeeError } = await supabase
        .from("contract_signees")
        .insert(signeeRows);

    if (signeeError) throw signeeError;

    return contract;
}
