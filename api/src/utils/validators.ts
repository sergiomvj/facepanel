export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  password: (password: string): boolean => {
    // Mínimo 8 caracteres, pelo menos uma letra e um número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    return passwordRegex.test(password)
  },

  projectName: (name: string): boolean => {
    // Apenas letras, números, hífens e underscores, 3-50 caracteres
    const nameRegex = /^[a-zA-Z0-9_-]{3,50}$/
    return nameRegex.test(name)
  },

  domain: (domain: string): boolean => {
    // Validação básica de domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    return domainRegex.test(domain)
  },

  port: (port: number): boolean => {
    return port >= 1 && port <= 65535
  },

  serviceName: (name: string): boolean => {
    // Nome do serviço Docker válido
    const serviceNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/
    return serviceNameRegex.test(name) && name.length >= 1 && name.length <= 63
  }
}
