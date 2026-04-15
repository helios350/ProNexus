import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileSpreadsheet, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Trash2, Download, ArrowLeft, Copy, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CsvUploadModalProps {
  batchId: string;
  batchName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedStudent {
  name: string;
  email: string;
  rollNo: string;
  contact: string;
  errors: string[];
}

interface ResultRow {
  email: string;
  name: string;
  rollNo: string;
  status: 'success' | 'error';
  tempPassword?: string;
  error?: string;
}

type ModalState = 'upload' | 'preview' | 'loading' | 'results';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCsvText(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  });
}

function validateStudent(s: ParsedStudent): string[] {
  const errors: string[] = [];
  if (!s.name) errors.push('Name is required');
  if (!s.email) errors.push('Email is required');
  else if (!EMAIL_REGEX.test(s.email)) errors.push('Invalid email format');
  if (!s.rollNo) errors.push('Roll No. is required');
  return errors;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  batchId,
  batchName,
  onClose,
  onSuccess,
}) => {
  const [state, setState] = useState<ModalState>('upload');
  const [students, setStudents] = useState<ParsedStudent[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCsvText(text);
        if (rows.length < 2) {
          setUploadError('CSV must have a header row and at least one data row');
          return;
        }
        const header = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
        const nameIdx = header.findIndex(h => h === 'name' || h === 'fullname' || h === 'studentname');
        const emailIdx = header.findIndex(h => h === 'email' || h === 'emailaddress');
        const rollIdx = header.findIndex(h => h.includes('roll') || h === 'rollno' || h === 'rollnumber');
        const contactIdx = header.findIndex(h => h.includes('contact') || h.includes('phone') || h.includes('mobile'));

        if (nameIdx === -1 || emailIdx === -1 || rollIdx === -1) {
          setUploadError('CSV must have columns: Name, Email, Roll No. (Contact No. is optional)');
          return;
        }

        const parsed: ParsedStudent[] = rows.slice(1).map(row => {
          const student: ParsedStudent = {
            name: (row[nameIdx] || '').trim(),
            email: (row[emailIdx] || '').trim().toLowerCase(),
            rollNo: (row[rollIdx] || '').trim(),
            contact: contactIdx !== -1 ? (row[contactIdx] || '').trim() : '',
            errors: [],
          };
          student.errors = validateStudent(student);
          return student;
        }).filter(s => s.name || s.email || s.rollNo);

        if (parsed.length === 0) {
          setUploadError('No valid student rows found in the CSV');
          return;
        }

        setStudents(parsed);
        setState('preview');
      } catch {
        setUploadError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const removeStudent = (index: number) => {
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validStudents = students.filter(s => s.errors.length === 0);
    if (validStudents.length === 0) return;

    setState('loading');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batch-create-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            students: validStudents.map(s => ({
              name: s.name,
              email: s.email,
              rollNo: s.rollNo,
              contact: s.contact || null,
            })),
            batchId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setResults(data.results || []);
      setSummary(data.summary || { total: 0, success: 0, failed: 0 });
      setState('results');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to create students');
      setState('preview');
    }
  };

  const buildCsvContent = () => {
    const successRows = results.filter(r => r.status === 'success');
    if (successRows.length === 0) return '';
    const header = 'Name,Email,Roll No.,Temporary Password';
    const rows = successRows.map(
      r => `"${r.name}","${r.email}","${r.rollNo}","${r.tempPassword}"`
    );
    return '\uFEFF' + [header, ...rows].join('\r\n');
  };

  const downloadCredentials = async () => {
    const csv = buildCsvContent();
    if (!csv) return;
    const fileName = `${batchName.replace(/\s+/g, '_')}_credentials.csv`;

    // Modern Chrome/Edge — uses native Save dialog
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'CSV File',
            accept: { 'text/csv': ['.csv'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(csv);
        await writable.close();
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return; // user cancelled
      }
    }

    // Fallback for Firefox / older browsers
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  const copyCredentials = () => {
    const successRows = results.filter(r => r.status === 'success');
    if (successRows.length === 0) return;
    const header = 'Name\tEmail\tRoll No.\tTemporary Password';
    const rows = successRows.map(
      r => `${r.name}\t${r.email}\t${r.rollNo}\t${r.tempPassword}`
    );
    const text = [header, ...rows].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const validCount = students.filter(s => s.errors.length === 0).length;
  const errorCount = students.filter(s => s.errors.length > 0).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg ghost-shadow overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low flex-shrink-0">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              {state === 'results' ? 'Import Complete' : 'Import Students from CSV'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Batch: <span className="font-semibold text-on-surface">{batchName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ═══ Upload State ═══ */}
        {state === 'upload' && (
          <div className="p-6 flex flex-col items-center">
            <div
              className={`w-full border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-primary bg-primary-fixed/10'
                  : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet size={40} className="mx-auto text-primary/60 mb-4" />
              <p className="text-sm font-medium text-on-surface mb-1">
                Drag & drop your CSV file here
              </p>
              <p className="text-xs text-on-surface-variant">
                or click to browse
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {uploadError && (
              <div className="mt-4 w-full p-3 bg-error-container text-on-error-container rounded text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                {uploadError}
              </div>
            )}

            <div className="mt-6 w-full p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                Expected CSV Format
              </p>
              <div className="bg-surface-container-highest rounded p-3 overflow-x-auto">
                <code className="text-[11px] font-mono text-on-surface-variant whitespace-pre">
                  Name,Email,Roll No.,Contact No.{'\n'}
                  John Doe,john@college.edu,CS001,9876543210{'\n'}
                  Jane Smith,jane@college.edu,CS002,9876543211
                </code>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2">
                Contact No. is optional. Batch is auto-assigned to <span className="font-semibold">{batchName}</span>.
              </p>
            </div>
          </div>
        )}

        {/* ═══ Preview State ═══ */}
        {state === 'preview' && (
          <div className="flex flex-col min-h-0 flex-1">
            <div className="px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setState('upload'); setStudents([]); setUploadError(null); }}
                  className="p-1.5 rounded hover:bg-surface-container-high transition-colors"
                >
                  <ArrowLeft size={16} className="text-on-surface-variant" />
                </button>
                <div>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {validCount} valid
                  </span>
                  {errorCount > 0 && (
                    <span className="text-xs font-mono text-error ml-3">
                      {errorCount} with errors
                    </span>
                  )}
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mx-6 mb-3 p-3 bg-error-container text-on-error-container rounded text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                {uploadError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_2.5fr_1.5fr_1.5fr_0.5fr] gap-2 px-4 py-2.5 bg-surface-container-low/50 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Roll No.</div>
                  <div>Contact</div>
                  <div></div>
                </div>
                <div className="divide-y divide-outline-variant/8">
                  {students.map((s, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[2fr_2.5fr_1.5fr_1.5fr_0.5fr] gap-2 px-4 py-2.5 items-center text-[12px] ${
                        s.errors.length > 0
                          ? 'bg-error-container/10 border-l-2 border-error'
                          : 'hover:bg-surface-container-low/30'
                      }`}
                    >
                      <div className="text-on-surface truncate">{s.name || <span className="text-error italic">Missing</span>}</div>
                      <div className="text-on-surface-variant truncate font-mono text-[11px]">{s.email || <span className="text-error italic">Missing</span>}</div>
                      <div className="text-on-surface-variant font-mono text-[11px]">{s.rollNo || <span className="text-error italic">Missing</span>}</div>
                      <div className="text-on-surface-variant font-mono text-[11px]">{s.contact || '—'}</div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeStudent(i)}
                          className="p-1 text-on-surface-variant/40 hover:text-error hover:bg-error-container/30 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {s.errors.length > 0 && (
                        <div className="col-span-5 text-[10px] text-error mt-0.5 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          {s.errors.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center flex-shrink-0">
              <p className="text-[10px] font-mono text-on-surface-variant">
                {errorCount > 0 ? `${errorCount} row(s) with errors will be skipped` : `${validCount} student(s) ready to import`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={validCount === 0}
                  onClick={handleSubmit}
                  className="px-6 py-2 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload size={14} />
                  Import {validCount} Student{validCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Loading State ═══ */}
        {state === 'loading' && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-on-surface-variant font-mono">
              Creating {validCount} student account{validCount !== 1 ? 's' : ''}...
            </p>
            <p className="text-[10px] text-outline">This may take a moment for large batches</p>
          </div>
        )}

        {/* ═══ Results State ═══ */}
        {state === 'results' && (
          <div className="flex flex-col min-h-0 flex-1">
            {/* Summary Cards */}
            <div className="px-6 pt-5 pb-3 grid grid-cols-3 gap-3 flex-shrink-0">
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-on-surface">{summary.total}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Total</p>
              </div>
              <div className="bg-primary-fixed/20 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} />{summary.success}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Created</p>
              </div>
              {summary.failed > 0 && (
                <div className="bg-error-container/20 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-error flex items-center justify-center gap-1">
                    <XCircle size={16} />{summary.failed}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Failed</p>
                </div>
              )}
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
                <div className="grid grid-cols-[2fr_2.5fr_1.5fr_2fr_0.8fr] gap-2 px-4 py-2.5 bg-surface-container-low/50 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Roll No.</div>
                  <div>Temp Password</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-outline-variant/8">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[2fr_2.5fr_1.5fr_2fr_0.8fr] gap-2 px-4 py-2.5 items-center text-[12px] ${
                        r.status === 'error' ? 'bg-error-container/5' : ''
                      }`}
                    >
                      <div className="text-on-surface truncate">{r.name}</div>
                      <div className="text-on-surface-variant truncate font-mono text-[11px]">{r.email}</div>
                      <div className="text-on-surface-variant font-mono text-[11px]">{r.rollNo}</div>
                      <div className="font-mono text-[11px]">
                        {r.status === 'success' ? (
                          <span className="text-primary font-semibold">{r.tempPassword}</span>
                        ) : (
                          <span className="text-error text-[10px]">{r.error}</span>
                        )}
                      </div>
                      <div>
                        {r.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary-fixed/30 text-primary text-[9px] font-bold uppercase tracking-wider rounded">
                            <CheckCircle2 size={10} />OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-error-container/30 text-error text-[9px] font-bold uppercase tracking-wider rounded">
                            <XCircle size={10} />Fail
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center flex-shrink-0">
              {summary.success > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCredentials}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary-fixed/20 hover:bg-primary-fixed/30 rounded transition-colors"
                  >
                    <Download size={14} />
                    Download CSV
                  </button>
                  <button
                    onClick={copyCredentials}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${
                      copied
                        ? 'text-primary bg-primary-fixed/30'
                        : 'text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => { if (summary.success > 0) onSuccess(); onClose(); }}
                  className="px-6 py-2 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
