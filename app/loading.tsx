import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-20">
      <Card className="paper-card w-full max-w-xl p-8">
        <div className="space-y-4">
          <div className="h-4 w-24 rounded-full bg-black/10" />
          <div className="h-8 w-3/4 rounded-full bg-black/10" />
          <div className="h-4 w-full rounded-full bg-black/10" />
          <div className="h-4 w-5/6 rounded-full bg-black/10" />
        </div>
      </Card>
    </div>
  );
}
