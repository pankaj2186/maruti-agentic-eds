/**
 * Custom component: employee-search
 * Base type: text-input
 *
 * Typeahead autocomplete for employee/company search.
 * Calls /api/sitecore/loanoffer/companysearch on each input (debounced, min 3 chars).
 * Shows results as "cin - company_name". On selection, sets field value to company_name
 * and stores the CIN map in sessionStorage for the submit payload.
 */

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_MS = 300;
const API_ENDPOINT = '/api/sitecore/loanoffer/companysearch';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function searchCompanies(searchText) {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search_text: searchText }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data && data.company_list) || [];
  } catch (e) {
    return [];
  }
}

function hideDropdown(dropdown) {
  // eslint-disable-next-line no-param-reassign
  dropdown.innerHTML = '';
  dropdown.classList.remove('employee-search__dropdown--visible');
}

function updateCinMap(companies) {
  let existing = {};
  try {
    existing = JSON.parse(sessionStorage.getItem('_cinMap') || '{}');
  } catch (e) { /* ignore */ }
  const updated = { ...existing };
  companies.forEach((c) => {
    updated[c.company_name] = c.cin;
  });
  sessionStorage.setItem('_cinMap', JSON.stringify(updated));
}

function renderResults(dropdown, companies, input) {
  // eslint-disable-next-line no-param-reassign
  dropdown.innerHTML = '';

  if (!companies.length) {
    hideDropdown(dropdown);
    return;
  }

  updateCinMap(companies);

  companies.forEach((company) => {
    const li = document.createElement('li');
    li.classList.add('employee-search__option');
    li.setAttribute('role', 'option');
    li.textContent = `${company.cin} - ${company.company_name}`;

    li.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep focus on input during click
      // eslint-disable-next-line no-param-reassign
      input.value = company.company_name;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      hideDropdown(dropdown);
    });

    dropdown.append(li);
  });

  dropdown.classList.add('employee-search__dropdown--visible');
}

export default async function decorate(fieldDiv) {
  fieldDiv.classList.add('employee-search');

  const input = fieldDiv.querySelector('input');
  if (!input) return;

  // Wrap input so dropdown can be absolutely positioned below it
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('employee-search__input-wrapper');
  input.replaceWith(inputWrapper);
  inputWrapper.append(input);

  const dropdown = document.createElement('ul');
  dropdown.classList.add('employee-search__dropdown');
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Employee suggestions');
  inputWrapper.append(dropdown);

  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-haspopup', 'listbox');

  const handleInput = debounce(async (value) => {
    const searchText = value.trim();
    if (searchText.length < MIN_SEARCH_LENGTH) {
      hideDropdown(dropdown);
      return;
    }
    const companies = await searchCompanies(searchText);
    renderResults(dropdown, companies, input);
  }, DEBOUNCE_MS);

  input.addEventListener('input', (e) => handleInput(e.target.value));

  input.addEventListener('blur', () => {
    // Delay to allow the mousedown handler on list items to fire first
    setTimeout(() => hideDropdown(dropdown), 150);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= MIN_SEARCH_LENGTH && dropdown.children.length) {
      dropdown.classList.add('employee-search__dropdown--visible');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideDropdown(dropdown);
      input.blur();
    }
  });
}
