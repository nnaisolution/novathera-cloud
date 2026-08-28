import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ComingSoonViewProps = {
  title: string;
  description?: string;
};

export function ComingSoonView({ title, description }: ComingSoonViewProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">
              {description ??
                "This section is under development and will be available soon."}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
