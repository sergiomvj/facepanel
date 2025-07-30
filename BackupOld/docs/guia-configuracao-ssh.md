# Guia de Configuração SSH - FacePanel

## 🔑 Chaves SSH Geradas

Acabamos de gerar um par de chaves SSH específico para o FacePanel:

- **Chave Privada**: `C:\Users\Sergio Castro\.ssh\facepanel_key`
- **Chave Pública**: `C:\Users\Sergio Castro\.ssh\facepanel_key.pub`

## 📋 Como Usar no FacePanel

### 1. **Chave Privada (para o FacePanel)**
Esta é a chave que você vai colar no campo "Private Key" do formulário de cadastro de VPS:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAgEAxHuaYPCaVDgFENbFHlnh3+MStUWr7yJw5MDW0ApLruUZ0Q5GBemWl
[... conteúdo completo da chave privada ...]
```

### 2. **Chave Pública (para os servidores VPS)**
Esta é a chave que você precisa copiar para cada servidor VPS:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDEe5pg8JpUOAUQ1sUeWeHf4xK1RavvInDkwNbQCkuu5RnRDkYF6ZaUPO/Q9aRgVS2CODe3XU6G+vCWfbcdL3GhjGpuLUcvTbRjOlZ4S7ZrVJsMsF+rHOdolNRRJRN2QmrUP58bYCkWvTh2jYgAy2ZnrzotA4UJSxOahhZMvkolNK1OsjDpsna38mnebWL1KOGrNv4erw33Lo60cBv9MVoR+jpYILg2o38W0hhp99ylnI7IFRP+Qq0DxSzDm3LEe97c4bbZy7LpZC65if2ZJghyGrFFPhaxYIzBgjfaMIo7df/95338H78Ifn2SMUD9HgSBfGzN1u/sB/AlFNHKF1llF9aR4KJkPIIvXCbrd4ppfc0K5RGn34zZivOTpB8wmJx/g9qM2i7u/eYe+2QTTCE8sKNYlnoCEA1HgfiKqF2JZOUBzF+cH/bRKwkkzKktnwVN5scaf1A+azCgCJB2HZTOsAiBpdr1TmWggxdb8eQrOhQKJ3L1z7d7lEuIywEwcxeWCnpkFGNNFA63D39cfbRPa9Q/28aC2T5Y0D41YUu/W0ZDak2jDlw10zNsMoM7Fl3aZkHkMXjkIQhh+0etkzMfMtCCI8Aab9sCdJw/ZjcRNVVMqxMSeQX9ZkTmYgKFE8kXZhr0Jfib6G1KwzqBqE/BLdYV9F9zAtpRBbq+sOhhQHfz9BghtHQ== facepanel@Sergio Castro
```

## 🚀 Configuração nos Servidores VPS

### Para cada servidor VPS que você quer monitorar:

1. **Conecte-se ao servidor** (via senha temporariamente):
```bash
ssh username@ip-do-servidor
```

2. **Crie o diretório .ssh** (se não existir):
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

3. **Adicione a chave pública**:
```bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDEe5pg8JpUOAUQ1sUeWeHf4xK1RavvInDkwNbQCkuu5RnRDkYF6ZaUPO/Q9aRgVS2CODe3XU6G+vCWfbcdL3GhjGpuLUcvTbRjOlZ4S7ZrVJsMsF+rHOdolNRRJRN2QmrUP58bYCkWvTh2jYgAy2ZnrzotA4UJSxOahhZMvkolNK1OsjDpsna38mnebWL1KOGrNv4erw33Lo60cBv9MVoR+jpYILg2o38W0hhp99ylnI7IFRP+Qq0DxSzDm3LEe97c4bbZy7LpZC65if2ZJghyGrFFPhaxYIzBgjfaMIo7df/95338H78Ifn2SMUD9HgSBfGzN1u/sB/AlFNHKF1llF9aR4KJkPIIvXCbrd4ppfc0K5RGn34zZivOTpB8wmJx/g9qM2i7u/eYe+2QTTCE8sKNYlnoCEA1HgfiKqF2JZOUBzF+cH/bRKwkkzKktnwVN5scaf1A+azCgCJB2HZTOsAiBpdr1TmWggxdb8eQrOhQKJ3L1z7d7lEuIywEwcxeWCnpkFGNNFA63D39cfbRPa9Q/28aC2T5Y0D41YUu/W0ZDak2jDlw10zNsMoM7Fl3aZkHkMXjkIQhh+0etkzMfMtCCI8Aab9sCdJw/ZjcRNVVMqxMSeQX9ZkTmYgKFE8kXZhr0Jfib6G1KwzqBqE/BLdYV9F9zAtpRBbq+sOhhQHfz9BghtHQ== facepanel@Sergio Castro" >> ~/.ssh/authorized_keys
```

4. **Configure as permissões**:
```bash
chmod 600 ~/.ssh/authorized_keys
```

## 📝 Formulário FacePanel

Quando cadastrar uma VPS no FacePanel, preencha:

- **Nome**: Nome identificador da VPS
- **IP**: Endereço IP do servidor
- **Porta SSH**: 22 (padrão)
- **Username**: root, ubuntu, ou outro usuário com sudo
- **Private Key**: Cole o conteúdo completo da chave privada
- **Tags**: Opcional (ex: producao, desenvolvimento)

## ✅ Teste de Conexão

Após configurar, você pode testar a conexão do seu PC:

```powershell
ssh -i "$env:USERPROFILE\.ssh\facepanel_key" username@ip-do-servidor
```

## 🔒 Segurança

- ✅ Uma única chave privada para todas as VPS
- ✅ Chave pública diferente em cada servidor
- ✅ Sem senhas - apenas autenticação por chave
- ✅ Chave privada fica apenas no FacePanel

## 📋 Checklist de Configuração

- [ ] Chaves SSH geradas ✅
- [ ] Chave pública copiada para o servidor VPS
- [ ] Permissões configuradas no servidor
- [ ] Teste de conexão realizado
- [ ] VPS cadastrada no FacePanel
- [ ] Monitoramento funcionando

---

**💡 Dica**: Use essa MESMA chave privada para todas as VPS que cadastrar no FacePanel. Apenas copie a chave pública para cada servidor novo.
