
import axios from 'axios';

export const useAccountService = () => {
  const fetchAccounts = async (params: any, signal?: AbortSignal) => {
    return await axios.get('/api/accounts', {
      params,
      signal
    });
  };

  const createAccount = async (accountData: any) => {
    return await axios.post('/api/accounts', accountData);
  };

  return {
    fetchAccounts,
    createAccount
  };
};