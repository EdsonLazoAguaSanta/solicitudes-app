-- Ejecutar UNA VEZ en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Crea la tabla de historial usada por app.py y src/App.jsx para registrar
-- cada guardado explícito de los formularios (no cada autoguardado).

create table if not exists historial (
  id bigint generated always as identity primary key,
  tipo_formulario text not null,      -- 'IT' | 'Gerencia'
  respondente text not null,
  snapshot jsonb not null,            -- copia completa de los campos al momento de guardar
  fecha timestamptz not null default now()
);

create index if not exists historial_lookup_idx
  on historial (tipo_formulario, respondente, fecha desc);

-- Estas políticas asumen acceso anónimo abierto, igual que solicitud_it y
-- solicitud_gerencia hoy. Si esas tablas tienen políticas RLS distintas,
-- ajusta estas para que coincidan.
alter table historial enable row level security;

create policy "Permitir lectura anon" on historial
  for select using (true);

create policy "Permitir insercion anon" on historial
  for insert with check (true);
