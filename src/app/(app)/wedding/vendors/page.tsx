import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddVendorButton, EditVendorButton } from "./vendor-form-dialog";

export default async function VendorsPage() {
  const vendors = await db.vendor.findMany({ orderBy: { vendorType: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground text-sm">{vendors.length} vendors</p>
        </div>
        <AddVendorButton />
      </div>

      <div className="space-y-2">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{vendor.name}</CardTitle>
                <div className="flex shrink-0 items-center gap-1">
                  {vendor.officialChoice && <Badge>Booked</Badge>}
                  {vendor.favorite && !vendor.officialChoice && (
                    <Badge variant="secondary">Favorite</Badge>
                  )}
                  <EditVendorButton vendor={vendor} />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">{vendor.vendorType}</p>
            </CardHeader>
            <CardContent className="text-sm">
              {vendor.events.length > 0 && (
                <p className="text-muted-foreground text-xs">{vendor.events.join(", ")}</p>
              )}
              {vendor.packageDetails && <p className="mt-1">{vendor.packageDetails}</p>}
              {(vendor.phone || vendor.email || vendor.website) && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {[vendor.phone, vendor.email, vendor.website].filter(Boolean).join(" · ")}
                </p>
              )}
              {vendor.notes && <p className="text-muted-foreground mt-1 text-xs italic">{vendor.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
