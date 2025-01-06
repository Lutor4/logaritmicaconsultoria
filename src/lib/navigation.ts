import { NavigateFunction } from 'react-router-dom';
import { AuthService } from './auth';

export const NavigationService = {
  async navigateToLogin(navigate: NavigateFunction, signOut: () => Promise<void>) {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error during navigation:', err);
      navigate('/login', { replace: true });
    }
  }
};