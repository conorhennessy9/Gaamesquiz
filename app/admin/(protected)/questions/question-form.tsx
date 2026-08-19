"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ComboboxField } from "@/components/admin/combobox-field"
import { DatePickerField } from "@/components/admin/date-picker-field"
import { createQuestion, updateQuestion } from "@/lib/cms/question-form-actions"
import type { FormOptions, QuestionFormValues, SaveResult } from "@/lib/cms/question-form-types"

const SPORT_OPTIONS = [
  { value: "rugby", label: "Rugby" },
  { value: "gaa", label: "GAA" },
]

const GAME_TYPE_OPTIONS = [
  { value: "tenable", label: "Tenable" },
  { value: "against_the_clock", label: "Timer" },
]

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

const EVERGREEN_TYPE_OPTIONS = [
  { value: "true_evergreen", label: "True Evergreen" },
  { value: "semi_evergreen", label: "Semi-Evergreen" },
  { value: "snapshot", label: "Snapshot" },
  { value: "live", label: "Live" },
]

const REVIEW_FREQUENCY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "annual", label: "Annual" },
  { value: "competition_end", label: "Competition End" },
  { value: "monthly", label: "Monthly" },
  { value: "manual", label: "Manual" },
]

const UPDATE_TRIGGER_EXAMPLES = [
  "Champions Cup season completed",
  "Six Nations completed",
  "Annual review",
  "New record",
  "Manual verification",
]

const COOLDOWN_OPTIONS = [
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
]

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "needs_review", label: "Needs Review" },
  { value: "verified", label: "Verified" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
]

interface QuestionFormProps {
  mode: "create" | "edit"
  questionId?: number
  initialValues: QuestionFormValues
  formOptions: FormOptions
}

type PendingNav = { type: "cancel" } | { type: "back" } | null

export default function QuestionForm({ mode, questionId, initialValues, formOptions }: QuestionFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<QuestionFormValues>(initialValues)
  const [errors, setErrors] = useState<SaveResult["fieldErrors"]>({})
  const [topError, setTopError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<"save" | "continue" | null>(null)
  const [pendingNav, setPendingNav] = useState<PendingNav>(null)
  const [currentId, setCurrentId] = useState<number | undefined>(questionId)

  const baselineRef = useRef<QuestionFormValues>(initialValues)

  const isDirty = JSON.stringify(values) !== JSON.stringify(baselineRef.current)

  // Warn on browser tab close / refresh while there are unsaved changes.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  function update<K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleNavigateAway = useCallback(
    (nav: NonNullable<PendingNav>) => {
      if (isDirty) {
        setPendingNav(nav)
        return
      }
      if (nav.type === "cancel" || nav.type === "back") router.push("/admin/questions")
    },
    [isDirty, router],
  )

  function confirmDiscardAndNavigate() {
    setPendingNav(null)
    router.push("/admin/questions")
  }

  async function handleSave(continueEditing: boolean) {
    setTopError(null)
    setSavedMessage(null)
    setIsSaving(continueEditing ? "continue" : "save")

    const result = currentId ? await updateQuestion(currentId, values) : await createQuestion(values)

    setIsSaving(null)

    if (!result.success) {
      setErrors(result.fieldErrors ?? {})
      setTopError(result.error ?? "Something went wrong while saving.")
      return
    }

    baselineRef.current = values
    setErrors({})

    if (!currentId && result.id) {
      setCurrentId(result.id)
    }

    if (continueEditing) {
      setSavedMessage("Saved.")
      if (!currentId && result.id) {
        router.replace(`/admin/questions/${result.id}/edit`)
      }
    } else {
      router.push("/admin/questions")
    }
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => handleNavigateAway({ type: "back" })}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Question Library
      </button>

      <div className="mb-6">
        <h1 className="text-white text-xl font-bold tracking-tight">
          {mode === "create" ? "Add Question" : `Edit Question #${currentId}`}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {mode === "create"
            ? "Create a new rugby or GAA quiz question."
            : "Update the details for this quiz question."}
        </p>
      </div>

      {topError && (
        <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {topError}
        </div>
      )}
      {savedMessage && !topError && (
        <div className="mb-4 rounded-md border border-lime-500/20 bg-lime-500/10 px-3 py-2 text-sm text-lime-300">
          {savedMessage}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave(false)
        }}
        className="space-y-8"
      >
        {/* QUESTION */}
        <Section title="Question">
          <Field label="Question text" required error={errors?.question_text}>
            <Textarea
              value={values.question_text}
              onChange={(e) => update("question_text", e.target.value)}
              placeholder="e.g. Who captained Ireland to the 2018 Grand Slam?"
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 min-h-[100px]"
            />
          </Field>
        </Section>

        {/* CLASSIFICATION */}
        <Section title="Classification">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Sport" required error={errors?.sport}>
              <Select value={values.sport} onValueChange={(v) => update("sport", v as QuestionFormValues["sport"])}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {SPORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Game type" required error={errors?.game_type}>
              <Select
                value={values.game_type}
                onValueChange={(v) => update("game_type", v as QuestionFormValues["game_type"])}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {GAME_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Competition" error={errors?.competition}>
              <ComboboxField
                value={values.competition}
                onChange={(v) => update("competition", v)}
                options={formOptions.competitions}
                placeholder="Select or add a competition..."
              />
            </Field>

            <Field label="Theme" error={errors?.theme}>
              <ComboboxField
                value={values.theme}
                onChange={(v) => update("theme", v)}
                options={formOptions.themes}
                placeholder="Select or add a theme..."
              />
            </Field>

            <Field label="Difficulty" required error={errors?.difficulty}>
              <Select
                value={values.difficulty}
                onValueChange={(v) => update("difficulty", v as QuestionFormValues["difficulty"])}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Evergreen type" error={errors?.evergreen_type}>
              <Select
                value={values.evergreen_type}
                onValueChange={(v) => update("evergreen_type", v as QuestionFormValues["evergreen_type"])}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select evergreen type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {EVERGREEN_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* REVIEW & VERIFICATION */}
        <Section title="Review & verification">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Review frequency" error={errors?.review_frequency}>
              <Select
                value={values.review_frequency}
                onValueChange={(v) => update("review_frequency", v as QuestionFormValues["review_frequency"])}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select review frequency" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {REVIEW_FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Update trigger" error={errors?.update_trigger}>
              <ComboboxField
                value={values.update_trigger}
                onChange={(v) => update("update_trigger", v)}
                options={UPDATE_TRIGGER_EXAMPLES}
                placeholder="e.g. Six Nations completed"
                emptyLabel="Type to add a custom trigger."
              />
            </Field>

            <Field label="Last verified" error={errors?.last_verified_at}>
              <DatePickerField
                value={values.last_verified_at}
                onChange={(v) => update("last_verified_at", v)}
                placeholder="Not verified yet"
              />
            </Field>

            <Field label="Snapshot period" error={errors?.snapshot_period}>
              <Input
                value={values.snapshot_period}
                onChange={(e) => update("snapshot_period", e.target.value)}
                placeholder="e.g. End of 2026/27 Champions Cup season"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
              />
            </Field>
          </div>

          <Field label="Notes" error={errors?.notes}>
            <Textarea
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Internal notes for editors..."
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 min-h-[80px]"
            />
          </Field>

          <Field label="Cooldown" error={errors?.cooldown_years}>
            <Select
              value={values.cooldown_years}
              onValueChange={(v) => update("cooldown_years", v as QuestionFormValues["cooldown_years"])}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white sm:w-1/2">
                <SelectValue placeholder="Select cooldown period" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {COOLDOWN_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        {/* SCHEDULING */}
        <Section title="Scheduling">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Scheduled date" error={errors?.scheduled_date}>
              <DatePickerField
                value={values.scheduled_date}
                onChange={(v) => update("scheduled_date", v)}
                placeholder="Not scheduled"
              />
            </Field>

            <Field label="Scheduled position" error={errors?.scheduled_position}>
              <Input
                type="number"
                min={1}
                step={1}
                value={values.scheduled_position}
                onChange={(e) => update("scheduled_position", e.target.value)}
                placeholder="e.g. 1"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
              />
            </Field>
          </div>
        </Section>

        {/* STATUS */}
        <Section title="Status">
          <Field label="Status" required error={errors?.status}>
            <Select value={values.status} onValueChange={(v) => update("status", v as QuestionFormValues["status"])}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white sm:w-1/2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
          <Button type="submit" disabled={isSaving !== null} className="bg-lime-500 text-black hover:bg-lime-400">
            {isSaving === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving !== null}
            onClick={() => handleSave(true)}
            className="bg-zinc-800 text-white hover:bg-zinc-700"
          >
            {isSaving === "continue" && <Loader2 className="h-4 w-4 animate-spin" />}
            Save and Continue Editing
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving !== null}
            onClick={() => handleNavigateAway({ type: "cancel" })}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>
      </form>

      <AlertDialog open={pendingNav !== null} onOpenChange={(open: boolean) => !open && setPendingNav(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You have unsaved changes to this question. Leaving now will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardAndNavigate} className="bg-red-600 text-white hover:bg-red-700">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-zinc-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
