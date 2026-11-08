'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Users, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Lock, 
  Sparkles, 
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';
import { STANDARD_MODULES } from '@/app/api/roles/route';

interface UsuariosRolesTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const UsuariosRolesTab: React.FC<UsuariosRolesTabProps> = ({ restaurantId, restaurantName }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);

  // Form State
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch(`/api/roles?restaurantId=${restaurantId}`),
        fetch(`/api/users?restaurantId=${restaurantId}`),
      ]);

      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Error fetching roles/users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  const handleOpenRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.nombre);
      setRoleDesc(role.descripcion || '');
      setPermissionsMatrix(role.permisos || {});
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDesc('');
      // Default empty matrix
      const emptyMatrix: Record<string, Record<string, boolean>> = {};
      STANDARD_MODULES.forEach((mod) => {
        emptyMatrix[mod] = { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false };
      });
      setPermissionsMatrix(emptyMatrix);
    }
    setShowRoleModal(true);
  };

  const handleTogglePermission = (moduleName: string, action: string) => {
    setPermissionsMatrix((prev) => {
      const modPerms = prev[moduleName] || {};
      return {
        ...prev,
        [moduleName]: {
          ...modPerms,
          [action]: !modPerms[action],
        },
      };
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        const res = await fetch(`/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: roleName,
            descripcion: roleDesc,
            permisos: permissionsMatrix,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar rol');
      } else {
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId,
            nombre: roleName,
            descripcion: roleDesc,
            permisos: permissionsMatrix,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear rol');
      }

      setShowRoleModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${name}"?`)) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span>Matriz de Roles y Permisos Granulares (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Define qué puede ver, crear, editar, eliminar o autorizar cada perfil del equipo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenRoleModal()}
          className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Rol Personalizado</span>
        </button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
            Cargando roles del restaurante...
          </div>
        ) : (
          roles.map((r) => (
            <div
              key={r.id}
              className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-4"
            >
              <div>
                <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white">{r.nombre}</h3>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {r.esSistema ? 'Rol Estándar del Sistema' : 'Rol Personalizado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenRoleModal(r)}
                      className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                      title="Editar Permisos"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!r.esSistema && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(r.id, r.nombre)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg"
                        title="Eliminar Rol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {r.descripcion || 'Sin descripción'}
                </p>

                {/* Permissions Snapshot */}
                <div className="mt-3 bg-[#181b26] p-2.5 rounded-xl space-y-1.5 text-[11px]">
                  <span className="font-bold text-slate-300 block pb-1 border-b border-slate-800">
                    Módulos autorizados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(r.permisos || {}).map(([mod, p]: any) => {
                      if (!p?.ver) return null;
                      return (
                        <span key={mod} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {mod}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{r._count?.users || 0} usuarios con este rol</span>
                <span className="text-orange-400 font-bold text-[11px] cursor-pointer hover:underline" onClick={() => handleOpenRoleModal(r)}>
                  Ver Matriz →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ROLE BUILDER & PERMISSION MATRIX MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base text-white">
                  {editingRole ? `Matriz de Permisos: ${editingRole.nombre}` : 'Crear Nuevo Rol Personalizado'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nombre del Rol *</label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Descripción / Responsabilidades</label>
                  <input
                    type="text"
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    placeholder="Tareas y alcances del rol..."
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Granular Matrix */}
              <div className="space-y-3">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-xs block">
                  Matriz de Permisos por Módulo:
                </span>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#181b26]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#12141c] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Módulo</th>
                        <th className="py-2.5 px-2 text-center">Ver</th>
                        <th className="py-2.5 px-2 text-center">Crear</th>
                        <th className="py-2.5 px-2 text-center">Editar</th>
                        <th className="py-2.5 px-2 text-center">Eliminar</th>
                        <th className="py-2.5 px-2 text-center">Exportar</th>
                        <th className="py-2.5 px-2 text-center">Autorizar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {STANDARD_MODULES.map((modKey) => {
                        const modPerms = permissionsMatrix[modKey] || {};
                        const actions = ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'autorizar'];

                        return (
                          <tr key={modKey} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold font-mono text-white capitalize">
                              {modKey.replace('_', ' ')}
                            </td>
                            {actions.map((act) => (
                              <td key={act} className="py-2.5 px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!modPerms[act]}
                                  onChange={() => handleTogglePermission(modKey, act)}
                                  className="w-4 h-4 text-orange-500 rounded bg-[#1b1e2a] border-slate-700 focus:ring-orange-500 cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Guardar Rol y Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
