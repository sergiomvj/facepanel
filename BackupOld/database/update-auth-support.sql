-- ===================================================================
-- ATUALIZAÇÃO DO SCHEMA - Suporte para Autenticação por Senha
-- Execute este script no SQL Editor do Supabase
-- ===================================================================

-- Adicionar campos para suporte a autenticação por senha
ALTER TABLE vps 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) CHECK (auth_type IN ('key', 'password')) DEFAULT 'key',
ADD COLUMN IF NOT EXISTS password_hash TEXT; -- Senha criptografada

-- Atualizar comentários
COMMENT ON COLUMN vps.private_key IS 'Chave SSH privada (para auth_type = key)';
COMMENT ON COLUMN vps.password_hash IS 'Senha SSH criptografada (para auth_type = password)';
COMMENT ON COLUMN vps.auth_type IS 'Tipo de autenticação: key (chave SSH) ou password (senha)';

-- Fazer private_key opcional quando usar senha
ALTER TABLE vps 
ALTER COLUMN private_key DROP NOT NULL;

-- Verificar alterações
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'vps' 
AND table_schema = 'public'
ORDER BY ordinal_position;
