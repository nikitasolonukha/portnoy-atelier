"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, UploadCloud, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";
import type { FabricImportResult } from "@/application/import/execute-import";
import { applyColumnMapping, importFields, suggestColumnMapping, type ColumnMapping, type ImportField } from "@/lib/import-workflow";
import { buildImportedFabric, photoAssetsFromUrl, swatchForColor } from "@/lib/fabric-from-import";
import { requestData } from "@/lib/http-client";
import { fabricInputSchema, fabricPatchSchema } from "@/schemas/fabric";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";
const fieldLabels: Record<ImportField, string> = {
  article: "Артикул", name: "Название", manufacturer: "Производитель", collection: "Коллекция",
  composition: "Состав", mainColor: "Основной цвет", pattern: "Рисунок", weightGsm: "Плотность, г/м²",
  widthCm: "Ширина, см", pricePerMeter: "Цена за метр", currency: "Валюта", description: "Описание", imageUrl: "Фото (https URL)",
};

type Phase = "mapping" | "preview" | "running" | "result";
type PreviewRow = { row: number; article: string; name: string; status: "create" | "update" | "skip" | "invalid"; message: string };

export function ImportWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const fabrics = useWorkspace((state) => state.fabrics);
  const addFabric = useWorkspace((state) => state.addFabric);
  const updateFabric = useWorkspace((state) => state.updateFabric);
  const hydrate = useWorkspace((state) => state.hydrate);
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [strategy, setStrategy] = useState<"update" | "skip">("skip");
  const [phase, setPhase] = useState<Phase>("mapping");
  const [result, setResult] = useState<FabricImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mappedRows = useMemo(() => applyColumnMapping(rawRows, mapping), [rawRows, mapping]);
  const mappingError = useMemo(() => {
    const selected = Object.values(mapping).filter(Boolean);
    if (!selected.includes("article") || !selected.includes("name")) return "Сопоставьте обязательные поля «Артикул» и «Название».";
    if (new Set(selected).size !== selected.length) return "Каждое поле каталога можно сопоставить только с одной колонкой.";
    return null;
  }, [mapping]);
  const preview = useMemo<PreviewRow[]>(() => {
    const existing = new Set(fabrics.map((fabric) => fabric.article.toLocaleUpperCase("ru")));
    const seen = new Set<string>();
    return mappedRows.map((raw, index) => {
      const parsed = fabricInputSchema.safeParse(raw);
      const fallback = { row: index + 2, article: String(raw.article ?? ""), name: String(raw.name ?? "") };
      if (!parsed.success) return { ...fallback, status: "invalid", message: [...new Set(parsed.error.issues.map((issue) => issue.message))].join(", ") };
      const article = parsed.data.article.toLocaleUpperCase("ru");
      if (seen.has(article)) return { row: index + 2, article, name: parsed.data.name, status: "invalid", message: "Артикул повторяется в файле" };
      seen.add(article);
      if (existing.has(article)) return { row: index + 2, article, name: parsed.data.name, status: strategy, message: strategy === "update" ? "Будет обновлена" : "Будет пропущена" };
      return { row: index + 2, article, name: parsed.data.name, status: "create", message: "Будет создана" };
    });
  }, [fabrics, mappedRows, strategy]);

  async function readFile(file?: File) {
    if (!file) return;
    setError(null); setResult(null); setFilename(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const isCsv = /\.csv$/i.test(file.name);
      const workbook = isCsv
        ? XLSX.read(new TextDecoder("utf-8").decode(buffer), { type: "string" })
        : XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
      if (!sheet) throw new Error("В файле нет листов с данными");
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
      const nextHeaders = (matrix[0] ?? []).map((value, index) => String(value).trim() || `Колонка ${index + 1}`);
      if (!nextHeaders.length || matrix.length < 2) throw new Error("В файле нет строк для импорта");
      if (new Set(nextHeaders).size !== nextHeaders.length) throw new Error("Названия колонок в файле должны быть уникальными");
      const nextRows = matrix.slice(1).filter((row) => row.some((value) => String(value).trim())).map((row) => Object.fromEntries(nextHeaders.map((header, index) => [header, row[index] ?? ""])));
      if (!nextRows.length) throw new Error("В файле нет заполненных строк");
      setHeaders(nextHeaders); setRawRows(nextRows); setMapping(suggestColumnMapping(nextHeaders)); setPhase("mapping");
    } catch (cause) {
      setHeaders([]); setRawRows([]); setMapping({}); setError(cause instanceof Error ? cause.message : "Не удалось прочитать файл");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function reset() {
    setFilename(""); setHeaders([]); setRawRows([]); setMapping({}); setResult(null); setError(null); setPhase("mapping");
  }

  async function executeDemo(): Promise<FabricImportResult> {
    let created = 0; let updated = 0; let skipped = 0; let failed = 0;
    const errors: FabricImportResult["errors"] = [];
    const existing = new Map(fabrics.map((fabric) => [fabric.article.toLocaleUpperCase("ru"), fabric]));
    const seen = new Set<string>();
    for (const [index, raw] of mappedRows.entries()) {
      const parsed = fabricInputSchema.safeParse(raw);
      if (!parsed.success) { failed += 1; errors.push({ row: index + 2, article: String(raw.article ?? ""), message: [...new Set(parsed.error.issues.map((issue) => issue.message))].join(", ") }); continue; }
      const article = parsed.data.article.toLocaleUpperCase("ru");
      if (seen.has(article)) { failed += 1; errors.push({ row: index + 2, article, message: "Артикул повторяется в файле" }); continue; }
      seen.add(article);
      const current = existing.get(article);
      try {
        if (current && strategy === "skip") { skipped += 1; continue; }
        if (current) {
          const { imageUrl: _ignored, ...patch } = fabricPatchSchema.parse(raw);
          const assets = photoAssetsFromUrl(parsed.data.imageUrl);
          const saved = await updateFabric(current.id, {
            ...patch,
            ...(assets ? { assets, swatch: swatchForColor(parsed.data.mainColor || current.mainColor) } : {}),
          });
          existing.set(article, saved);
          updated += 1;
          continue;
        }
        const fabric = buildImportedFabric(parsed.data);
        const saved = await addFabric(fabric);
        existing.set(article, saved);
        created += 1;
      } catch (cause) { failed += 1; errors.push({ row: index + 2, article, message: cause instanceof Error ? cause.message : "Не удалось импортировать строку" }); }
    }
    return { created, updated, skipped, failed, partial: failed > 0 && created + updated + skipped > 0, errors };
  }

  async function execute() {
    if (mappingError || phase === "running") return;
    setPhase("running"); setError(null);
    try {
      const next = usesSupabase
        ? await requestData<FabricImportResult>("/api/v1/fabric-imports", { method: "POST", body: JSON.stringify({ filename, strategy, rows: mappedRows }) })
        : await executeDemo();
      if (usesSupabase) await hydrate({ background: true });
      setResult(next); setPhase("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось выполнить импорт"); setPhase("preview");
    }
  }

  const totals = preview.reduce((acc, item) => ({ ...acc, [item.status]: acc[item.status] + 1 }), { create: 0, update: 0, skip: 0, invalid: 0 });

  const stepIndex = !rawRows.length ? 0 : phase === "mapping" ? 1 : phase === "preview" || phase === "running" ? 2 : 3;

  return <div className="space-y-8">
    <header className="import-hero flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="micro-label">Bulk material import</p>
        <h1 className="page-title mt-3">Импорт тканей</h1>
        <p className="mt-3 max-w-xl text-sm muted">XLSX, XLS или CSV — сопоставление, проверка, импорт. Колонку «Фото» замапьте на https URL изображения — на проде фото скачается в Storage.</p>
      </div>
      <ButtonLink href="/fabrics" variant="secondary" className="dashboard-hero__cta">Каталог</ButtonLink>
    </header>
    <div className="import-steps" aria-label="Этапы импорта">
      {["01 File", "02 Mapping", "03 Review", "04 Import"].map((label, index) => (
        <span key={label} data-active={stepIndex === index} data-done={stepIndex > index}>{label}</span>
      ))}
    </div>
    {!rawRows.length ? <section className="import-dropzone"><div><FileSpreadsheet className="mx-auto mb-5 text-[--accent]" size={42} /><h2 className="section-title">Выберите таблицу</h2><p className="muted mx-auto mt-3 max-w-md text-sm leading-6">Обязательные данные: артикул и название. Исходный файл не изменяется.</p><Button className="mt-6" onClick={() => inputRef.current?.click()}><UploadCloud size={18} /> Выбрать файл</Button><input ref={inputRef} className="sr-only" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => void readFile(event.target.files?.[0])} /></div></section> : <>
      <section className="surface px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="micro-label">Source file</p><p className="mt-1 text-sm font-semibold">{filename} · {rawRows.length} строк</p></div><Button variant="secondary" onClick={reset}>Выбрать другой файл</Button></div></section>
      {phase === "mapping" && <section className="pt-4"><div className="mb-4"><h2 className="section-title">Сопоставление колонок</h2><span className="muted text-xs">Артикул и название обязательны</span></div><div className="grid gap-4 md:grid-cols-2">{headers.map((header) => <label key={header} className="grid gap-2 text-sm"><span className="font-semibold">{header}</span><select className="input" value={mapping[header] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value as ImportField | "" }))}><option value="">Не импортировать</option>{importFields.map((field) => <option key={field} value={field}>{fieldLabels[field]}</option>)}</select></label>)}</div>{mappingError && <p role="alert" className="mt-4 text-sm text-[--error]">{mappingError}</p>}<div className="mt-5 flex justify-end"><Button disabled={Boolean(mappingError)} onClick={() => setPhase("preview")}>Проверить строки</Button></div></section>}
      {(phase === "preview" || phase === "running") && <><section className="surface p-5 md:p-6"><p className="micro-label mb-3">Duplicate strategy</p><h2 className="section-title">Правило для совпавших артикулов</h2><div className="mt-5 flex flex-wrap gap-6 text-sm font-medium"><label className="flex items-center gap-2.5"><input type="radio" name="strategy" checked={strategy === "skip"} onChange={() => setStrategy("skip")} /> Пропустить существующие</label><label className="flex items-center gap-2.5"><input type="radio" name="strategy" checked={strategy === "update"} onChange={() => setStrategy("update")} /> Обновить существующие</label></div></section><PreviewTable rows={preview} /><div className="flex flex-wrap items-center justify-between gap-3 pt-2"><Button variant="secondary" onClick={() => setPhase("mapping")} disabled={phase === "running"}>Назад к колонкам</Button><Button onClick={() => void execute()} disabled={phase === "running"}>{phase === "running" ? "Импорт выполняется…" : `Импортировать ${totals.create + totals.update + totals.skip + totals.invalid} строк`}</Button></div></>}
      {phase === "result" && result && <section className="import-result-panel" aria-live="polite"><div className="flex items-start gap-4">{result.failed ? <XCircle className="text-[--error]" size={28} /> : <CheckCircle2 className="text-[--success]" size={28} />}<div><p className="micro-label">{result.partial ? "Partial import" : result.failed ? "Import errors" : "Import complete"}</p><h2 className="font-display mt-2 text-2xl">{result.partial ? "Импорт завершён частично" : result.failed ? "Импорт завершён с ошибками" : "Импорт завершён"}</h2><p className="muted mt-3 text-sm">Создано: {result.created}. Обновлено: {result.updated}. Пропущено: {result.skipped}. Ошибок: {result.failed}.</p></div></div>{result.errors.length > 0 && <ul className="mt-6 space-y-2 border-t border-[--border] pt-5 text-sm text-[--error]">{result.errors.slice(0, 50).map((item) => <li key={`${item.row}-${item.article}`}>Строка {item.row}{item.article ? ` (${item.article})` : ""}: {item.message}</li>)}</ul>}<div className="mt-8 flex flex-wrap gap-3"><Button onClick={reset} variant="secondary">Импортировать ещё файл</Button><Link className="button button-primary" href="/fabrics">Открыть каталог</Link></div></section>}
    </>}
    {error && <p role="alert" className="field-error">{error}</p>}
  </div>;
}

function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  return <section className="pt-2"><div className="mb-4"><h2 className="section-title">Предпросмотр</h2><span className="muted text-xs">Первые 50 строк</span></div><div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead><tr className="border-b border-[--border] text-[11px] uppercase tracking-[.1em] text-[--text-tertiary]"><th className="px-4 py-3 font-semibold">Строка</th><th className="px-4 py-3 font-semibold">Артикул</th><th className="px-4 py-3 font-semibold">Название</th><th className="px-4 py-3 font-semibold">Результат</th></tr></thead><tbody>{rows.slice(0, 50).map((row) => <tr key={row.row} className="border-b border-[--border] last:border-0"><td className="px-4 py-3 text-[--text-tertiary]">{row.row}</td><td className="px-4 py-3 font-semibold">{row.article || "—"}</td><td className="px-4 py-3">{row.name || "—"}</td><td className={`px-4 py-3 font-medium ${row.status === "invalid" ? "text-[--error]" : "text-[--success]"}`}>{row.message}</td></tr>)}</tbody></table></div></div></section>;
}
