// File: functions/job-retire/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.32.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
// We still start the server to return a helpful error to callers.
}
const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "", {
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      "x-function": "job-retire"
    }
  }
});
/**
 * Return true if changeTime is at least two workdays (Mon-Fri) before now.
 */ function isOlderThanTwoWorkdays(changeTime) {
  const changeDate = new Date(changeTime);
  const currentDate = new Date();
  // Normalize times to start of day to only count full days to satify rounding down clause
  const temp = new Date(changeDate);
  temp.setHours(0, 0, 0, 0);
  const now = new Date(currentDate);
  now.setHours(0, 0, 0, 0);
  let daysDifference = 0;
  while(temp < now && daysDifference < 3){
    const dow = temp.getDay();
    if (dow !== 0 && dow !== 6) daysDifference++; // checks if temp.getday() is a saturday or a sunday
    temp.setDate(temp.getDate() + 1);
  }
  return daysDifference >= 2;
}
Deno.serve(async (req)=>{
  try {
    // Fetch from Jobs table
    const { data: jobs, error: fetchError } = await supabase.from("Jobs").select("id, open, archivedJob");
    if (fetchError) {
      console.error("Error fetching jobs:", fetchError.message, fetchError);
      return new Response(JSON.stringify({
        error: "Failed to fetch jobs reponse:" + fetchError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const retirePromises = [];
    for (const job of jobs){
      if (!job.open && !job.archivedJob) {
        // Get most recent history tuple on job.id
        const p = (async ()=>{
          const { data: historyData, error: historyError } = await supabase.from("JobsHistory").select("change_time").eq("job_id", job.id).order("change_time", {
            ascending: false
          }) // get most recent first
          .limit(1); //we only need the youngest
          if (historyError) {
            console.error(`Error fetching history for job ${job.id}:`, historyError);
            return {
              jobId: job.id,
              archivedJob: false,
              error: historyError
            };
          }
          const sanity = true;
          if (historyData && historyData.length > 0) {
            const lastChange = historyData[0].change_time;
            if (isOlderThanTwoWorkdays(lastChange)) {
              // Update job to set archivedJob = true
              const { error: updateError } = await supabase.from("Jobs").update({
                archivedJob: true
              }).eq("id", job.id);
              if (updateError) {
                console.error(`Error updating job ${job.id}:`, updateError);
                return {
                  jobId: job.id,
                  archivedJob: false,
                  error: updateError
                };
              } else {
                console.log(`Job ${job.id} marked as archived.`);
                return {
                  jobId: job.id,
                  archivedJob: true
                };
              }
            }
          }
          return {
            jobId: job.id,
            archivedJob: false
          };
        })();
        retirePromises.push(p); // add promise to array ie. waits for all operations to complete
      }
    }
    const results = await Promise.all(retirePromises);
    return new Response(JSON.stringify({
      message: "Checked archived jobs",
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
