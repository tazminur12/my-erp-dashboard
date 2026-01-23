'use client';

import { useState, useCallback } from 'react';

export function useAccountQueries() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create Bank Account Mutation
  const useCreateBankAccount = () => {
    const [isPending, setIsPending] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const mutateAsync = useCallback(async (payload) => {
      setIsPending(true);
      setError(null);
      
      try {
        const response = await fetch('/api/bank-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to create bank account');
        }

        setData(result.bankAccount || result.data);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'Failed to create bank account';
        setError(errorMessage);
        throw err;
      } finally {
        setIsPending(false);
      }
    }, []);

    return {
      mutateAsync,
      isPending,
      data,
      error,
    };
  };

  // Update Bank Account Mutation
  const useUpdateBankAccount = () => {
    const [isPending, setIsPending] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const mutateAsync = useCallback(async (id, payload) => {
      setIsPending(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/bank-accounts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to update bank account');
        }

        setData(result.bankAccount || result.data);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'Failed to update bank account';
        setError(errorMessage);
        throw err;
      } finally {
        setIsPending(false);
      }
    }, []);

    return {
      mutateAsync,
      isPending,
      data,
      error,
    };
  };

  // Delete Bank Account Mutation
  const useDeleteBankAccount = () => {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const mutateAsync = useCallback(async (id) => {
      setIsPending(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/bank-accounts/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to delete bank account');
        }

        return result;
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete bank account';
        setError(errorMessage);
        throw err;
      } finally {
        setIsPending(false);
      }
    }, []);

    return {
      mutateAsync,
      isPending,
      error,
    };
  };

  // Get Bank Account Query
  const useGetBankAccount = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const refetch = useCallback(async (id) => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/bank-accounts/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to fetch bank account');
        }

        setData(result.bankAccount || result.data);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch bank account';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  // Get All Bank Accounts Query
  const useGetBankAccounts = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const refetch = useCallback(async (filters = {}) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        if (filters.accountCategory) {
          queryParams.append('accountCategory', filters.accountCategory);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }

        const url = `/api/bank-accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to fetch bank accounts');
        }

        const accounts = result.bankAccounts || result.data || [];
        setData(accounts);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch bank accounts';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  return {
    useCreateBankAccount,
    useUpdateBankAccount,
    useDeleteBankAccount,
    useGetBankAccount,
    useGetBankAccounts,
    isLoading,
    error,
  };
}
