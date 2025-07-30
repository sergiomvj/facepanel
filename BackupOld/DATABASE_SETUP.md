# 🗄️ Configuração do Banco de Dados

## 📋 Passo a Passo para Configurar o Supabase

### 1. **Executar o Script SQL**

1. Acesse seu projeto Supabase: https://supabase.com/dashboard
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New query**
4. Copie todo o conteúdo do arquivo `database/setup.sql`
5. Cole no editor e clique em **Run**

### 2. **Verificar se as Tabelas foram Criadas**

Execute esta query para verificar:

```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'vps', 'vps_stats', 'docker_containers', 'service_templates', 'installations', 'alerts', 'action_logs')
ORDER BY table_name;
```

Você deve ver 8 tabelas listadas.

### 3. **Testar a Inserção de Dados**

Execute este comando para testar:

```sql
-- Inserir um VPS de teste
INSERT INTO vps (name, ip, username, tags) 
VALUES ('VPS-Teste', '192.168.1.100', 'root', ARRAY['teste', 'desenvolvimento']);

-- Verificar se foi inserido
SELECT * FROM vps;
```

### 4. **Configurar Políticas de Segurança (Opcional)**

Se quiser habilitar RLS (Row Level Security):

```sql
-- Política para que todos possam ler VPS (temporário para desenvolvimento)
CREATE POLICY "Enable read access for all users" ON "public"."vps"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Política para que todos possam inserir VPS (temporário para desenvolvimento)
CREATE POLICY "Enable insert for all users" ON "public"."vps"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
```

### 5. **Verificar Conexão da API**

1. Certifique-se que o servidor está rodando: `npm run dev`
2. Acesse: http://localhost:3000
3. Tente adicionar uma VPS pelo formulário
4. Verifique se aparece na lista

### 🔧 **Troubleshooting**

**Erro "relation does not exist":**
- Execute novamente o script `setup.sql`
- Verifique se está no schema correto (`public`)

**Erro de permissão:**
- Verifique se as políticas RLS estão corretas
- Para desenvolvimento, pode desabilitar RLS temporariamente

**Erro de conexão:**
- Verifique se as variáveis de ambiente estão corretas
- Teste a conexão no Supabase Dashboard

### 📊 **Dados de Exemplo**

Para popular com dados de teste:

```sql
-- Inserir VPS de exemplo
INSERT INTO vps (name, ip, username, tags, status) VALUES
('VPS-Web-01', '192.168.1.100', 'root', ARRAY['web', 'frontend'], 'online'),
('VPS-Database-01', '192.168.1.101', 'root', ARRAY['database', 'postgresql'], 'offline'),
('VPS-API-01', '192.168.1.102', 'ubuntu', ARRAY['api', 'backend'], 'online');

-- Inserir estatísticas de exemplo
INSERT INTO vps_stats (vps_id, cpu_usage, cpu_cores, memory_used, memory_total, memory_percentage, disk_used, disk_total, disk_percentage, network_bytes_in, network_bytes_out, uptime) 
SELECT 
    id,
    random() * 100,
    4,
    (random() * 8000000000)::bigint,
    8000000000,
    random() * 100,
    (random() * 50000000000)::bigint,
    100000000000,
    random() * 100,
    (random() * 1000000000)::bigint,
    (random() * 1000000000)::bigint,
    (random() * 1000000)::bigint
FROM vps;
```

### ✅ **Checklist de Configuração**

- [ ] Script SQL executado com sucesso
- [ ] 8 tabelas criadas (users, vps, vps_stats, etc.)
- [ ] Variáveis de ambiente configuradas (.env.local)
- [ ] API funcionando (http://localhost:3000/api/vps)
- [ ] Interface carregando sem erros
- [ ] Formulário de adicionar VPS funcionando

## 🚀 **Próximo Passo**

Após configurar o banco, você pode:

1. **Adicionar VPS reais** pelo formulário
2. **Testar conexão SSH** (implementar função real)
3. **Configurar monitoramento** em tempo real
4. **Adicionar autenticação** de usuários

O projeto está pronto para uso! 🎉
