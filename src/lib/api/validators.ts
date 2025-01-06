export const AuthValidators = {
  validateLoginFields(email: string, password: string): string | null {
    if (!email?.trim() || !password?.trim()) {
      return 'Email e senha são obrigatórios';
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Email inválido';
    }

    // Validar comprimento mínimo da senha
    if (password.trim().length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }

    return null;
  }
};