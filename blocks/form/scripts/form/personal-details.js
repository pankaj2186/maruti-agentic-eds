/**
 * Calculates age in months from a date of birth string.
 * @name calculateAgeInMonths Calculate Age In Months
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} Age in months
 */
function calculateAgeInMonths(dob) {
  if (!dob) return 0;
  const dobDate = new Date(dob);
  const today = new Date();
  const years = today.getFullYear() - dobDate.getFullYear();
  const months = today.getMonth() - dobDate.getMonth();
  return (years * 12) + months;
}

/**
 * Reads the __RequestVerificationToken cookie for CSRF protection.
 * @returns {string} The anti-forgery token, or empty string if not found
 */
function getAntiForgeryToken() {
  try {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('__RequestVerificationToken=')) {
        return decodeURIComponent(cookie.substring('__RequestVerificationToken='.length));
      }
    }
  } catch (e) {
    // token not available
  }
  return '';
}

/**
 * Converts API date format YYYY-MM-DD to form display format MM/DD/YYYY.
 * @param {string} dob - Date in YYYY-MM-DD format
 * @returns {string} Date in MM/DD/YYYY format
 */
function convertDobToFormFormat(dob) {
  const parts = String(dob).split('-');
  if (parts.length !== 3) return dob;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

/**
 * Centralised 401 / session-timeout handler. Detects dealer vs customer journey
 * from sessionStorage and redirects to the correct login page.
 * @name handleSessionTimeout Handle Session Timeout
 */
function handleSessionTimeout() {
  if (sessionStorage.getItem('enquiry_id')) {
    window.location.assign('/dealer-login');
  } else {
    localStorage.removeItem('mobile');
    window.location.assign('/login');
  }
}

/**
 * Unified success/error toast dispatcher. Fires a custom:toast event on the
 * form with type ('success' | 'error') and message for the frontend to render.
 * @name showToast Show Toast
 * @param {string} type - Toast type: 'success' or 'error'
 * @param {string} message - Message text to display
 * @param {scope} globals - Globals object
 */
function showToast(type, message, globals) {
  globals.functions.dispatchEvent(globals.form, 'custom:toast', { type, message });
}

/**
 * Sets a form field value, skipping null/undefined/empty values.
 * @param {object} field - AEM form field reference
 * @param {*} value - Value to set
 * @param {scope} globals - Globals object
 */
function setFormField(field, value, globals) {
  if (field && value !== null && value !== undefined && value !== '') {
    globals.functions.setProperty(field, { value: String(value) });
  }
}

/**
 * Auto-converts a text field value to uppercase on every change. Used for
 * firstName, lastName, middleName, panNumber and kycDocumentNumber.
 * @name sanitizeTextField Sanitize Text Field
 * @param {object} textField - Text input field to sanitize
 * @param {scope} globals - Globals object
 */
function sanitizeTextField(textField, globals) {
  const raw = textField.$value || '';
  const upper = raw.toUpperCase();
  if (upper !== raw) {
    globals.functions.setProperty(textField, { value: upper });
  }
}

/**
 * Strips any non-numeric characters from a numeric field value. Prevents
 * decimals, commas and alphabetic input in currency / EMI fields.
 * @name sanitizeNumericField Sanitize Numeric Field
 * @param {object} numericField - Numeric text input field to sanitize
 * @param {scope} globals - Globals object
 */
function sanitizeNumericField(numericField, globals) {
  const raw = String(numericField.$value || '');
  const sanitized = raw.replace(/[^0-9]/g, '');
  if (sanitized !== raw) {
    globals.functions.setProperty(numericField, { value: sanitized });
  }
}

/**
 * Sets all personal-details panels to read-only, preventing further edits.
 * Called after prefill when the enquiry is in a locked state.
 * @name setPersonalDetailsReadOnly Set Personal Details Read Only
 * @param {scope} globals - Globals object
 */
function setPersonalDetailsReadOnly(globals) {
  const readOnly = { readOnly: true };
  const f = globals.form;
  globals.functions.setProperty(f.personalInfoPanel, readOnly);
  globals.functions.setProperty(f.employmentTypePanel, readOnly);
  globals.functions.setProperty(f.selfEmployedPanel, readOnly);
  globals.functions.setProperty(f.salariedPanel, readOnly);
  globals.functions.setProperty(f.commonFieldsPanel, readOnly);
  globals.functions.setProperty(f.disclaimersPanel, readOnly);
}

/**
 * Validates the KYC document number based on the selected document type and marks
 * the field as invalid with a document-specific error message if the format is wrong.
 * @name validateKycDocumentNumber Validate KYC Document Number
 * @param {object} kycDocumentTypeField - KYC document type dropdown field
 * @param {object} kycDocumentNumberField - KYC document number text field
 * @param {scope} globals - Globals object
 */
function validateKycDocumentNumber(kycDocumentTypeField, kycDocumentNumberField, globals) {
  const docType = kycDocumentTypeField.$value;
  const docNumber = kycDocumentNumberField.$value;

  if (!docType || !docNumber) return;

  const upperDocNumber = String(docNumber).toUpperCase();

  const patterns = {
    50000: /^[A-PR-WY][1-9][0-9] ?[0-9]{4}[1-9]$/,
    50001: /^[A-Z]{2}[0-9]{2}(19|20)[0-9]{2}[0-9]{7}$/,
    50002: /^[A-Z0-9]{9,10}$/,
  };

  const errorMessages = {
    50000: 'Enter a valid passport number (e.g. A1234567)',
    50001: 'Enter a valid driving licence number (e.g. MH0120201234567)',
    50002: 'Enter a valid voter ID (9-10 alphanumeric characters)',
  };

  const pattern = patterns[docType];
  if (!pattern) return;

  if (!pattern.test(upperDocNumber)) {
    globals.functions.markFieldAsInvalid(kycDocumentNumberField.$id, {
      useId: true,
      message: errorMessages[docType] || 'Invalid document number format',
    });
  }
}

/**
 * Validates that work/business experience does not exceed the applicant's age.
 * Marks the years field as invalid if the total experience in months exceeds age in months.
 * @name validateExperienceVsAge Validate Experience vs Age
 * @param {object} expYearsField - Experience years dropdown field
 * @param {object} expMonthsField - Experience months dropdown field
 * @param {object} dobField - Date of birth date field
 * @param {string} errorMsg - Error message to display on validation failure
 * @param {scope} globals - Globals object
 */
function validateExperienceVsAge(expYearsField, expMonthsField, dobField, errorMsg, globals) {
  const expYears = Number(expYearsField.$value) || 0;
  const expMonths = Number(expMonthsField.$value) || 0;
  const dob = dobField.$value;
  if (!dob) return;
  const ageInMonths = calculateAgeInMonths(dob);
  const totalExpMonths = (expYears * 12) + expMonths;
  if (totalExpMonths > ageInMonths) {
    globals.functions.markFieldAsInvalid(expYearsField.$id, { useId: true, message: errorMsg });
  }
}

/**
 * Validates that the current EMI does not exceed the average monthly income (self-employed).
 * Marks the EMI field as invalid if EMI is greater than average monthly income.
 * @name validateEmiVsMonthlyIncome Validate EMI vs Monthly Income
 * @param {object} emiField - Current EMI text field
 * @param {object} incomeField - Average monthly income text field
 * @param {scope} globals - Globals object
 */
function validateEmiVsMonthlyIncome(emiField, incomeField, globals) {
  const emi = Number(emiField.$value) || 0;
  const income = Number(incomeField.$value) || 0;
  if (emi <= 0 || income <= 0) return;
  if (emi > income) {
    globals.functions.markFieldAsInvalid(emiField.$id, {
      useId: true,
      message: 'EMI cannot be greater than Average Monthly Income',
    });
  }
}

/**
 * Validates that the annual EMI (EMI × 12) does not exceed the gross annual salary (salaried).
 * Marks the EMI field as invalid if annual EMI is greater than gross annual salary.
 * @name validateEmiVsAnnualSalary Validate EMI vs Annual Salary
 * @param {object} emiField - Current EMI text field
 * @param {object} salaryField - Gross annual salary text field
 * @param {scope} globals - Globals object
 */
function validateEmiVsAnnualSalary(emiField, salaryField, globals) {
  const emi = Number(emiField.$value) || 0;
  const grossSalary = Number(salaryField.$value) || 0;
  if (emi <= 0 || grossSalary <= 0) return;
  const annualEmi = emi * 12;
  if (annualEmi > grossSalary) {
    globals.functions.markFieldAsInvalid(emiField.$id, {
      useId: true,
      message: 'EMI cannot be greater than Gross Salary',
    });
  }
}

/**
 * Validates that the average monthly income is within the allowed range (> 0 and < 5,00,000).
 * Marks the income field as invalid with an appropriate message if out of range.
 * @name validateAvgMonthlyIncome Validate Average Monthly Income
 * @param {object} incomeField - Average monthly income text field
 * @param {scope} globals - Globals object
 */
function validateAvgMonthlyIncome(incomeField, globals) {
  const income = Number(incomeField.$value) || 0;
  if (income <= 0) {
    globals.functions.markFieldAsInvalid(incomeField.$id, {
      useId: true,
      message: 'Average monthly income should be greater than zero rupee',
    });
    return;
  }
  if (income >= 500000) {
    globals.functions.markFieldAsInvalid(incomeField.$id, {
      useId: true,
      message: 'Average monthly income cannot be greater than or equal to 5 lakh rupee',
    });
  }
}

/**
 * Validates that the gross annual salary meets the minimum threshold of ₹25,000.
 * Marks the salary field as invalid if the value is below the minimum.
 * @name validateGrossSalary Validate Gross Salary
 * @param {object} salaryField - Gross annual salary text field
 * @param {scope} globals - Globals object
 */
function validateGrossSalary(salaryField, globals) {
  const salary = Number(salaryField.$value) || 0;
  if (salary > 0 && salary < 25000) {
    globals.functions.markFieldAsInvalid(salaryField.$id, {
      useId: true,
      message: 'Gross Salary cannot be less than \u20B9 25000',
    });
  }
}

// ─── Prefill Helpers ──────────────────────────────────────────────────────────

function applyPrefill(data, globals) {
  const c = (data.customer_data && data.customer_data.customer) || {};
  const e = data.enquiry || {};
  const f = globals.form;

  setFormField(f.personalInfoPanel.firstName, (c.first_name || '').toUpperCase(), globals);
  setFormField(f.personalInfoPanel.middleName, (c.middle_name || '').toUpperCase(), globals);
  setFormField(f.personalInfoPanel.lastName, (c.last_name || '').toUpperCase(), globals);
  setFormField(f.personalInfoPanel.mobileNumber, c.mobile, globals);
  setFormField(f.personalInfoPanel.email, c.email, globals);
  setFormField(
    f.personalInfoPanel.dateOfBirth,
    c.dob ? convertDobToFormFormat(c.dob) : null,
    globals,
  );
  setFormField(f.personalInfoPanel.gender, c.gender, globals);
  setFormField(
    f.personalInfoPanel.panNumber,
    (c.pan_number || '').toUpperCase() || null,
    globals,
  );
  setFormField(f.employmentTypePanel.employmentType, c.employment_type, globals);
  setFormField(f.salariedPanel.employerName, c.employer, globals);
  setFormField(f.salariedPanel.otherEmployerName, c.others_employer, globals);
  setFormField(f.salariedPanel.workExperienceYears, c.work_experience_years, globals);
  setFormField(f.salariedPanel.workExperienceMonths, c.work_experience_months, globals);
  setFormField(f.salariedPanel.grossAnnualSalary, c.annual_salary, globals);
  setFormField(f.salariedPanel.netAnnualIncome, c.net_annual_income, globals);
  setFormField(f.selfEmployedPanel.itrAvailability, c.itr_availability, globals);
  setFormField(
    f.selfEmployedPanel.professionalSection.subEmploymentTypePro,
    c.sub_employment_id,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.professionalSection.proWorkExpYears,
    c.self_work_experience_in_years,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.professionalSection.proWorkExpMonths,
    c.self_work_experience_in_months,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.subEmploymentTypeBiz,
    c.sub_employment_id,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.businessTenureYears,
    c.tenure_of_business_in_years,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.businessTenureMonths,
    c.tenure_of_business_in_months,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.panCardAvailability,
    c.pancard_available,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.kycSection.kycDocumentType,
    c.kyc_document,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.kycSection.kycDocumentNumber,
    c.kyc_document_id,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.farmerSection.noOfDairyCattle,
    c.no_of_dairy_cattle,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.farmerSection.totalAgriLand,
    c.total_agri_land,
    globals,
  );
  setFormField(
    f.selfEmployedPanel.businessSection.farmerSection.carOwnership,
    c.car_owner,
    globals,
  );
  setFormField(f.selfEmployedPanel.avgMonthlyIncome, c.avg_monthly_income, globals);
  setFormField(f.commonFieldsPanel.currentEmi, c.current_emi, globals);
  setFormField(f.commonFieldsPanel.residenceType, c.residence_type, globals);
  setFormField(f.commonFieldsPanel.residingSince, c.residing_since, globals);

  // Trigger employmentType change to activate correct panel visibility rules
  if (c.employment_type) {
    globals.functions.dispatchEvent(f.employmentTypePanel.employmentType, 'change');
  }

  // Apply read-only mode if enquiry is locked
  const lockedStatuses = [10053, 10054, 10059, 10060];
  if (e.mspin === true || lockedStatuses.indexOf(Number(e.status)) !== -1) {
    setPersonalDetailsReadOnly(globals);
  }
}

async function loadPrefillDataAsync(globals) {
  const enquiryId = sessionStorage.getItem('enquiry_id');
  const mobile = localStorage.getItem('mobile');

  if (enquiryId) {
    // Dealer journey
    const res = await globals.functions.request({
      url: '/api/sitecore/FmpDealerAPI/DealerCustomerData',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enquiry_id: enquiryId }),
    });
    if (!res || res.status === 401) { handleSessionTimeout(); return; }
    const data = res.body || {};
    if (data.customer_took_over) { window.location.assign('/dealer-dashboard'); return; }
    applyPrefill(data, globals);
  } else if (mobile) {
    // Customer journey
    const res = await globals.functions.request({
      url: '/api/sitecore/TrvFmpApi/CheckActiveEnquiry',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });
    if (!res || res.status === 401) { handleSessionTimeout(); return; }
    if (res.status === 400) return;
    const data = res.body || {};
    if (data.status === false || data.Message) { handleSessionTimeout(); return; }
    applyPrefill(data, globals);
  } else {
    handleSessionTimeout();
  }
}

// ─── Submit Helpers ───────────────────────────────────────────────────────────

function buildSubmitPayload(globals) {
  const f = globals.form;
  const employmentType = f.employmentTypePanel.employmentType.$value || '';
  const itrAvailability = f.selfEmployedPanel.itrAvailability.$value || '';
  const panCardAvailability = f.selfEmployedPanel.businessSection.panCardAvailability.$value || '';
  const subEmploymentTypeBiz = f.selfEmployedPanel.businessSection.subEmploymentTypeBiz.$value || '';

  const payload = {
    mobile: localStorage.getItem('mobile') || '',
    enquiry_id: sessionStorage.getItem('enquiry_id') || '',
    first_name: f.personalInfoPanel.firstName.$value || '',
    middle_name: f.personalInfoPanel.middleName.$value || '',
    last_name: f.personalInfoPanel.lastName.$value || '',
    email: f.personalInfoPanel.email.$value || '',
    dob: f.personalInfoPanel.dateOfBirth.$value || '',
    gender: f.personalInfoPanel.gender.$value || '',
    employment_type: employmentType,
    current_emi: f.commonFieldsPanel.currentEmi.$value || '',
    residence_type: f.commonFieldsPanel.residenceType.$value || '',
    residing_since: f.commonFieldsPanel.residingSince.$value || '',
  };

  const isSelfEmployed = ['200002', '440001', '440002'].indexOf(employmentType) !== -1;
  const isSalaried = ['440007', '440008'].indexOf(employmentType) !== -1;

  if (isSelfEmployed) {
    payload.avg_monthly_income = f.selfEmployedPanel.avgMonthlyIncome.$value || '';

    if (itrAvailability === '1') {
      payload.sub_employment_id = f.selfEmployedPanel.professionalSection.subEmploymentTypePro.$value || '';
      payload.self_work_experience_in_years = f.selfEmployedPanel.professionalSection.proWorkExpYears.$value || '';
      payload.self_work_experience_in_months = f.selfEmployedPanel.professionalSection.proWorkExpMonths.$value || '';
      payload.pan_number = (f.personalInfoPanel.panNumber.$value || '').toUpperCase();
      payload.pancard_available = 'YES';
    } else {
      payload.sub_employment_id = f.selfEmployedPanel.businessSection.subEmploymentTypeBiz.$value || '';
      payload.tenure_of_business_in_years = f.selfEmployedPanel.businessSection.businessTenureYears.$value || '';
      payload.tenure_of_business_in_months = f.selfEmployedPanel.businessSection.businessTenureMonths.$value || '';
      payload.pancard_available = panCardAvailability || 'NO';

      if (panCardAvailability === 'YES') {
        payload.pan_number = (f.personalInfoPanel.panNumber.$value || '').toUpperCase();
      } else {
        payload.pan_number = null;
        payload.kyc_document = f.selfEmployedPanel.businessSection.kycSection.kycDocumentType.$value || '';
        payload.kyc_document_id = f.selfEmployedPanel.businessSection.kycSection.kycDocumentNumber.$value || '';
      }

      if (subEmploymentTypeBiz === '440004') {
        payload.no_of_dairy_cattle = f.selfEmployedPanel.businessSection.farmerSection.noOfDairyCattle.$value || '';
        payload.total_agri_land = f.selfEmployedPanel.businessSection.farmerSection.totalAgriLand.$value || '';
        payload.car_owner = f.selfEmployedPanel.businessSection.farmerSection.carOwnership.$value || '';
      }
    }
  } else if (isSalaried) {
    payload.employer_type = employmentType;
    payload.employer = f.salariedPanel.employerName.$value || '';
    payload.others_employer = f.salariedPanel.otherEmployerName.$value || '';
    payload.work_experience_years = f.salariedPanel.workExperienceYears.$value || '';
    payload.work_experience_months = f.salariedPanel.workExperienceMonths.$value || '';
    payload.annual_salary = f.salariedPanel.grossAnnualSalary.$value || '';
    payload.net_annual_income = f.salariedPanel.netAnnualIncome.$value || '';
    payload.pan_number = (f.personalInfoPanel.panNumber.$value || '').toUpperCase();

    const cin = sessionStorage.getItem('_companyCin') || '';
    if (cin) payload.company_cin = cin;
  }

  return payload;
}

async function callFormApi(endpoint, payload, globals) {
  const token = getAntiForgeryToken();
  const headers = { 'Content-Type': 'application/json' };
  const csrfHeader = '__RequestVerificationToken';
  if (token) headers[csrfHeader] = token;
  return globals.functions.request({
    url: endpoint,
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

async function handleCompanySearchAsync(employerNameField, globals) {
  const searchText = (employerNameField.$value || '').trim();
  if (searchText.length < 3) return;

  const res = await globals.functions.request({
    url: '/api/sitecore/loanoffer/companysearch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search_text: searchText }),
  });

  if (!res) return;
  if (res.status === 401) { handleSessionTimeout(); return; }
  if (!res.ok) return;

  const companyList = (res.body && res.body.company_list) || [];
  const cinMap = {};
  const enumValues = companyList.map((c) => {
    cinMap[c.company_name] = c.cin;
    return c.company_name;
  });
  const enumNames = enumValues.slice();
  enumValues.push('Others');
  enumNames.push('Others');

  sessionStorage.setItem('_cinMap', JSON.stringify(cinMap));
  globals.functions.setProperty(globals.form.salariedPanel.employerName, {
    enum: enumValues,
    enumNames,
  });
}

async function initCibilFlowAsync(globals) {
  const f = globals.form;
  const payload = {
    enquiry_id: sessionStorage.getItem('enquiry_id') || '',
    pan_number: (f.personalInfoPanel.panNumber.$value || '').toUpperCase(),
    first_name: f.personalInfoPanel.firstName.$value || '',
    last_name: f.personalInfoPanel.lastName.$value || '',
    email: f.personalInfoPanel.email.$value || '',
    mobile: localStorage.getItem('mobile') || f.personalInfoPanel.mobileNumber.$value || '',
    dob: f.personalInfoPanel.dateOfBirth.$value || '',
    cibil_info: {},
    is_co_applicant: false,
  };

  const res = await globals.functions.request({
    url: '/api/sitecore/LoanOffer/CibilData',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res) return;

  if (res.status === 401) {
    handleSessionTimeout();
    return;
  }

  if (!res.ok) {
    const errMsg = (res.body && res.body.error_message) || 'An error occurred. Please try again.';
    showToast('error', errMsg, globals);
    return;
  }

  const data = res.body || {};

  if (data.cibil_challenge) {
    globals.functions.dispatchEvent(globals.form, 'custom:cibilChallenge', data);
    return;
  }

  // CIBIL check passed — navigate to loan offers
  window.location.assign('/loan-offers');
}

/**
 * Initiates the CIBIL data check flow immediately after a successful form
 * submission. Builds the CIBIL payload, calls the CibilData API, handles
 * challenge scenarios, and navigates to loan offers on success.
 * @name initCibilFlow Init CIBIL Flow
 * @param {scope} globals - Globals object
 */
function initCibilFlow(globals) {
  initCibilFlowAsync(globals);
}

async function handleSavePartialAsync(globals) {
  const payload = buildSubmitPayload(globals);
  const res = await callFormApi('/api/sitecore/Customer/SavePartialPersonalDetails', payload, globals);
  if (!res) return;
  if (res.status === 401) { handleSessionTimeout(); return; }
  if (res.ok) {
    showToast('success', 'Personal details saved successfully', globals);
  } else {
    const errMsg = (res.body && res.body.error_message) || 'Save failed. Please try again.';
    showToast('error', errMsg, globals);
  }
}

async function handleSubmitAsync(globals) {
  const payload = buildSubmitPayload(globals);
  const res = await callFormApi('/api/sitecore/Customer/SavePersonalDetails', payload, globals);
  if (!res) return;
  if (res.status === 401) { handleSessionTimeout(); return; }
  if (res.ok) {
    initCibilFlow(globals);
  } else {
    const errMsg = (res.body && res.body.error_message) || 'Submission failed. Please try again.';
    showToast('error', errMsg, globals);
  }
}

// ─── Prefill Public Functions ─────────────────────────────────────────────────

/**
 * Triggers prefill on form load: detects customer vs dealer journey, calls the
 * appropriate API, maps response to all form fields, and applies read-only mode
 * when the enquiry is locked.
 * @name loadPrefillData Load Prefill Data
 * @param {scope} globals - Globals object
 */
function loadPrefillData(globals) {
  loadPrefillDataAsync(globals);
}

// ─── Save / Submit Public Functions ──────────────────────────────────────────

/**
 * Searches for employers matching the typed text and updates the employerName
 * dropdown options with the API results. Requires 3+ characters to trigger.
 * @name handleCompanySearch Handle Company Search
 * @param {object} employerNameField - Employer name text input field
 * @param {scope} globals - Globals object
 */
function handleCompanySearch(employerNameField, globals) {
  handleCompanySearchAsync(employerNameField, globals);
}

/**
 * Captures the CIN for the selected employer and stores it in sessionStorage
 * for inclusion in the submit payload.
 * @name handleCompanySelected Handle Company Selected
 * @param {object} employerNameField - Employer name field after selection
 * @param {scope} globals - Globals object
 */
function handleCompanySelected(employerNameField, globals) {
  const selectedName = employerNameField.$value || '';
  let cinMap = {};
  try { cinMap = JSON.parse(sessionStorage.getItem('_cinMap') || '{}'); } catch (e) { /* ignore */ }
  sessionStorage.setItem('_companyCin', cinMap[selectedName] || '');
  setFormField(globals.form.salariedPanel.companyCin, cinMap[selectedName] || '', globals);
}

/**
 * Partially saves the personal details form without requiring disclaimer checkboxes.
 * @name handleSavePartial Handle Save Partial
 * @param {scope} globals - Globals object
 */
function handleSavePartial(globals) {
  handleSavePartialAsync(globals);
}

/**
 * Fully submits the personal details form after all validations pass.
 * @name handleSubmit Handle Submit
 * @param {scope} globals - Globals object
 */
function handleSubmit(globals) {
  handleSubmitAsync(globals);
}

export {
  validateKycDocumentNumber,
  calculateAgeInMonths,
  validateExperienceVsAge,
  validateEmiVsMonthlyIncome,
  validateEmiVsAnnualSalary,
  validateAvgMonthlyIncome,
  validateGrossSalary,
  loadPrefillData,
  setPersonalDetailsReadOnly,
  handleCompanySearch,
  handleCompanySelected,
  handleSavePartial,
  handleSubmit,
  showToast,
  handleSessionTimeout,
  sanitizeTextField,
  sanitizeNumericField,
  initCibilFlow,
};
