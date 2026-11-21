import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/format";
import { getPredloga } from "@/lib/templates";
import { getPrilagoditve } from "@/lib/templates/server";
import { createClient } from "@/lib/supabase/server";
import { TemplateEditor } from "../_components/template-editor";

export const metadata = { title: "Uredi predlogo – zDoma" };

/** T-24: edit one template's plan defaults. */
export default function EditTemplatePage({ params }: PageProps<"/nurse/predloge/[templateId]">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Uredi predlogo" back="/nurse/predloge">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/nurse/predloge/[templateId]">, "params">) {
  const { templateId } = await params;
  await requireStaff();
  const p = getPredloga(templateId);
  if (!p) notFound();

  const shranjena = (await getPrilagoditve())[p.id];
  let kdo: string | undefined;
  if (shranjena?.updatedBy) {
    const { data } = await (await createClient())
      .from("staff_directory")
      .select("first_name, last_name")
      .eq("id", shranjena.updatedBy)
      .maybeSingle();
    if (data) kdo = `${data.first_name} ${data.last_name}`;
  }

  return (
    <AppShell title={p.ime} back="/nurse/predloge">
      {shranjena && (
        <p className="text-lg text-muted-foreground">
          Zadnja sprememba: {formatDate(shranjena.updatedAt)} ob {formatTime(shranjena.updatedAt)}
          {kdo && ` · ${kdo}`}
        </p>
      )}
      <TemplateEditor predloga={p} prilagoditev={shranjena?.prilagoditev ?? {}} />
    </AppShell>
  );
}
