import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  name: '',
  scope: 'plan',
  identifier: 'free',
  limit: 60,
  windowMs: 60000,
  burstMultiplier: 1.3,
  queueLimit: 20,
  slaTier: 'bronze',
  active: true,
  notes: ''
};

export default function PolicyEditor() {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const loadPolicies = async () => {
    const { data } = await api.get('/admin/policies');
    setPolicies(data.data);
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/admin/policies', {
      ...form,
      limit: Number(form.limit),
      windowMs: Number(form.windowMs),
      burstMultiplier: Number(form.burstMultiplier),
      queueLimit: Number(form.queueLimit)
    });
    setMessage('Policy saved successfully.');
    setForm(emptyForm);
    loadPolicies();
  };

  const triggerAdaptiveSync = async () => {
    await api.post('/admin/policies/sync-sla');
    setMessage('SLA adjustment executed.');
    loadPolicies();
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Policy Editor</h3>
        <button onClick={triggerAdaptiveSync}>Run SLA Tuning</button>
      </div>
      {message ? <p>{message}</p> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Policy name" required />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
            <option value="global">global</option>
            <option value="plan">plan</option>
            <option value="user">user</option>
            <option value="organization">organization</option>
          </select>
          <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="Identifier" required />
          <input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} placeholder="Limit" required />
          <input type="number" value={form.windowMs} onChange={(e) => setForm({ ...form, windowMs: e.target.value })} placeholder="Window ms" required />
          <input type="number" step="0.1" value={form.burstMultiplier} onChange={(e) => setForm({ ...form, burstMultiplier: e.target.value })} placeholder="Burst multiplier" required />
          <input type="number" value={form.queueLimit} onChange={(e) => setForm({ ...form, queueLimit: e.target.value })} placeholder="Queue limit" required />
          <select value={form.slaTier} onChange={(e) => setForm({ ...form, slaTier: e.target.value })}>
            <option value="bronze">bronze</option>
            <option value="silver">silver</option>
            <option value="gold">gold</option>
            <option value="platinum">platinum</option>
          </select>
        </div>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows="3" />
        <button type="submit">Save Policy</button>
      </form>

      <div style={{ marginTop: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Scope</th>
              <th align="left">Identifier</th>
              <th align="right">Limit</th>
              <th align="right">Adaptive</th>
              <th align="left">SLA</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy._id}>
                <td style={{ padding: '8px 0' }}>{policy.name}</td>
                <td>{policy.scope}</td>
                <td>{policy.identifier}</td>
                <td align="right">{policy.limit}</td>
                <td align="right">{policy.currentAdaptiveLimit ?? '-'}</td>
                <td>{policy.slaTier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
