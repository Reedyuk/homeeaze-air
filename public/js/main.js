import { db, sessionId, trackEvent, collection, addDoc, serverTimestamp } from './firebase-config.js';

// ── Nav: shrink on scroll ──────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Scroll reveal ──────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Generic CTA tracking ───────────────────────────────────────
document.querySelectorAll('[data-track]').forEach(el => {
  el.addEventListener('click', () => {
    trackEvent(el.dataset.track, el.dataset.feature ?? el.dataset.price ?? null);
  });
});

// ── Feature card clicks → scroll to waitlist ──────────────────
document.querySelectorAll('.feature-card[data-feature]').forEach(card => {
  card.addEventListener('click', () => {
    trackEvent('feature_click', card.dataset.feature);
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Price card hover/click tracking ───────────────────────────
document.querySelectorAll('.price-card[data-price]').forEach(card => {
  card.addEventListener('click',      () => trackEvent('price_click', card.dataset.price));
  card.addEventListener('mouseenter', () => trackEvent('price_hover', card.dataset.price));
});

// ── Waitlist form submission ───────────────────────────────────
const form       = document.getElementById('waitlist-form');
const successMsg = document.getElementById('success-msg');
const submitBtn  = document.getElementById('submit-btn');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  if (!email) return;

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';

  const radio = name => form.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
  const checks = name => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
  const text   = name => (form.querySelector(`[name="${name}"]`)?.value ?? '').trim() || null;

  try {
    await addDoc(collection(db, 'waitlist'), {
      email,
      // Home environment
      homeType:         radio('homeType'),
      ventilation:      checks('ventilation'),
      rooms:            radio('rooms'),
      doorBehaviour:    radio('doorBehaviour'),
      // Air quality concerns
      iaqInterest:      text('iaqInterest'),
      iaqIssues:        checks('iaqIssues'),
      importantRooms:   checks('importantRooms'),
      // Technical setup
      usesHA:           radio('usesHA'),
      usesMQTT:         radio('usesMQTT'),
      hardwareComfort:  radio('hardwareComfort'),
      feedbackComfort:  radio('feedbackComfort'),
      // Expectations
      successDefinition: text('successDefinition'),
      whyPilot:         text('whyPilot'),
      // Meta
      sessionId,
      referrer:   document.referrer || 'direct',
      userAgent:  navigator.userAgent,
      timestamp:  serverTimestamp(),
    });

    trackEvent('waitlist_signup', radio('rooms'));

    form.style.display = 'none';
    successMsg.classList.remove('hidden');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error('Pilot application failed:', err);
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Apply for Pilot →';

    form.querySelector('.form-error')?.remove();
    const errEl = Object.assign(document.createElement('p'), {
      className: 'form-error',
      textContent: 'Something went wrong. Please try again.',
    });
    submitBtn.after(errEl);
  }
});

// ── Page view ─────────────────────────────────────────────────
trackEvent('page_view');
