"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Clock } from "lucide-react"

interface RequiredField {
  id: string
  label: string
  status: "pending" | "checked"
  description?: string
  category: string
}

const initialFields: RequiredField[] = [
  {
    id: "location",
    label: "Location",
    status: "checked",
    description: "Dubai, UAE",
    category: "Search Profile",
  },
  {
    id: "property_type",
    label: "Property Type",
    status: "pending",
    description: "Apartment, Villa, Townhouse",
    category: "Search Profile",
  },
  {
    id: "budget",
    label: "Budget",
    status: "pending",
    description: "Max price range",
    category: "Search Profile",
  },
  {
    id: "bedrooms",
    label: "Bedrooms",
    status: "pending",
    description: "Number of bedrooms",
    category: "Lifestyle",
  },
  {
    id: "amenities",
    label: "Amenities",
    status: "pending",
    description: "Pool, Gym, Parking",
    category: "Lifestyle",
  },
]

export default function IntakePage() {
  const [requiredFields] = useState<RequiredField[]>(initialFields)

  const completedCount = requiredFields.filter((field) => field.status === "checked").length
  const totalCount = requiredFields.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  const fieldsByCategory = useMemo(() => {
    return requiredFields.reduce(
      (acc, field) => {
        if (!acc[field.category]) {
          acc[field.category] = []
        }
        acc[field.category].push(field)
        return acc
      },
      {} as Record<string, RequiredField[]>
    )
  }, [requiredFields])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investor Intake</p>
        <h2 className="font-display text-3xl text-foreground">Complete the signal profile</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Fill the last gaps to generate your tailored shortlist and risk-adjusted recommendations.
        </p>
      </div>

      <Card className="bg-card/80 border-border/60">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span className="text-foreground font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-border/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {category}
                </h4>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`rounded-2xl border border-border/40 p-3 transition-all ${
                        field.status === "checked" ? "bg-primary/15" : "bg-background/60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                field.status === "checked" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {field.status === "checked" ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                            </div>
                            <h5 className="font-medium text-sm text-foreground">{field.label}</h5>
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1 ml-8">{field.description}</p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ml-2 ${
                            field.status === "checked"
                              ? "bg-primary/20 text-primary-foreground border-primary/20"
                              : "bg-muted/30 text-muted-foreground border-border/20"
                          }`}
                        >
                          {field.status === "checked" ? "Ready" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            className={`w-full rounded-full ${
              completedCount === totalCount
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            disabled={completedCount < totalCount}
          >
            {completedCount === totalCount ? "Generate shortlist" : `${totalCount - completedCount} details needed`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
