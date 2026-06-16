-- Execute este script no SQL Editor do Supabase Dashboard (https://supabase.com)

-- 1. Tabela Produtos
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  marca text,
  descricao text,
  preco numeric(10,2) not null,
  quantidade int default 0,
  imagem_url text,
  destaque boolean default false,
  apenas_encomenda boolean default false,
  total_pedidos int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabela Clientes
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text unique not null,
  endereco text,
  created_at timestamptz default now()
);

-- 3. Tabela Pedidos
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade,
  valor_total numeric(10,2),
  status text default 'pendente',
  created_at timestamptz default now()
);

-- 4. Tabela Itens do Pedido
create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.pedidos(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  quantidade int not null,
  valor_unitario numeric(10,2) not null
);

-- 5. Tabela Favoritos
create table public.favoritos (
  id uuid primary key default gen_random_uuid(),
  telefone_cliente text,
  produto_id uuid references public.produtos(id) on delete cascade
);

-- 6. Storage Bucket para Imagens de Produtos
insert into storage.buckets (id, name, public) 
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

-- ==========================================
-- REALTIME - Ativar para tabela pedidos (Necessário para a notificação)
-- ==========================================
alter publication supabase_realtime add table public.pedidos;

-- ==========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================
alter table public.produtos enable row level security;
alter table public.clientes enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.favoritos enable row level security;

-- Produtos: qualquer um pode ler. Apenas autenticados (admin) podem alterar
create policy "Leitura pública produtos" on public.produtos for select using (true);
create policy "Admin gerencia produtos" on public.produtos for all using (auth.role() = 'authenticated');

-- Clientes: Leitura para achar próprios pedidos por telefone, ou admin
create policy "Leitura pública clientes" on public.clientes for select using (true);
create policy "Inserção pública clientes" on public.clientes for insert with check (true);
create policy "Update público clientes" on public.clientes for update using (true);
create policy "Admin gerencia clientes" on public.clientes for all using (auth.role() = 'authenticated');

-- Pedidos e Itens: Público pode inserir, leitura pública para a página Meus Pedidos
create policy "Leitura e inserção pública pedidos" on public.pedidos for all using (true);
create policy "Leitura e inserção pública itens" on public.pedido_itens for all using (true);

-- Storage Policies
create policy "Leitura pública imagens" on storage.objects for select using (bucket_id = 'produtos');
create policy "Admin gerencia imagens" on storage.objects for all using (bucket_id = 'produtos' and auth.role() = 'authenticated');
