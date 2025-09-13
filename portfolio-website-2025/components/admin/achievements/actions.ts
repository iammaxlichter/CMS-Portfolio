// components/admin/achievements/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Pos = { id: string; position: number };

export async function reorderAchievements(positions: Pos[]) {
  const supabase = await createClient();

  // Optional: ensure only admins can reorder
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("No user found");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    console.error("User is not admin");
    return;
  }

  // Persist each new position
  try {
    for (const p of positions) {
      const { error } = await supabase
        .from("contact_achievements")
        .update({ position: p.position })
        .eq("id", p.id);
      
      if (error) {
        console.error(`Error updating position for ${p.id}:`, error);
        return;
      }
    }

    console.log("Successfully updated positions:", positions);
    
    // Revalidate paths
    revalidatePath("/admin/achievements");
    revalidatePath("/contact");
  } catch (error) {
    console.error("Error in reorderAchievements:", error);
  }
}