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
  submitBtn.textContent = 'Joining…';

  const rooms      = form.querySelector('input[name="rooms"]:checked')?.value ?? null;
  const pricePoint = form.querySelector('input[name="pricePoint"]:checked')?.value ?? null;
  const concern    = form.querySelector('select[name="concern"]').value || null;
  const features   = [...form.querySelectorAll('input[name="features"]:checked')].map(cb => cb.value);

  try {
    await addDoc(collection(db, 'waitlist'), {
      email,
      rooms,
      features,
      pricePoint,
      concern,
      sessionId,
      referrer:   document.referrer || 'direct',
      userAgent:  navigator.userAgent,
      timestamp:  serverTimestamp(),
    });

    trackEvent('waitlist_signup', pricePoint);

    form.style.display = 'none';
    successMsg.classList.remove('hidden');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error('Waitlist submission failed:', err);
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Join the Waitlist →';

    // Remove any previous error before showing a new one
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
