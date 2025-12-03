import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dashboard removed — redirect to chat
export default function DashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/chat');
  }, [navigate]);
  return null;
}
