import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminHeading } from "@/components/admin/ui";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateShort } from "@/lib/format";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin/dashboard");

  const settings = await getSettings();

  return (
    <>
      <AdminHeading
        title="Configurações"
        description="Chaves de API, dados institucionais e medição."
      />
      <SettingsForm
        settings={{
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          clientLogoUrl: settings.clientLogoUrl,
          weatherCity: settings.weatherCity,
          weatherLat: settings.weatherLat != null ? String(settings.weatherLat) : "",
          weatherLon: settings.weatherLon != null ? String(settings.weatherLon) : "",
          currencyApiProvider: settings.currencyApiProvider,
          cubValue: settings.cubValue ? String(settings.cubValue) : "",
          cubReference: settings.cubReference,
          cubUpdatedAt: settings.cubUpdatedAt ? formatDateShort(settings.cubUpdatedAt) : null,
          cubSource: settings.cubSource,
          cubAutoUpdate: settings.cubAutoUpdate,
          gtmContainerId: settings.gtmContainerId,
          whatsappNumber: settings.whatsappNumber,
          whatsappMessage: settings.whatsappMessage,
          instagramUrl: settings.instagramUrl,
          facebookUrl: settings.facebookUrl,
          youtubeUrl: settings.youtubeUrl,
          contactPhone: settings.contactPhone,
          contactEmail: settings.contactEmail,
          contactAddress: settings.contactAddress,
        }}
      />
    </>
  );
}
