const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
});
const form = document.querySelector('#quote-form');
let submitting = false;
form.addEventListener('submit', async (event) => {
 event.preventDefault();
 if (submitting || !form.reportValidity()) return;
 const button = form.querySelector('button[type="submit"]');
 const status = document.querySelector('#form-status');
 submitting = true;
 button.disabled = true;
 status.textContent = 'Sending your request…';
 try {
  const response = await fetch('/api/send-email', {
   method: 'POST', headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(Object.fromEntries(new FormData(form)))
  });
  if (!response.ok) throw new Error('Request failed');
  form.reset();
  window.location.assign('/thank-you');
 } catch {
  status.textContent = 'We couldn’t send your request. Please try again or call (954) 393-3479.';
 } finally {
  submitting = false;
  button.disabled = false;
 }
});
