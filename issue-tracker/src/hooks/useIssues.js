import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export function useIssues() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIssues = useCallback(async () => {
    const [issueRes, userRes] = await Promise.all([
      supabase
        .from('issues')
        .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, full_name, email),
          assignee:profiles!issues_assignee_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email').order('full_name'),
    ]);

    if (issueRes.error) throw issueRes.error;
    if (userRes.error) throw userRes.error;

    return {
      issues: issueRes.data ?? [],
      users: userRes.data ?? [],
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchIssues();
      setIssues(data.issues);
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, [fetchIssues]);

  useEffect(() => {
    let active = true;

    async function loadInitialIssues() {
      try {
        const data = await fetchIssues();
        if (!active) return;

        setIssues(data.issues);
        setUsers(data.users);
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Failed to load issues.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialIssues();

    return () => {
      active = false;
    };
  }, [fetchIssues]);

  return { issues, users, loading, error, setError, reload };
}