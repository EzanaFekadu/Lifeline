import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    blood_type: '',
    has_diabetes: false,
    allergies: '',
    medical_conditions: '',
    medications: '',
    emergency_notes: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name,
          blood_type: data.blood_type || '',
          has_diabetes: data.has_diabetes,
          allergies: data.allergies,
          medical_conditions: data.medical_conditions,
          medications: data.medications,
          emergency_notes: data.emergency_notes,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Medical Profile</h1>
      <p className="subtitle">This information will be shared with emergency responders</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="full_name">Full Name *</label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="blood_type">Blood Type</label>
          <select
            id="blood_type"
            value={formData.blood_type}
            onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.has_diabetes}
              onChange={(e) => setFormData({ ...formData, has_diabetes: e.target.checked })}
            />
            <span>I have diabetes</span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="allergies">Allergies</label>
          <textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="e.g., Penicillin, Peanuts, Latex"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="medical_conditions">Medical Conditions</label>
          <textarea
            id="medical_conditions"
            value={formData.medical_conditions}
            onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
            placeholder="e.g., Asthma, Hypertension, Epilepsy"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="medications">Current Medications</label>
          <textarea
            id="medications"
            value={formData.medications}
            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
            placeholder="e.g., Aspirin 100mg daily, Insulin"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergency_notes">Emergency Notes</label>
          <textarea
            id="emergency_notes"
            value={formData.emergency_notes}
            onChange={(e) => setFormData({ ...formData, emergency_notes: e.target.value })}
            placeholder="Any other important information for emergency responders"
            rows={3}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};
