import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CheckIn = {
  energy: number;
  mood: number;
  need: string | null;
  want: string | null;
  verse: string | null;
};

export function CheckInCard({ name, checkIn }: { name: string; checkIn: CheckIn | null }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checkIn ? (
          <>
            <div className="flex gap-4">
              <Badge variant="secondary">Energy {checkIn.energy}/10</Badge>
              <Badge variant="secondary">Mood {checkIn.mood}/10</Badge>
            </div>
            {checkIn.need && (
              <p className="text-sm">
                <span className="text-muted-foreground">Needs: </span>
                {checkIn.need}
              </p>
            )}
            {checkIn.want && (
              <p className="text-sm">
                <span className="text-muted-foreground">Wants: </span>
                {checkIn.want}
              </p>
            )}
            {checkIn.verse && <p className="text-sm italic">{checkIn.verse}</p>}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Hasn&apos;t checked in yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
