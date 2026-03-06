import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { ThemePreferences } from "@/components/theme/theme-preferences";
import { getRuntimeSettings } from "@/services/settingsService";

export default async function SettingsPage() {
  const settings = await getRuntimeSettings();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Runtime configuration view based on .env keys. Secret values are always masked."
      />

      <Card title="Preferences" subtitle="Personalize the console look and feel">
        <ThemePreferences />
      </Card>

      <Card title="Environment Settings" subtitle="Mapped to /api/settings/env read/write in backend implementation">
        <DataTable
          rows={settings}
          columns={[
            { key: "key", title: "Key", render: (row) => <span className="font-mono">{row.key}</span> },
            { key: "value", title: "Value", render: (row) => row.value },
            {
              key: "secret",
              title: "Secret",
              render: (row) => (row.isSecret ? "Yes (masked)" : "No"),
            },
          ]}
        />
      </Card>
    </div>
  );
}
