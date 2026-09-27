import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Check, 
  CheckCircle, 
  Trash2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModerationDashboardProps {
  onClose: () => void;
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({ onClose }) => {
  const { 
    moderationQueue, 
    approveContentUpload, 
    rejectContentUpload, 
    dmcaNotices, 
    executeDmcaTakedown,
    submitDmcaNotice,
    catalog
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'dmca'>('queue');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // DMCA intake modal state
  const [showDmcaIntake, setShowDmcaIntake] = useState<boolean>(false);
  const [dmcaTargetContentId, setDmcaTargetContentId] = useState<string>(catalog[0]?.id || '');
  const [dmcaClaimantName, setDmcaClaimantName] = useState<string>('');
  const [dmcaClaimantEmail, setDmcaClaimantEmail] = useState<string>('');
  const [dmcaCopyrightOwner, setDmcaCopyrightOwner] = useState<string>('');
  const [dmcaWorkDescription, setDmcaWorkDescription] = useState<string>('');

  const pendingModerationItems = moderationQueue.filter(m => m.status === 'pending');
  const historicalModerationItems = moderationQueue.filter(m => m.status !== 'pending');

  const handleApprove = (moderationId: string) => {
    approveContentUpload(moderationId);
  };

  const handleConfirmReject = () => {
    if (!rejectModalId) return;
    rejectContentUpload(rejectModalId, rejectReason || 'Incomplete legal provenance or missing license documentation.');
    setRejectModalId(null);
    setRejectReason('');
  };

  const handleCreateDmcaNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const target = catalog.find(c => c.id === dmcaTargetContentId);
    if (!target) return;

    submitDmcaNotice({
      contentId: target.id,
      contentTitle: target.title,
      claimantName: dmcaClaimantName,
      claimantEmail: dmcaClaimantEmail,
      copyrightOwner: dmcaCopyrightOwner,
      workDescription: dmcaWorkDescription
    });

    setShowDmcaIntake(false);
    setDmcaClaimantName('');
    setDmcaClaimantEmail('');
    setDmcaCopyrightOwner('');
    setDmcaWorkDescription('');
  };

  return (
    <div
      role="dialog"
      aria-label="Trust & Safety Moderation Dashboard"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9700,
        backgroundColor: 'rgba(5, 5, 8, 0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)'
        }}
        className="slide-up"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={26} color="var(--accent)" />
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                Trust & Safety / Legal Operations Dashboard
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Enforcing PRD §2 Rights Attestation, Moderation Queue & DMCA &lt;24h Takedown SLA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost tv-focusable"
            data-tv-focus="true"
            title="Close (Esc)"
            style={{ borderRadius: '50%', width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('queue')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'queue' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Upload Moderation Queue</span>
            {pendingModerationItems.length > 0 && (
              <span style={{ backgroundColor: '#ffffff', color: '#000000', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {pendingModerationItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dmca')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'dmca' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>DMCA Notice & Takedown SLA (<span style={{ color: '#4ade80' }}>&lt;24h Target</span>)</span>
            {dmcaNotices.filter(n => n.status === 'pending').length > 0 && (
              <span style={{ backgroundColor: '#f87171', color: '#ffffff', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {dmcaNotices.filter(n => n.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Moderation Queue */}
        {activeTab === 'queue' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Pending Uploads Requiring Rights Verification ({pendingModerationItems.length})
            </h3>

            {pendingModerationItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--surface-raised)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={36} color="#4ade80" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '15px', fontWeight: 600 }}>Moderation Queue is clear</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>All submitted master videos have been verified or resolved.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingModerationItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`badge badge-bucket-${item.content.bucket}`}>
                            Bucket: {item.content.bucket.toUpperCase()}
                          </span>
                          <span className={`badge badge-tier-${item.content.entitlementTier}`}>
                            {item.content.entitlementTier}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Submitted {new Date(item.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800 }}>
                          {item.content.title}
                        </h4>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="btn btn-primary tv-focusable"
                          data-tv-focus="true"
                          style={{ backgroundColor: '#16a34a', padding: '8px 16px', fontSize: '13px' }}
                        >
                          <Check size={16} />
                          Approve & Transcode
                        </button>

                        <button
                          onClick={() => setRejectModalId(item.id)}
                          className="btn btn-secondary tv-focusable"
                          data-tv-focus="true"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 16px', fontSize: '13px' }}
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Legal Rights Provenance Inspection Box */}
                    <div
                      style={{
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        border: '1px solid rgba(229, 73, 61, 0.25)',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                        PRD §2 Legal Attestation Record:
                      </div>
                      <div><strong>Attested By:</strong> {item.content.rightsAttestation?.attestedBy || 'System / Home Upload'}</div>
                      {item.content.bucket === 'licensed' && (
                        <div>
                          <strong style={{ color: '#60a5fa' }}>License Record ID:</strong> {item.content.licenseRecordId || 'MISSING'}{' '}
                          • <strong>Expiry:</strong> {item.content.rightsAttestation?.contractExpiryDate || 'Not specified'}
                        </div>
                      )}
                      <div><strong>Rights Holder Org:</strong> {item.content.rightsAttestation?.rightsHolderOrganization || 'Original Creator'}</div>
                      <div><strong>DMCA Warranty Accepted:</strong> {item.content.rightsAttestation?.dmcaAccepted ? 'Yes (Verified)' : 'N/A'}</div>
                      {item.content.rightsAttestation?.notes && (
                        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          Notes: "{item.content.rightsAttestation.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resolved History */}
            {historicalModerationItems.length > 0 && (
              <div style={{ marginTop: '36px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  Audit Trail & Resolved Reviews
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {historicalModerationItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: 'var(--surface-raised)',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <strong>{item.content.title}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>({item.content.bucket})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.status === 'approved' ? '#4ade80' : '#f87171'
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: DMCA Takedown & SLA Tracker */}
        {activeTab === 'dmca' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Statutory DMCA Notices & Takedown Execution
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  PRD §7 SLA Target: Received → Content Removed &lt; 24h.
                </p>
              </div>

              <button
                onClick={() => setShowDmcaIntake(true)}
                className="btn btn-secondary tv-focusable"
                data-tv-focus="true"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                + File New DMCA Notice
              </button>
            </div>

            {dmcaNotices.map(notice => (
              <div
                key={notice.id}
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: notice.status === 'pending' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span 
                        style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          backgroundColor: notice.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: notice.status === 'pending' ? '#f87171' : '#4ade80'
                        }}
                      >
                        {notice.status === 'pending' ? 'PENDING TAKEDOWN (<24h SLA)' : 'TAKEDOWN EXECUTED'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Received: {new Date(notice.receivedAt).toLocaleString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                      Target Title: {notice.contentTitle}
                    </h4>
                  </div>

                  {notice.status === 'pending' && (
                    <button
                      onClick={() => executeDmcaTakedown(notice.id)}
                      className="btn btn-primary tv-focusable"
                      data-tv-focus="true"
                      style={{ backgroundColor: '#dc2626', padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Trash2 size={14} />
                      Execute Statutory Takedown
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <p><strong>Claimant:</strong> {notice.claimantName} ({notice.claimantEmail})</p>
                  <p><strong>Alleged Copyright Owner:</strong> {notice.copyrightOwner}</p>
                  <p><strong>Claim Detail:</strong> {notice.workDescription}</p>
                  {notice.actionTaken && (
                    <p style={{ marginTop: '4px', color: '#4ade80', fontWeight: 600 }}>
                      Resolution: {notice.actionTaken}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DMCA Intake Modal */}
        {showDmcaIntake && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9800,
              padding: '20px'
            }}
          >
            <form
              onSubmit={handleCreateDmcaNotice}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--accent)',
                padding: '24px',
                maxWidth: '540px',
                width: '100%'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
                DMCA Statutory Notice Intake
              </h3>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Target Content in Catalog
                </label>
                <select
                  value={dmcaTargetContentId}
                  onChange={(e) => setDmcaTargetContentId(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                >
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.bucket})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Claimant Name
                </label>
                <input
                  type="text"
                  required
                  value={dmcaClaimantName}
                  onChange={(e) => setDmcaClaimantName(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Claimant Official Email
                </label>
                <input
                  type="email"
                  required
                  value={dmcaClaimantEmail}
                  onChange={(e) => setDmcaClaimantEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Copyright Owner / Studio Represented
                </label>
                <input
                  type="text"
                  required
                  value={dmcaCopyrightOwner}
                  onChange={(e) => setDmcaCopyrightOwner(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Description of Alleged Infringement
                </label>
                <textarea
                  required
                  rows={3}
                  value={dmcaWorkDescription}
                  onChange={(e) => setDmcaWorkDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowDmcaIntake(false)}
                  className="btn btn-secondary tv-focusable"
                  data-tv-focus="true"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary tv-focusable"
                  data-tv-focus="true"
                >
                  File Notice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rejection Prompt Modal */}
        {rejectModalId && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9800,
              padding: '20px'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                padding: '24px',
                maxWidth: '480px',
                width: '100%'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', color: '#f87171' }}>
                Reject Upload & Log Reason
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Specify the compliance or legal rights deficiency causing this rejection:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unverified third-party content without valid distribution license agreement..."
                style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-raised)', color: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setRejectModalId(null)}
                  className="btn btn-secondary tv-focusable"
                  data-tv-focus="true"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="btn btn-primary tv-focusable"
                  data-tv-focus="true"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
