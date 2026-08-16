import { getProfiles, getTodayCheckIns, getHistory, getGoals } from "./queries";
import { RelationshipView } from "./relationship-view";

export default async function RelationshipPage() {
  const [profiles, todayCheckIns, history, goals] = await Promise.all([
    getProfiles(),
    getTodayCheckIns(),
    getHistory(),
    getGoals(),
  ]);

  return <RelationshipView profiles={profiles} todayCheckIns={todayCheckIns} history={history} goals={goals} />;
}
