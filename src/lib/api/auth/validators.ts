export const AuthValidators = {
  validateLoginFields(email: string, password: string): string | null {
    if (!email?.trim() || !password?.trim()) {
      return 'Email e senha são obrigatórios';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Email inválido';
    }

    if (password.trim().length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }

    return null;
  }
};