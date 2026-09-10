import ImportUploader from "@/components/admin/import-uploader"
import { IMPORT_COLUMNS } from "@/lib/cms/import-types"

export const metadata = {
  title: "Import Questions | GAAmesquiz Admin",
}

export default function ImportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold text-white">Import Questions</h1>
        <p className="text-sm text-zinc-400">
          Upload a CSV or XLSX file to preview how it maps onto the question schema. This step only parses and
          validates the file — nothing is written to the question library yet.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs font-medium text-zinc-400 mb-2">Recognized columns</p>
        <div className="flex flex-wrap gap-1.5">
          {IMPORT_COLUMNS.map((col) => (
            <code
              key={col}
              className="rounded bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-400"
            >
              {col}
            </code>
          ))}
        </div>
      </div>

      <ImportUploader />
    </div>
  )
}
