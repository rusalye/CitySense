import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getJournal, createJournal, deleteJournal } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

export default function JournalPage() {
  const { showToast } = useApp();
  const [journalData, setJournalData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    body: '',
    tags: '',
    mood: '😊',
    moodColor: 'var(--gold)',
  });
  const { isTracking, startTracking, stopTracking, distanceKm, steps } = useGeolocation();

  useEffect(() => {
    getJournal().then(setJournalData).catch(e => console.error(e));
  }, []);

  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date(), h = d.getHours(), m = d.getMinutes();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const hh = h % 12 || 12, ampm = h >= 12 ? 'PM' : 'AM';
      setTimeStr(`${days[d.getDay()]}, ${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (uploadedImages.length >= 5) {
        showToast('⚠️', 'Maximum 5 images per entry');
        break;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages(prev => [...prev, {
          name: file.name,
          data: event.target.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEntry = async () => {
    if (!formData.title.trim()) {
      showToast('✏️', 'Please add an entry title');
      return;
    }

    if (!formData.body.trim()) {
      showToast('📝', 'Please add entry content');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const entryData = {
        date: formData.date,
        title: formData.title,
        body: formData.body,
        tags: tags.length > 0 ? tags : ['memory'],
        steps: steps.toString(),
        duration: isTracking ? distanceKm.toFixed(2) + ' km' : '0 km',
        mood: formData.mood,
        moodColor: formData.moodColor,
        images: uploadedImages.map(img => img.data),
      };

      const newEntry = await createJournal(entryData);
      setJournalData(prev => [newEntry, ...prev]);
      setShowAddModal(false);
      resetForm();
      showToast('📖', 'Memory captured! ✨');
    } catch (error) {
      console.error('Error creating entry:', error);
      showToast('❌', 'Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    try {
      await deleteJournal(selectedEntry.id);
      setJournalData(prev => prev.filter(j => j.id !== selectedEntry.id));
      setShowDetailModal(false);
      setSelectedEntry(null);
      setShowDeleteConfirm(false);
      showToast('🗑️', 'Memory deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('❌', 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      body: '',
      tags: '',
      mood: '😊',
      moodColor: 'var(--gold)',
    });
    setUploadedImages([]);
  };

  return (
    <div className="page active" id="page-journal">
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Your<br/><em>City Journal</em> 📖</div>
          <div className="greeting-sub">Every walk tells a story. <span className="gs-hi">{journalData.length} entries</span> written so far.</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Journal Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">📝</div><div className="stat-num">{journalData.length}</div><div className="stat-lbl">Entries</div></div>
          {isTracking ? (
             <div className="stat-tile" style={{border: '1px solid var(--teal)'}}><div className="stat-emoji">👟</div><div className="stat-num" style={{color: 'var(--teal)'}}>{steps}</div><div className="stat-lbl">Live Steps</div></div>
          ) : (
             <div className="stat-tile"><div className="stat-emoji">🚶</div><div className="stat-num">38<sup>k</sup></div><div className="stat-lbl">Total km</div></div>
          )}
          <div className="stat-tile"><div className="stat-emoji">🗺</div><div className="stat-num">12</div><div className="stat-lbl">Zones</div></div>
        </div>
        
        <div className="sec-divider"><span className="sec-icon">🌙</span><span className="sec-label">Best Moods</span><div className="sec-line"></div></div>
        <div style={{padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>😌</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Peaceful walks</span><span className="badge badge-teal">8 times</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>🤩</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Excited discoveries</span><span className="badge badge-gold">4 times</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>☕</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Cozy afternoons</span><span className="badge badge-sky">2 times</span></div>
        </div>
      </aside>

      <div className="right-panel journal-right">
        <div className="journal-header">
          <div className="section-h">Walking <em>Stories</em></div>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>✏️ Add Entry</button>
        </div>
        <div className="journal-timeline anim-in">
          {journalData.map((j, i) => (
            <div key={i} className="journal-entry" onClick={() => openDetailModal(j)}>
              {j.images && j.images.length > 0 && (
                <div className="je-images">
                  {j.images.map((img, idx) => (
                    <div key={idx} className="je-image-container">
                      <img src={img} alt={`Memory ${idx + 1}`} className="je-image" />
                    </div>
                  ))}
                </div>
              )}
              <div className="je-date">
                {j.date}
                <span className={`badge badge-${j.moodColor === 'var(--teal)' ? 'teal' : j.moodColor === 'var(--gold)' ? 'gold' : 'plum'}`}>
                  {j.tags[0]}
                </span>
              </div>
              <div className="je-title" dangerouslySetInnerHTML={{__html: j.title}} />
              <div className="je-body">{j.body}</div>
              <div className="je-tags">
                {j.tags.map(t => <span key={t} className="badge badge-sky">{t}</span>)}
              </div>
              <div className="je-stats">
                <div className="je-stat">👟 {j.steps}</div>
                <div className="je-stat">⏱ {j.duration}</div>
                <div className="je-stat">📍 Bengaluru</div>
              </div>
              <div className="je-mood">{j.mood}</div>
            </div>
          ))}
        </div>
      </div>

      {showDetailModal && selectedEntry && (
        <div className="je-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="je-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="je-modal-header">
              <h2>📖 Memory</h2>
              <button className="je-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            
            <div className="je-detail-content">
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <div className="jed-images-container">
                  {selectedEntry.images.length === 1 ? (
                    <div className="jed-single-image">
                      <img src={selectedEntry.images[0]} alt="Memory" className="jed-image" />
                    </div>
                  ) : (
                    <div className="jed-gallery">
                      {selectedEntry.images.map((img, idx) => (
                        <div key={idx} className="jed-gallery-item">
                          <img src={img} alt={`Memory ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="jed-content">
                <div className="jed-date">{selectedEntry.date}</div>
                <h1 className="jed-title" dangerouslySetInnerHTML={{__html: selectedEntry.title}} />
                <div className="jed-body">{selectedEntry.body}</div>
                
                <div className="jed-meta">
                  <div className="jed-mood-display">{selectedEntry.mood}</div>
                  <div className="jed-tags">
                    {selectedEntry.tags.map(t => <span key={t} className="badge badge-sky">{t}</span>)}
                  </div>
                </div>
                
                <div className="jed-stats-detail">
                  <div className="jed-stat-item"><span>👟</span> <strong>{selectedEntry.steps}</strong> steps</div>
                  <div className="jed-stat-item"><span>⏱</span> <strong>{selectedEntry.duration}</strong></div>
                  <div className="jed-stat-item"><span>📍</span> <strong>Bengaluru</strong></div>
                </div>
              </div>
            </div>
            
            <div className="je-detail-footer">
              <button 
                className="jed-btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete
              </button>
              <button 
                className="je-btn-close-detail"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedEntry && (
        <div className="je-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="je-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <h3>Delete Memory?</h3>
            </div>
            <div className="confirm-body">
              <p>Are you sure you want to delete <strong>"{selectedEntry.title}"</strong>? This action cannot be undone.</p>
            </div>
            <div className="confirm-footer">
              <button 
                className="confirm-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete"
                onClick={handleDeleteEntry}
                disabled={isDeleting}
              >
                {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="je-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="je-modal" onClick={(e) => e.stopPropagation()}>
            <div className="je-modal-header">
              <h2>📝 New Memory</h2>
              <button className="je-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            
            <div className="je-modal-content">
              <div className="je-form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="je-input"
                />
              </div>

              <div className="je-form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Give this memory a name..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="je-input"
                />
              </div>

              <div className="je-form-group">
                <label>Story</label>
                <textarea
                  placeholder="What made this moment special?"
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="je-textarea"
                  rows="5"
                />
              </div>

              <div className="je-form-group">
                <label>Mood</label>
                <div className="je-mood-selector">
                  {['😊', '😌', '🤩', '☕', '😍', '🎉'].map(mood => (
                    <button
                      key={mood}
                      className={`je-mood-btn ${formData.mood === mood ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, mood})}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="je-form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. peaceful, discovery, sunset"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="je-input"
                />
              </div>

              <div className="je-form-group">
                <label>Memory Photos</label>
                <label className="je-upload-btn">
                  📸 Add Photos ({uploadedImages.length}/5)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{display: 'none'}}
                  />
                </label>
                
                {uploadedImages.length > 0 && (
                  <div className="je-image-previews">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="je-preview-item">
                        <img src={img.data} alt={`Preview ${idx}`} />
                        <button
                          className="je-preview-remove"
                          onClick={() => removeImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="je-modal-footer">
              <button
                className="je-btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="je-btn-submit"
                onClick={handleSubmitEntry}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Saving...' : '💾 Save Memory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
