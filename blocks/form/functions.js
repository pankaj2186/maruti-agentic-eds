import {validateKycDocumentNumber,
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
  initCibilFlow} from './scripts/form/personal-details';

/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Set serial number for the current instance of a repeatable panel.
 * @name setSerialNumber
 * @param {object} serialField  // field inside the panel
 * @param {scope} globals
 * @returns {number} returns the index+1 of the panel instance
 */
function setSerialNumber(serialField, globals) {
  // index of current panel instance (0-based)
  var index = globals.field.$parent.$index;
  // set value = index + 1
  globals.functions.setProperty(serialField, { value: index + 1 });
  return index + 1;
}



// eslint-disable-next-line import/prefer-default-export
export { getFullName, 
  days, 
  submitFormArrayToString,
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
