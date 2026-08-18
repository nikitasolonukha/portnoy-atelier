"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, UploadCloud, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Button, ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";
import type { FabricImportResult } from "@/application/import/execute-import";
import { applyColumnMapping, importFields, suggestColumnMapping, type ColumnMapping, type ImportField } from "@/lib/import-workflow";
import { requestData } from "@/lib/http-client";
import { fabricInputSchema } from "@/schemas/fabric";
import type { Fabric } from "@/types/domain";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";
const fieldLabels: Record<ImportField, string> = {
  article: "Артикул", name: "Название", manufacturer: "Производитель", collection: "Коллекция",
  composition: "Состав", mainColor: "Основной цвет", pattern: "Рисунок", weightGsm: "Плотность, г/м²",
  widthCm: "Ширина, см", pricePerMeter: "Цена за метр", currency: "Валюта", description: "Описание",
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
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
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
        if (current) { const saved = await updateFabric(current.id, parsed.data); existing.set(article, saved); updated += 1; continue; }
        const now = new Date().toISOString();
        const fabric: Fabric = {
          ...parsed.data, weightGsm: parsed.data.weightGsm ?? 0, widthCm: parsed.data.widthCm ?? 0,
          pricePerMeter: parsed.data.pricePerMeter ?? 0, id: crypto.randomUUID(), isActive: true,
          swatch: "charcoal", createdAt: now, updatedAt: now,
        };
        const saved = await addFabric(fabric); existing.set(article, saved); created += 1;
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

  return <div className="space-y-8">
    <PageHeading eyebrow="Массовое добавление" title="Импорт тканей" description="XLSX, XLS или CSV: сопоставьте колонки, проверьте строки и только затем запустите импорт." actions={<ButtonLink href="/fabrics" variant="secondary"><ArrowLeft size={17} /> Каталог</ButtonLink>} />
    {!rawRows.length ? <section className="surface grid min-h-[360px] place-items-center p-8 text-center"><div><FileSpreadsheet className="mx-auto mb-5 text-[#7a2635]" size={42} /><h2 className="font-display text-3xl font-normal">Выберите таблицу</h2><p className="muted mx-auto mt-3 max-w-md text-sm leading-6">Обязательные данные: артикул и название. Исходный файл не изменяется.</p><Button className="mt-6" onClick={() => inputRef.current?.click()}><UploadCloud size={18} /> Выбрать файл</Button><input ref={inputRef} className="sr-only" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => void readFile(event.target.files?.[0])} /></div></section> : <>
      <section className="surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="muted text-xs">Файл</p><p className="mt-1 font-bold">{filename} · {rawRows.length} строк</p></div><Button variant="secondary" onClick={reset}>Выбрать другой файл</Button></div></section>
      {phase === "mapping" && <section className="surface p-5"><div className="rule-title"><h2>1. Сопоставление колонок</h2><span className="muted text-xs">Артикул и название обязательны</span></div><div className="mt-5 grid gap-4 md:grid-cols-2">{headers.map((header) => <label key={header} className="grid gap-2 text-sm"><span className="font-bold">{header}</span><select className="input" value={mapping[header] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value as ImportField | "" }))}><option value="">Не импортировать</option>{importFields.map((field) => <option key={field} value={field}>{fieldLabels[field]}</option>)}</select></label>)}</div>{mappingError && <p role="alert" className="mt-4 text-sm text-[#8b2435]">{mappingError}</p>}<div className="mt-5 flex justify-end"><Button disabled={Boolean(mappingError)} onClick={() => setPhase("preview")}>Проверить строки</Button></div></section>}
      {(phase === "preview" || phase === "running") && <><section className="surface p-5"><div className="rule-title"><h2>2. Правило для совпавших артикулов</h2></div><div className="mt-4 flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="radio" name="strategy" checked={strategy === "skip"} onChange={() => setStrategy("skip")} /> Пропустить существующие</label><label className="flex items-center gap-2"><input type="radio" name="strategy" checked={strategy === "update"} onChange={() => setStrategy("update")} /> Обновить существующие</label></div></section><PreviewTable rows={preview} /><div className="flex flex-wrap items-center justify-between gap-3"><Button variant="secondary" onClick={() => setPhase("mapping")} disabled={phase === "running"}>Назад к колонкам</Button><Button onClick={() => void execute()} disabled={phase === "running"}>{phase === "running" ? "Импорт выполняется…" : `Импортировать ${totals.create + totals.update + totals.skip + totals.invalid} строк`}</Button></div></>}
      {phase === "result" && result && <section className="surface p-6" aria-live="polite"><div className="flex items-start gap-3">{result.failed ? <XCircle className="text-[#8b2435]" /> : <CheckCircle2 className="text-[#34523e]" />}<div><h2 className="font-display text-3xl">{result.partial ? "Импорт завершён частично" : result.failed ? "Импорт завершён с ошибками" : "Импорт завершён"}</h2><p className="muted mt-2 text-sm">Создано: {result.created}. Обновлено: {result.updated}. Пропущено: {result.skipped}. Ошибок: {result.failed}.</p></div></div>{result.errors.length > 0 && <ul className="mt-5 space-y-2 text-sm text-[#8b2435]">{result.errors.slice(0, 50).map((item) => <li key={`${item.row}-${item.article}`}>Строка {item.row}{item.article ? ` (${item.article})` : ""}: {item.message}</li>)}</ul>}<div className="mt-6 flex flex-wrap gap-3"><Button onClick={reset} variant="secondary">Импортировать ещё файл</Button><Link className="button button-primary" href="/fabrics">Открыть каталог</Link></div></section>}
    </>}
    {error && <p role="alert" className="field-error">{error}</p>}
  </div>;
}

function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  return <section><div className="rule-title"><h2>3. Предпросмотр</h2><span className="muted text-xs">Первые 50 строк</span></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#d3ccc0] text-xs uppercase tracking-[.08em] text-[#6d6a63]"><th className="p-3">Строка</th><th className="p-3">Артикул</th><th className="p-3">Название</th><th className="p-3">Результат</th></tr></thead><tbody>{rows.slice(0, 50).map((row) => <tr key={row.row} className="border-b border-[#ded8ce]"><td className="p-3">{row.row}</td><td className="p-3 font-bold">{row.article || "—"}</td><td className="p-3">{row.name || "—"}</td><td className={`p-3 ${row.status === "invalid" ? "text-[#8b2435]" : "text-[#34523e]"}`}>{row.message}</td></tr>)}</tbody></table></div></section>;
}
