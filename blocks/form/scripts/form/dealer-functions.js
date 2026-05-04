
const marutiCarModels = [
  {
    id: 'NEW CELERIO',
    name: 'New Celerio',
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
 * Fetch Query Parameter.
 * @name fetchFromQueryParams Fetch From Query Params
 * @param {string} paramName     // parameter name available in query param
 * @param {scope} globals
 * @returns {string}
 */
function fetchFromQueryParams(paramName, globals) {
 var qp = {};
  try {
    qp = globals.form.$properties.queryParams || {};
  } catch(e) {
    try {
      qp = globals.form.properties.queryParams || {};
    } catch(e2) {
      // not available
    }
  }
  // keys are lowercased by addRequestContextToForm
  var key = paramName ? paramName.toLowerCase() : '';
  return qp[key] || '';
}


/**
 * Prefill form fields from URL query parameters.
 * Call this on the form's "initialize" event.
 *
 * @name prefillFromQueryParams Prefill From Query Params
 * @param {object} firstNameField     // field for firstname
 * @param {object} lastNameField      // field for lastname
 * @param {object} modelField         // field for car model
 * @param {object} mobileField        // field for phone
 * @param {object} emailField         // field for email
 * @param {object} genderField        // field for gender
 * @param {object} panField           // field for pan
 * @param {object} regNumberField     // field for reg number
 * @param {scope} globals
 */
function prefillFromQueryParams(firstNameField, lastNameField, modelField, mobileField, emailField, genderField, panField, regNumberField, globals) {
var qp = {};
  try {
    qp = globals.form.$properties.queryParams || {};
  } catch(e) {
    try {
      qp = globals.form.properties.queryParams || {};
    } catch(e2) {
      // not available
    }
  }

  var name      = qp['n'] || '';
  var model     = qp['m'] || '';
  var phone     = qp['p'] || '';
  var email     = qp['e'] || '';
  var gender    = qp['g'] || '';
  var pan       = qp['pan'] || '';
  var regnumber = qp['r'] || '';

  // Split name into firstName and lastName
  if (name) {
    var trimmed = name.trim();
    var spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex > -1) {
      globals.functions.setProperty(firstNameField, { value: trimmed.substring(0, spaceIndex) });
      globals.functions.setProperty(lastNameField, { value: trimmed.substring(spaceIndex + 1).trim() });
    } else {
      globals.functions.setProperty(firstNameField, { value: trimmed });
    }
  }

  if (model) {
    globals.functions.setProperty(modelField, { value: model });
  }

  if (phone) {
    globals.functions.setProperty(mobileField, { value: phone });
  }

  if (email) {
    globals.functions.setProperty(emailField, { value: email });
  }

  if (pan) {
    globals.functions.setProperty(panField, { value: pan });
  }

  if (regnumber) {
    globals.functions.setProperty(regNumberField, { value: regnumber });
  }

  if (gender) {
    globals.functions.setProperty(genderField, { value: gender });
  }
}

/**
 * Generates a random enquiry number and sets it in the given field.
 * @name setEnquiryNumber Set Enquiry Number
 * @param {object} enquiryField
 * @param {scope} globals
 */
function setEnquiryNumber(enquiryField, globals) {
  var digits = Math.floor(100000 + Math.random() * 900000);
  var enqNumber = 'ENQ26' + digits;
  globals.functions.setProperty(enquiryField, { value: enqNumber });
}

/**
 * Checks if the form is opened on a mobile browser.
 * @name mobileBrowser Detect Mobile Browser
 * @returns {boolean} true if mobile browser, false if desktop
 */
function mobileBrowser() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  //var isSmallScreen = window.innerWidth <= 768;
  console.log("isMobile :"+isMobile);
  return isMobile;
}

/**                                                                                                                                                                                                                               
* Get JSON Property                                                                                                                                                                                                                 
* @name fetchJsonProperty Extracts a property value from an JSON string                                                                                                                                                    
* @param {string} jsonString JSON string representing the object                                                                                                                                               
* @param {string} key Property key to extract (e.g. "empCode", "empName", "desgCode", "desgDesc")    
* @param {scope} globals
* @return {string}                                                                                                                                                                                                               
*/                                                                                                                                                                                                                               
function fetchJsonProperty(jsonString, key, globals) {                                                                                                                                                                                                                           
    const emp = JSON.parse(jsonString);                                                                                                                                                                                           
    return emp[key] ?? '';                                                                                                                                                                                                                                                                                                                                                                                                                             
}       

/**
 * Masks an Aadhaar card number, keeping only the last 4 digits visible.
 * @name maskAadhaar Mask Aadhaar Number
 * @param {string} aadhaarNumber - 12-digit Aadhaar number (with or without spaces)
 * @returns {string} Masked number in format: **** **** 1234
 */
function maskAadhaar(aadhaarNumber) {
  if (!aadhaarNumber) return '';
  const digits = String(aadhaarNumber).replace(/[\s-]/g, '');
  if (digits.length !== 12 || !/^\d{12}$/.test(digits)) return aadhaarNumber;
  const masked = '****' + '****' + digits.slice(-4);
  return masked.replace(/(.{4})(.{4})(.{4})/, '$1 $2 $3');
}

export {
  setSerialNumber,
  populateVariants,
  populateColors,
  mobileBrowser,
  prefillFromQueryParams,
  setEnquiryNumber,
  fetchFromQueryParams,
  fetchJsonProperty,
  maskAadhaar
};
