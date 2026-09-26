import { getProfiles, getTodayCheckIns, getHistory, getGoals } from "./queries";
import { RelationshipView } from "./relationship-view";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label, yesNo } from "@/lib/export";

export default async function RelationshipPage() {
  const [profiles, todayCheckIns, history, goals] = await Promise.all([
    getProfiles(),
    getTodayCheckIns(),
    getHistory(),
    getGoals(),
  ]);

  const exportSheets = [
    {
      name: "Check-Ins",
      rows: [...todayCheckIns, ...history].map((c) => ({
        Date: dateOnly(c.date),
        Who: c.profile.name,
        Energy: c.energy,
        Mood: c.mood,
        Need: c.need,
        Want: c.want,
        Verse: c.verse,
      })),
    },
    {
      name: "Goals",
      rows: goals.map((g) => ({
        Goal: g.title,
        Who: g.profile?.name ?? "Shared",
        Period: label(g.period),
        Year: g.year,
        Quarter: g.quarter ? `Q${g.quarter}` : null,
        "Progress %": g.progress,
        Done: yesNo(g.completed),
        Notes: g.notes,
      })),
    },
  ];

  return (
    <RelationshipView
      profiles={profiles}
      todayCheckIns={todayCheckIns}
      history={history}
      goals={goals}
      exportButton={<ExportButton filename="relationship" sheets={exportSheets} />}
    />
  );
}
