'use strict';

/* ===== Элементы ===== */
const modal = document.getElementById('modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const logoutLink = document.getElementById('logout-link');
const navGuest = document.getElementById('nav-guest');
const navUser = document.getElementById('nav-user');
const userNameEl = document.getElementById('user-name');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const agreeInput = document.getElementById('reg-agree');
const agreeLabel = document.getElementById('agree-label');
const phoneInput = document.getElementById('reg-phone');

/* ===== Модальное окно ===== */
function showForm(name) {
  const isLogin = name === 'login';
  loginForm.classList.toggle('hidden', !isLogin);
  registerForm.classList.toggle('hidden', isLogin);
  tabLogin.classList.toggle('active', isLogin);
  tabRegister.classList.toggle('active', !isLogin);
  updateButtons();
}

function openModal(name) {
  showForm(name);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

loginLink.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
registerLink.addEventListener('click', (e) => { e.preventDefault(); openModal('register'); });
tabLogin.addEventListener('click', () => showForm('login'));
tabRegister.addEventListener('click', () => showForm('register'));

document.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

/* ===== Состояние пользователя ===== */
const STORAGE_KEY = 'ads_user';
function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function writeStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}
let currentUser = readStorage(STORAGE_KEY);
function renderUser() {
  const isAuth = Boolean(currentUser);
  navGuest.classList.toggle('hidden', isAuth);
  navUser.classList.toggle('hidden', !isAuth);
  if (isAuth) userNameEl.textContent = currentUser.name || currentUser.email;
}
function signIn(user) {
  currentUser = user;
  writeStorage(STORAGE_KEY, user);
  renderUser();
}
logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  currentUser = null;
  writeStorage(STORAGE_KEY, null);
  renderUser();
});

/* ===== Ошибки ===== */
function setError(input, message) {
  const field = input.closest('.field');
  field.classList.add('field--error');
  field.querySelector('label').textContent = message;
}
function clearError(input) {
  const field = input.closest('.field');
  if (!field || !field.classList.contains('field--error')) return;
  const label = field.querySelector('label');
  field.classList.remove('field--error');
  label.textContent = label.dataset.label;
}
function clearAllErrors(form) {
  form.querySelectorAll('.field input').forEach(clearError);
  agreeLabel.classList.remove('form__agree--error');
}
document.querySelectorAll('.field input').forEach((input) => {
  input.addEventListener('input', () => clearError(input));
});

/* ===== Валидация ===== */
function applyCustomRules(input) {
  input.setCustomValidity('');
  if (input.form !== registerForm || !input.value) return;
  if (input.name === 'password' && /^\d+$/.test(input.value)) {
    input.setCustomValidity(input.dataset.invalid);
  }
  if (input.name === 'passwordRepeat' && input.value !== registerForm.elements.password.value) {
    input.setCustomValidity(input.dataset.invalid);
  }
}
function validateField(input) {
  applyCustomRules(input);
  if (input.checkValidity()) return true;
  const { valueMissing } = input.validity;
  setError(input, valueMissing ? input.dataset.required : input.dataset.invalid);
  return false;
}
function validateForm(form) {
  clearAllErrors(form);
  const results = [...form.querySelectorAll('.field input')].map(validateField);
  if (form === registerForm && !agreeInput.checkValidity()) {
    agreeLabel.classList.add('form__agree--error');
    results.push(false);
  }
  return results.every(Boolean);
}

/* ===== Кнопки ===== */
function updateButtons() {
  const loginEmail = loginForm.elements.email.value.trim();
  const loginPass = loginForm.elements.password.value;
  loginBtn.disabled = !(loginEmail && loginPass);

  const regName = registerForm.elements.name.value.trim();
  const regEmail = registerForm.elements.email.value.trim();
  const regPhone = registerForm.elements.phone.value.trim();
  const regPass = registerForm.elements.password.value;
  const regRepeat = registerForm.elements.passwordRepeat.value;
  
  registerBtn.disabled = !(regName && regEmail && regPhone && regPass && regRepeat && agreeInput.checked);
}

loginForm.addEventListener('input', updateButtons);
registerForm.addEventListener('input', updateButtons);
agreeInput.addEventListener('change', () => {
  if (agreeInput.checked) agreeLabel.classList.remove('form__agree--error');
  updateButtons();
});

/* ===== УМНАЯ МАСКА (Просто пробелы между ТВОИМИ цифрами) ===== */
phoneInput.addEventListener('input', () => {
  // Берем только цифры, которые ввел пользователь (убираем всё остальное)
  const digits = phoneInput.value.replace(/\D/g, '');
  
  if (!digits) {
    phoneInput.value = '';
    return;
  }

  // Разделяем пробелами: первые 1 цифра, потом по 3, потом по 2, потом по 2
  let out = '';
  if (digits.length > 0) out += digits.substring(0, 1);
  if (digits.length > 1) out += ' ' + digits.substring(1, 4);
  if (digits.length > 4) out += ' ' + digits.substring(4, 7);
  if (digits.length > 7) out += ' ' + digits.substring(7, 9);
  if (digits.length > 9) out += ' ' + digits.substring(9, 11);

  phoneInput.value = out.trim();
});

/* ===== Отправка ===== */
function collectData(form) {
  const data = Object.fromEntries(new FormData(form));
  ['password', 'passwordRepeat'].forEach((key) => {
    if (key in data) data[key] = '*'.repeat(data[key].length);
  });
  if ('agree' in data) data.agree = true;
  return data;
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(loginForm)) return;
  console.log('Вход:', collectData(loginForm));
  signIn({ email: loginForm.elements.email.value.trim(), name: 'Пользователь' });
  closeModal();
  loginForm.reset();
  updateButtons();
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm(registerForm)) return;
  console.log('Регистрация:', collectData(registerForm));
  signIn({ email: registerForm.elements.email.value.trim(), name: registerForm.elements.name.value.trim() });
  closeModal();
  registerForm.reset();
  updateButtons();
});

document.querySelector('.btn--more').addEventListener('click', () => {
  document.querySelector('.ads-grid').classList.add('is-expanded');
});

renderUser();
updateButtons();