console.log("Скрипт загружен!");

const modal = document.getElementById('modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const closeElements = document.querySelectorAll('[data-close]');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

function showForm(formName) {
  if (formName === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    checkLoginButton();
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    checkRegisterButton();
  }
}

loginLink.addEventListener('click', function (e) {
  e.preventDefault();
  modal.classList.add('active');
  showForm('login');
});

registerLink.addEventListener('click', function (e) {
  e.preventDefault();
  modal.classList.add('active');
  showForm('register');
});

tabLogin.addEventListener('click', () => showForm('login'));
tabRegister.addEventListener('click', () => showForm('register'));

closeElements.forEach(el => {
  el.addEventListener('click', () => modal.classList.remove('active'));
});

// Функция очистки ошибок
function clearErrors(form) {
  form.querySelectorAll('.form__error').forEach(el => el.textContent = '');
  form.querySelectorAll('input').forEach(el => el.classList.remove('error'));
}

// Функция, которая красит рамку И вставляет текст напрямую
function markError(input, errorElementId, message) {
  input.classList.add('error');
  
  // Ищем элемент ошибки прямо внутри родителя этого инпута
  const parent = input.closest('.form__group');
  if (parent) {
    const errorEl = parent.querySelector('.form__error');
    if (errorEl) {
      errorEl.textContent = message; // Вставляем текст
      errorEl.style.display = 'block'; // Принудительно показываем
      errorEl.style.color = '#e53935'; // Принудительно красим в красный
    }
  }
}

function checkLoginButton() {
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;
  loginBtn.disabled = !(email && pwd);
}

function checkRegisterButton() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pwd = document.getElementById('reg-password').value;
  const pwd2 = document.getElementById('reg-password-repeat').value;
  const agree = document.getElementById('reg-agree').checked;

  registerBtn.disabled = !(name && email && phone && pwd && pwd2 && agree);
}

document.querySelectorAll('#login-form input').forEach(input => {
  input.addEventListener('input', checkLoginButton);
});
document.querySelectorAll('#register-form input').forEach(input => {
  input.addEventListener('input', checkRegisterButton);
});

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors(loginForm);

  const emailInput = loginForm.querySelector('[name="email"]');
  const passwordInput = loginForm.querySelector('[name="password"]');
  let isValid = true;

  if (!emailInput.value.trim()) {
    markError(emailInput, null, 'Введите email');
    isValid = false;
  }
  if (!passwordInput.value) {
    markError(passwordInput, null, 'Введите пароль');
    isValid = false;
  }

  if (isValid) {
    const data = { email: emailInput.value.trim(), password: passwordInput.value };
    console.log('Вход:', data);
    alert('Успешный вход! (данные в консоли)');
    modal.classList.remove('active');
    loginForm.reset();
    checkLoginButton();
  }
});

registerForm.addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors(registerForm);

  const nameInput = registerForm.querySelector('[name="name"]');
  const emailInput = registerForm.querySelector('[name="email"]');
  const phoneInput = registerForm.querySelector('[name="phone"]');
  const passwordInput = registerForm.querySelector('[name="password"]');
  const repeatInput = registerForm.querySelector('[name="passwordRepeat"]');
  const agreeInput = registerForm.querySelector('[name="agree"]');
  let isValid = true;

  const nameRegex = /^[А-Яа-яЁё\s\-]+$/;
  if (!nameRegex.test(nameInput.value.trim())) {
    markError(nameInput, null, 'Только русские буквы');
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    markError(emailInput, null, 'Некорректный email');
    isValid = false;
  }

  const phoneClean = phoneInput.value.replace(/\D/g, '');
  if (phoneClean.length < 10) {
    markError(phoneInput, null, 'Некорректный номер');
    isValid = false;
  }

  const pwd = passwordInput.value;
  if (pwd.length < 6 || /^\d+$/.test(pwd)) {
    markError(passwordInput, null, 'Мин. 6 символов (не только цифры)');
    isValid = false;
  }

  if (pwd !== repeatInput.value) {
    markError(repeatInput, null, 'Пароли не совпадают');
    isValid = false;
  }

  if (!agreeInput.checked) {
    const agreeParent = agreeInput.closest('.form__group');
    if (agreeParent) {
        const err = agreeParent.querySelector('.form__error');
        if (err) {
            err.textContent = 'Необходимо согласие';
            err.style.display = 'block';
            err.style.color = '#e53935';
        }
    }
    isValid = false;
  }

  if (isValid) {
    const data = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      password: pwd
    };
    console.log('Регистрация:', data);
    alert('Успешная регистрация! (данные в консоли)');
    modal.classList.remove('active');
    registerForm.reset();
    checkRegisterButton();
  }
});