import { useState, useEffect } from 'react';
import { supabase, UserProfile, EmergencyContact } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyActive, setEmergencyActive] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [profileResult, contactsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true }),
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (contactsResult.data) setContacts(contactsResult.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = () => {
    setEmergencyActive(true);
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (emergencyActive) {
    return (
      <div className="emergency-active">
        <div className="emergency-card">
          <h1 className="emergency-title">EMERGENCY ACTIVATED</h1>

          <div className="emergency-info">
            <h2>Medical Information</h2>
            {profile ? (
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {profile.full_name}
                </div>
                {profile.blood_type && (
                  <div className="info-item">
                    <strong>Blood Type:</strong> {profile.blood_type}
                  </div>
                )}
                {profile.has_diabetes && (
                  <div className="info-item alert">
                    <strong>ALERT:</strong> Patient has diabetes
                  </div>
                )}
                {profile.allergies && (
                  <div className="info-item alert">
                    <strong>Allergies:</strong> {profile.allergies}
                  </div>
                )}
                {profile.medical_conditions && (
                  <div className="info-item">
                    <strong>Medical Conditions:</strong> {profile.medical_conditions}
                  </div>
                )}
                {profile.medications && (
                  <div className="info-item">
                    <strong>Medications:</strong> {profile.medications}
                  </div>
                )}
                {profile.emergency_notes && (
                  <div className="info-item">
                    <strong>Emergency Notes:</strong> {profile.emergency_notes}
                  </div>
                )}
              </div>
            ) : (
              <p>No medical information available</p>
            )}
          </div>

          <div className="emergency-contacts-section">
            <h2>Emergency Contacts</h2>
            {contacts.length > 0 ? (
              <div className="emergency-contacts-list">
                {contacts.map((contact) => (
                  <div key={contact.id} className="emergency-contact-item">
                    {contact.is_primary && <span className="primary-badge">Primary</span>}
                    <h3>{contact.name}</h3>
                    <p>{contact.relationship}</p>
                    <a href={`tel:${contact.phone}`} className="phone-link">
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p>No emergency contacts available</p>
            )}
          </div>

          <button className="btn-cancel" onClick={cancelEmergency}>
            Cancel Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Lifeline Dashboard</h1>

      <div className="emergency-trigger-section">
        <button className="btn-emergency" onClick={handleEmergency}>
          EMERGENCY
        </button>
        <p className="emergency-text">
          Press this button in case of emergency to display your medical information
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          {profile ? (
            <div className="profile-summary">
              <p><strong>Name:</strong> {profile.full_name}</p>
              {profile.blood_type && <p><strong>Blood Type:</strong> {profile.blood_type}</p>}
              {profile.has_diabetes && <p className="alert-text">Has Diabetes</p>}
            </div>
          ) : (
            <p>Please complete your profile</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Emergency Contacts</h2>
          {contacts.length > 0 ? (
            <p>{contacts.length} contact{contacts.length !== 1 ? 's' : ''} added</p>
          ) : (
            <p>No contacts added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
