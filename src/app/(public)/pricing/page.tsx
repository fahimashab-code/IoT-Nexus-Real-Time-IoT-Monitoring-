import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    description: "Small fleets with essential monitoring.",
    features: ["50 devices", "Basic alerts", "Email support"],
  },
  {
    name: "Growth",
    price: "$99",
    description: "Growing teams with analytics and integrations.",
    features: ["500 devices", "Advanced alerts", "Teams + roles", "Slack integration"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Mission-critical monitoring at scale.",
    features: ["Unlimited devices", "Dedicated SRE", "Custom SLAs", "Private cloud"],
  },
];

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold">Pricing built for IoT teams</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your deployment scale and monitoring needs.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-3xl font-semibold">{tier.price}</p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={routes.auth.register}>Choose plan</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
