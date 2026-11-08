'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowRight,
  Boxes,
  Users,
  Building2,
  PackageCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportacionTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const ImportacionTab: React.FC<ImportacionTabProps> = ({ restaurantId, restaurantName }) => {
  const [selectedType, setSelectedType] = useState<string>('productos');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    window.open(`/api/import?tipo=${selectedType}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setValidationResult(null);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        setParsedRows(data);
        // Automatically trigger validation
        triggerValidation(data);
      } catch (err: any) {
        alert('Error al leer el archivo Excel/CSV: ' + err.message);
      }
    };
    reader.readAsBinaryString(uploaded);
  };

  const triggerValidation = async (rows: any[]) => {
    if (rows.length === 0) {
      alert('El archivo no contiene filas de datos');
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tipo: selectedType,
          action: 'validate',
          rows,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en validación');

      setValidationResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      alert('No hay filas válidas para importar');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tipo: selectedType,
          action: 'execute',
          rows: validationResult.validRows,
          usuarioNombre: 'Administrador',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al ejecutar importación');

      setImportSuccessMessage(data.message || 'Importación completada con éxito');
      setFile(null);
      setParsedRows([]);
      setValidationResult(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-400" />
            <span>Asistente de Importación Masiva de Datos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Carga catálogos completos de productos, materias primas, proveedores y saldos iniciales de inventario desde Excel o CSV.
          </p>
        </div>

        {/* Step 1: Select Type & Download Template */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            { id: 'productos', label: 'Productos y Menú', icon: PackageCheck },
            { id: 'insumos', label: 'Materias Primas / Insumos', icon: Boxes },
            { id: 'inventario_inicial', label: 'Inventario Inicial', icon: Boxes },
            { id: 'proveedores', label: 'Proveedores', icon: Building2 },
            { id: 'clientes', label: 'Clientes / Comensales', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedType(item.id);
                  setFile(null);
                  setValidationResult(null);
                  setImportSuccessMessage(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                    : 'bg-[#181b26] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-500">Plantilla oficial</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Descargar Plantilla Oficial de {selectedType.toUpperCase()} (.xlsx)</span>
          </button>

          <span className="text-xs text-slate-400">
            Descarga la plantilla, diligénciala respetando los encabezados y súbela abajo.
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-extrabold text-sm text-white">¡Importación Exitosa!</div>
            <div className="text-xs">{importSuccessMessage}</div>
          </div>
        </div>
      )}

      {/* Step 2: Upload Area */}
      <div className="bg-[#12141c] border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <Upload className="w-12 h-12 text-orange-400 mx-auto animate-pulse" />
        <div>
          <h3 className="font-extrabold text-base text-white">
            {file ? file.name : 'Arrastra o selecciona tu archivo Excel (.xlsx) o CSV'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            El sistema analizará cada fila, validará formatos numéricos, códigos únicos y consistencia de datos antes de guardar.
          </p>
        </div>

        <label className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg active:scale-95 transition-all">
          <span>{file ? 'Cambiar Archivo' : 'Seleccionar Archivo en Disco'}</span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Step 3: Validation Summary & Errors Preview */}
      {validating && (
        <div className="py-12 text-center text-slate-400 bg-[#12141c] border border-slate-800 rounded-2xl p-6">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
          <span>Validando estructura y consistencia fila por fila...</span>
        </div>
      )}

      {validationResult && (
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white">
                Resultado de Validación Preliminar
              </h3>
              <p className="text-xs text-slate-400">
                Revisa los registros detectados antes de asentar en la base de datos de {restaurantName}.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl font-mono font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{validationResult.validCount} Válidos</span>
              </div>

              {validationResult.errorCount > 0 && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl font-mono font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>{validationResult.errorCount} Errores</span>
                </div>
              )}
            </div>
          </div>

          {/* Errors table if any */}
          {validationResult.errors?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                Detalle de filas con errores (no se importarán):
              </span>
              <div className="max-h-48 overflow-y-auto border border-red-500/30 rounded-xl bg-red-500/5 p-2">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 text-[10px] uppercase font-bold border-b border-red-500/20">
                    <tr>
                      <th className="py-1 px-2">Fila Excel</th>
                      <th className="py-1 px-2">Columna</th>
                      <th className="py-1 px-2">Descripción del Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/10 text-slate-300">
                    {validationResult.errors.map((err: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 font-mono font-bold text-red-400">Fila {err.row}</td>
                        <td className="py-1.5 px-2 font-mono text-white">{err.field}</td>
                        <td className="py-1.5 px-2 text-slate-300">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Execute Confirmation Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 gap-3">
            <span className="text-xs text-slate-400">
              Al confirmar, los {validationResult.validCount} registros válidos se guardarán en una transacción atómica y se generará trazabilidad inicial en el Kardex.
            </span>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={importing || validationResult.validCount === 0}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Importar {validationResult.validCount} Registros Válidos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
