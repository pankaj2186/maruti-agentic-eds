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

const marutiCarModels = [
  {
    id: 'NEW CELERIO',
    name: 'New Celerio',
    source: '/content/dam/forms-poc/maruti/celerio.png',
    variants: ['LXi', 'VXi', 'ZXi', 'ZXi+', 'VXi CNG'],
    colors: [
      'Solid Fire Red',
      'Speedy Blue',
      'Silky Silver',
      'Glistening Grey',
      'Arctic White',
      'Caffeine Brown',
    ],
  },
  {
    id: 'NEW ERTIGA',
    name: 'New Ertiga',
    source: '/content/dam/forms-poc/maruti/ertiga.png',
    variants: ['LXi', 'VXi', 'ZXi', 'ZXi+', 'VXi CNG', 'ZXi CNG'],
    colors: [
      'Pearl Metallic Auburn Red',
      'Magma Grey',
      'Pearl Arctic White',
      'Splendid Silver',
      'Prime Oxford Blue',
      'Dignity Brown',
    ],
  },
  {
    id: 'NEW SWIFT',
    name: 'New Swift',
    source: '/content/dam/forms-poc/maruti/swift.png',
    variants: [
      'LXi',
      'VXi',
      'VXi (O)',
      'ZXi',
      'ZXi+',
      'VXi CNG / ZXi CNG', // or split: 'VXi CNG', 'ZXi CNG'
    ],
    colors: [
      'Solid Fire Red',
      'Pearl Arctic White',
      'Metallic Silky Silver',
      'Metallic Magma Grey',
      'Pearl Midnight Blue',
      'Dual-tone: Red/Black',
      'Dual-tone: Blue/Black',
    ],
  },
  {
    id: 'NEW WAGONR',
    name: 'New Wagon R',
    source: '/content/dam/forms-poc/maruti/wagon-r.png',
    variants: ['LXi 1.0', 'VXi 1.0', 'ZXi 1.2', 'ZXi+ 1.2', 'VXi CNG'],
    colors: [
      'Poolside Blue',
      'Magma Grey',
      'Silky Silver',
      'Nutmeg Brown',
      'Autumn Orange',
      'Arctic White',
    ],
  },
  {
    id: 'S_PRESSO',
    name: 'S-Presso',
    source: '/content/dam/forms-poc/maruti/s-presso.png',
    variants: ['Std', 'LXi', 'VXi', 'VXi+', 'VXi CNG'],
    colors: [
      'Solid Fire Red',
      'Sizzle Orange',
      'Starry Blue',
      'Granite Grey',
      'Silky Silver',
      'Arctic White',
    ],
  },
  {
    id: 'VICTORIS',
    name: 'Victoris (Arena SUV)', // or 'New Victoris' per your copy
    source: '/content/dam/forms-poc/maruti/victoris.png',
    variants: [
      'LXi',
      'VXi',
      'ZXi',
      'ZXi (O)',
      'ZXi+',
      'ZXi+ (O)',
    ],
    colors: [
      'Nexa Blue / Deep Blue',
      'Splendid Silver',
      'Grandeur Grey',
      'Arctic White',
      'Opulent Red',
      'Dual-tone: Black roof variants',
    ],
  },
];

/**
 * Set serial number for the current instance of a repeatable panel.
 * @name setSerialNumber
 * @param {object} serialField  // field inside the panel
 * @param {scope} globals
 * @returns {string}
 */
function setSerialNumber(serialField, globals) {
  // index of current panel instance (0-based)
  var index = globals.field.$parent.$index;
  // set value = index + 1
  globals.functions.setProperty(serialField, { value: index + 1 });
  return String(index + 1);
}

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
 * Populate variant dropdown based on selected car model from marutiCarModels.
 * @name populateVariants
 * @param {string} selectedModel  // value from the model dropdown (e.g. 'NEW CELERIO')
 * @param {object} variantDropdown  // variant dropdown field reference
 * @param {scope} globals
 */
function populateVariants(selectedModel, variantDropdown, globals) {
  const model = marutiCarModels.find((m) => m.id === selectedModel);
  if (!model) {
    globals.functions.setProperty(variantDropdown, { enum: [], enumNames: [] });
    globals.functions.setProperty(variantDropdown, { value: '' });
    return;
  }
  const enumValues = model.variants;
  const enumNames = model.variants;

  globals.functions.setProperty(variantDropdown, { enum: enumValues, enumNames });
  globals.functions.setProperty(variantDropdown, { value: enumValues[0] });
}

/**
 * Populate color dropdown based on selected car model from marutiCarModels.
 * @name populateColors
 * @param {string} selectedModel  // value from the model dropdown (e.g. 'NEW CELERIO')
 * @param {object} colorDropdown  // color dropdown field reference
 * @param {scope} globals
 */
function populateColors(selectedModel, colorDropdown, globals) {
  const model = marutiCarModels.find((m) => m.id === selectedModel);
  if (!model) {
    globals.functions.setProperty(colorDropdown, { enum: [], enumNames: [] });
    globals.functions.setProperty(colorDropdown, { value: '' });
    return;
  }
  const enumValues = model.colors;
  const enumNames = model.colors;

  globals.functions.setProperty(colorDropdown, { enum: enumValues, enumNames });
  globals.functions.setProperty(colorDropdown, { value: enumValues[0] });
}

/**
 * Checks if the form is opened on a mobile browser.
 * @name mobileBrowser Detect Mobile Browser
 * @returns {boolean} true if mobile browser, false if desktop
 */
function mobileBrowser() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  var isSmallScreen = window.innerWidth <= 768;
  console.log("isMobile :"+isMobile);
  return isMobile || isSmallScreen;
}

// eslint-disable-next-line import/prefer-default-export
export { 
  getFullName, 
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
  populateVariants,
  populateColors,
  mobileBrowser,
  setSerialNumber
};
