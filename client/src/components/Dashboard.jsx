import { useEffect, useState } from 'react';
import api from '../services/api';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <div style={cardStyle}>Loading dashboard...</div>;
  if (error) return <div style={cardStyle}>Dashboard error: {error}</div>;

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          <h3>Total Policies</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.policyCount}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Usage Logs</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.usageCount}</p>
        </div>
        <div style={cardStyle}>
          <h3>Recent Route Activity</h3>
          <p style={{ margin: 0 }}>{analytics.topRoutes.length} tracked route snapshots</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Top Routes (last 24h)</h3>
          <button onClick={loadAnalytics}>Refresh</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Route</th>
              <th align="left">Decision</th>
              <th align="right">Hits</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topRoutes.map((item, index) => (
              <tr key={`${item._id.routeKey}-${index}`}>
                <td style={{ padding: '8px 0' }}>{item._id.routeKey}</td>
                <td>{item._id.decision}</td>
                <td align="right">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h3>Recent Decisions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Time</th>
                <th align="left">User</th>
                <th align="left">Plan</th>
                <th align="left">Route</th>
                <th align="left">Decision</th>
                <th align="right">Usage</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentLogs.map((log) => (
                <tr key={log._id}>
                  <td style={{ padding: '8px 0' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.userId || 'anonymous'}</td>
                  <td>{log.plan || 'free'}</td>
                  <td>{log.routeKey}</td>
                  <td>{log.decision}</td>
                  <td align="right">{log.usageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
