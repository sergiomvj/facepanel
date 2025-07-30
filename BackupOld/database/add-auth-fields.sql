-- Execute este script no SQL Editor do Supabase para adicionar suporte a senhas

-- Adicionar campos para autenticação por senha
ALTER TABLE vps 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) CHECK (auth_type IN ('key', 'password')) DEFAULT 'key',
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vps' 
AND column_name IN ('auth_type', 'password_hash')
ORDER BY column_name;
