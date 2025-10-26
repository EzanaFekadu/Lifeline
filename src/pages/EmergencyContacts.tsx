import { useState, useEffect } from 'react';
import { supabase, EmergencyContact } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const EmergencyContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    is_primary: false,
  });

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      resetForm();
      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      is_primary: contact.is_primary,
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      is_primary: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Emergency Contacts</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="relationship">Relationship *</label>
            <input
              type="text"
              id="relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Spouse, Parent, Friend"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g., +1 (555) 123-4567"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              />
              <span>Primary Contact</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Contact' : 'Add Contact'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="contacts-list">
        {contacts.length === 0 ? (
          <p className="empty-state">No emergency contacts added yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              {contact.is_primary && <span className="primary-badge">Primary</span>}
              <h3>{contact.name}</h3>
              <p className="relationship">{contact.relationship}</p>
              <p className="phone">{contact.phone}</p>
              <div className="contact-actions">
                <button className="btn-edit" onClick={() => handleEdit(contact)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(contact.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
