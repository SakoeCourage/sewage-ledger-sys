'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
  [key: string]: any;
  roleID: number;
  name: string;
  description: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Role>[] = [
  { field: 'roleID', header: 'ID', sortable: true },
  { field: 'name', header: 'Role Name', sortable: true },
  { field: 'description', header: 'Description' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => api.get('/api/Role/all').then((r) => r.data),
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/api/Role', values);
      toast.success('Role created successfully');
      qc.invalidateQueries({ queryKey: ['roles'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to create role. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Roles</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Define access roles for system users</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Role</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<Role>
          columns={columns}
          data={roles}
          filterablePlaceholder="Search roles…"
          searchFields={['name', 'description']}
          pageSize={10}
        />
      </div>

      {/* ── New Role Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="New Role"
        description="Create an access role for system users"
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving…' : 'Save Role'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-5">
          <Controller name="name" control={control} render={({ field }) => (
            <TextInput label="Role Name" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.name?.message}
              placeholder="e.g. Admin, Cashier, Supervisor" required />
          )} />

          <Controller name="description" control={control} render={({ field }) => (
            <TextInput label="Description (optional)" name={field.name} value={field.value ?? ''}
              multiline rows={3} onChange={field.onChange}
              placeholder="Brief description of what this role can do…" />
          )} />
        </form>
      </BottomSheet>
    </div>
  );
}
