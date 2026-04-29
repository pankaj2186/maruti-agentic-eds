
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
 * Prefill form fields from URL query parameters.
 * Call this on the form's "initialize" event.
 *
 * @name prefillFromQueryParams Prefill From Query Params
 * @param {object} firstNameField     // field for firstname
 * @param {object} lastNameField     // field for lastname
 * @param {object} cityField     // field for city
 * @param {object} modelField    // field for car model
 * @param {object} mobileField   // field for phone
 * @param {object} emailField    // field for email
 * @param {object} genderField   // field for gender
 * @param {object} panField      // field for pan
 * @param {object} regNumberField      // field for reg number
 * @param {scope} globals
 */
function prefillFromQueryParams(firstNameField, lastNameField, cityField, modelField, mobileField, emailField, genderField, panField, regNumberField, globals) {

  // Read query parameters using the built-in getQueryParameter
  var name  = new URLSearchParams(globalThis.location.search).get('n');
  var city  = new URLSearchParams(globalThis.location.search).get('c');
  var model = new URLSearchParams(globalThis.location.search).get('m');
  var phone = new URLSearchParams(globalThis.location.search).get('p');
  var email = new URLSearchParams(globalThis.location.search).get('e');
  var gender = new URLSearchParams(globalThis.location.search).get('g');
  var pan = new URLSearchParams(globalThis.location.search).get('pan');
  var regnumber = new URLSearchParams(globalThis.location.search).get('r');

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

  // Set dropdown value — the value must match one of the enum options
  if (city) {
    globals.functions.setProperty(cityField, { value: city });
  }

  // Set another dropdown
  if (model) {
    globals.functions.setProperty(modelField, { value: model });
  }

  // Set phone field
  if (phone) {
    globals.functions.setProperty(phoneField, { value: phone });
  }

  // Set pan field
  if (pan) {
    globals.functions.setProperty(panField, { value: pan });
  }

  // Set email field
  if (email) {
    globals.functions.setProperty(emailField, { value: email });
  }

  // Set registration number field
  if (regnumber) {
    globals.functions.setProperty(regNumberField, { value: regnumber });
  }

  // Radio button — value must match one of the enum options exactly (e.g. "Male", "Female")
  if (gender) {
    globals.functions.setProperty(genderField, { value: gender });
  }

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

export {
  setSerialNumber,
  populateVariants,
  populateColors,
  mobileBrowser,
  prefillFromQueryParams
};
