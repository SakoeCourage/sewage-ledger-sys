'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput, MultiSelectInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role { roleID: number; name: string }

interface User {
  userID: number;
  surname: string;
  otherNames: string;
  username: string;
  email: string;
  tel: string;
  roles: Role[];
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  surname:    z.string().min(1, 'Surname is required'),
  otherNames: z.string().min(1, 'Other names are required'),
  tel:        z.string().min(1, 'Phone number is required'),
  email:      z.string().email('Enter a valid email address'),
  username:   z.string().min(1, 'Username is required'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  roleIDs:    z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<User>[] = [
  { field: 'username', header: 'Username', sortable: true },
  { field: 'surname', header: 'Full Name', sortable: true, body: (row) => `${row.surname} ${row.otherNames}`.trim() },
  { field: 'email', header: 'Email' },
  { field: 'tel', header: 'Phone' },
  {
    field: 'roles', header: 'Roles',
    body: (row) => row.roles?.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {row.roles.map((r) => (
          <span key={r.roleID} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#4a907a]/10 text-[#4a907a]">
            {r.name}
          </span>
        ))}
      </div>
    ) : <span className="text-zinc-400 text-xs">No roles</span>,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/api/User/all').then((r) => r.data),
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => api.get('/api/Role/all').then((r) => r.data),
  });

  const roleOptions = roles.map((r) => ({ label: r.name, value: r.roleID }));

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { surname: '', otherNames: '', tel: '', email: '', username: '', password: '', roleIDs: [] },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/api/User', {
        surname:    values.surname,
        otherNames: values.otherNames,
        tel:        values.tel,
        email:      values.email,
        username:   values.username,
        password:   values.password,
        roles:      (values.roleIDs ?? []).map((id) => ({ roleID: id })),
      });
      toast.success('User created successfully');
      qc.invalidateQueries({ queryKey: ['users'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to create user. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage system user accounts</p>
        </div>
        <Button variant="primary" label="New User" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)} />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<User>
          columns={columns}
          data={users}
          filterablePlaceholder="Search users…"
          searchFields={['username', 'surname', 'otherNames', 'email', 'tel']}
          pageSize={10}
        />
      </div>

      {/* ── New User Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Create User Account"
        description="Fill in the user details and assign roles"
        size="full"
        footer={
          <>
            <Button variant="neutral" label="Cancel" onClick={() => setOpen(false)} />
            <Button variant="primary" label={isSubmitting ? 'Saving…' : 'Create User'} loading={isSubmitting} onClick={handleSubmit(onSubmit)} />
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller name="surname" control={control} render={({ field }) => (
            <TextInput label="Surname" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.surname?.message} placeholder="e.g. Mensah" required />
          )} />

          <Controller name="otherNames" control={control} render={({ field }) => (
            <TextInput label="Other Names" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.otherNames?.message} placeholder="e.g. Kwame" required />
          )} />

          <Controller name="email" control={control} render={({ field }) => (
            <TextInput label="Email Address" name={field.name} type="email" value={field.value}
              onChange={field.onChange} error={errors.email?.message} placeholder="user@example.com" required />
          )} />

          <Controller name="tel" control={control} render={({ field }) => (
            <TextInput label="Phone Number" name={field.name} type="tel" value={field.value}
              onChange={field.onChange} error={errors.tel?.message} placeholder="e.g. 024 000 0000" required />
          )} />

          <Controller name="username" control={control} render={({ field }) => (
            <TextInput label="Username" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.username?.message} placeholder="Login username" required />
          )} />

          <Controller name="password" control={control} render={({ field }) => (
            <TextInput label="Password" name={field.name} type="password" value={field.value}
              onChange={field.onChange} error={errors.password?.message} placeholder="Min. 6 characters" required />
          )} />

          <div className="sm:col-span-2">
            <Controller name="roleIDs" control={control} render={({ field }) => (
              <MultiSelectInput
                label="Assign Roles"
                name={field.name}
                value={field.value ?? []}
                options={roleOptions}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Select roles"
                display="chip"
              />
            )} />
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
