import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  Sparkles 
} from 'lucide-react';
import { EntitlementTier } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface SubscriptionModalProps {
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  const { 
    subscription, 
    upgradeSubscription, 
    cancelSubscription 
  } = useApp();

  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectPlan = (tier: EntitlementTier) => {
    upgradeSubscription(tier);
    setSuccessMessage(`Successfully updated your plan to ${tier.toUpperCase()}! Entitlements are active immediately.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCancel = () => {
    cancelSubscription();
    setConfirmCancel(false);
    setSuccessMessage('Your subscription will not renew at the end of the current billing cycle. (No dark patterns)');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div
      role="dialog"
      aria-label="Account and Subscription Management"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
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
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '36px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)'
        }}
        className="slide-up"
      >
        <button
          onClick={onClose}
          className="tv-focusable"
          data-tv-focus="true"
          title="Close (Esc)"
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#262626',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '8px' }}>
            <Sparkles size={20} />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              StreamHub Subscriptions
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900 }}>
            Choose the Perfect Streaming Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Cancel anytime with zero fees. Watch seamlessly on Android TV, Fire TV, Roku, and Web.
          </p>
        </div>

        {/* Feedback message banner */}
        {successMessage && (
          <div 
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.15)', 
              border: '1px solid rgba(34, 197, 94, 0.4)', 
              borderRadius: '6px', 
              padding: '12px 16px', 
              color: '#4ade80',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '24px'
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '36px'
          }}
        >
          {SUBSCRIPTION_PLANS.map(plan => {
            const isCurrent = subscription.planId === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: '10px',
                  border: isCurrent 
                    ? '2px solid var(--accent)' 
                    : plan.highlight 
                    ? '1px solid rgba(229, 73, 61, 0.4)' 
                    : '1px solid var(--border-subtle)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: plan.highlight ? '0 8px 30px rgba(229, 73, 61, 0.15)' : 'none'
                }}
              >
                {/* Active badge */}
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: '12px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    CURRENT ACTIVE PLAN
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {plan.priceFormatted}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  <strong>Max Quality:</strong> {plan.maxQuality} • <strong>Screens:</strong> {plan.concurrentStreams}
                </div>

                {/* Features checklist */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginBottom: '24px' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--accent)" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent && !subscription.cancelAtPeriodEnd}
                  className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} tv-focusable`}
                  data-tv-focus="true"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {isCurrent 
                    ? (subscription.cancelAtPeriodEnd ? 'Reactivate Plan' : 'Active Plan') 
                    : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Current Subscription Management & No Dark Patterns Cancellation */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CreditCard size={16} />
              <span>Payment Method: {subscription.paymentMethod}</span>
              <span>•</span>
              <span>Next billing: {new Date(subscription.expiresAt).toLocaleDateString()}</span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>
                Cancellation scheduled: Access remains until {new Date(subscription.expiresAt).toLocaleDateString()}.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {confirmCancel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#f87171' }}>Confirm cancel?</span>
                <button
                  onClick={handleCancel}
                  className="btn btn-primary tv-focusable"
                  data-tv-focus="true"
                  style={{ backgroundColor: '#dc2626', padding: '6px 14px', fontSize: '12px' }}
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="btn btn-secondary tv-focusable"
                  data-tv-focus="true"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="btn btn-ghost tv-focusable"
                data-tv-focus="true"
                style={{ fontSize: '13px', color: 'var(--text-muted)' }}
              >
                Cancel Subscription
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              <X size={15} />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
