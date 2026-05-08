/**
 * SIF File Validator
 * Validates all SIF file data according to Mashreq bank specifications and WPS guidelines
 */

/**
 * Validates IBAN format (UAE IBAN: AE + 2 check digits + 3 bank code + 14 account)
 * @param {string} iban - IBAN to validate
 * @param {string} country - Country code (default: 'AE')
 * @returns {Object} { isValid: boolean, message: string, code: string }
 */
export function validateIBAN(iban, country = 'AE') {
  if (!iban) {
    return {
      isValid: false,
      message: 'IBAN is required',
      code: 'IBAN_EMPTY',
    };
  }

  const ibanStr = (iban || '').toString().trim().toUpperCase();

  if (country === 'AE') {
    // UAE IBAN: AE + 21 digits (23 total)
    const uaeIbanRegex = /^AE\d{21}$/;
    if (!uaeIbanRegex.test(ibanStr)) {
      return {
        isValid: false,
        message: 'UAE IBAN must be in format: AE + 21 digits (e.g., AE070331234567890123456)',
        code: 'IBAN_INVALID_FORMAT',
      };
    }

    // Validate check digits using IBAN checksum algorithm
    const ibanNumeric = ibanStr.substring(4) + ibanStr.substring(0, 4);
    const ibanReordered = ibanNumeric.replace(/[A-Z]/g, (char) => (10 + char.charCodeAt(0) - 65).toString());

    let mod97 = 0;
    for (let i = 0; i < ibanReordered.length; i++) {
      mod97 = (mod97 * 10 + parseInt(ibanReordered[i], 10)) % 97;
    }

    if (mod97 !== 1) {
      return {
        isValid: false,
        message: 'IBAN check digits are invalid',
        code: 'IBAN_INVALID_CHECKSUM',
      };
    }
  }

  return {
    isValid: true,
    message: 'IBAN is valid',
    code: 'IBAN_VALID',
  };
}

/**
 * Validates bank routing code (9 digits for UAE)
 * @param {string} code - Routing code to validate
 * @returns {Object} { isValid: boolean, message: string, code: string }
 */
export function validateRoutingCode(code) {
  if (!code) {
    return {
      isValid: false,
      message: 'Routing code is required',
      code: 'ROUTING_EMPTY',
    };
  }

  const codeStr = (code || '').toString().trim();

  if (!/^\d{9}$/.test(codeStr)) {
    return {
      isValid: false,
      message: 'Routing code must be exactly 9 digits',
      code: 'ROUTING_INVALID_FORMAT',
    };
  }

  return {
    isValid: true,
    message: 'Routing code is valid',
    code: 'ROUTING_VALID',
  };
}

/**
 * Validates AED amount (positive, max 2 decimals, up to 15 digits before decimal)
 * @param {number} amount - Amount to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid: boolean, message: string, code: string }
 */
export function validateAEDAmount(amount, fieldName = 'Amount') {
  if (amount === null || amount === undefined || amount === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
      code: 'AMOUNT_EMPTY',
    };
  }

  const num = parseFloat(amount);

  if (Number.isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number`,
      code: 'AMOUNT_NOT_NUMBER',
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      message: `${fieldName} must be positive`,
      code: 'AMOUNT_NEGATIVE',
    };
  }

  // Check decimal places (max 2)
  const decimalPart = amount.toString().split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return {
      isValid: false,
      message: `${fieldName} can have maximum 2 decimal places`,
      code: 'AMOUNT_DECIMALS',
    };
  }

  // Check max 15 digits before decimal
  const integerPart = Math.floor(num).toString();
  if (integerPart.length > 15) {
    return {
      isValid: false,
      message: `${fieldName} is too large (max 15 digits)`,
      code: 'AMOUNT_TOO_LARGE',
    };
  }

  return {
    isValid: true,
    message: `${fieldName} is valid`,
    code: 'AMOUNT_VALID',
  };
}

/**
 * Validates salary pay dates (must be valid, start <= end, within ±1 year from today)
 * @param {string} startDate - Start date (ISO 8601 format)
 * @param {string} endDate - End date (ISO 8601 format)
 * @returns {Object} { isValid: boolean, message: string, code: string }
 */
export function validatePayDates(startDate, endDate) {
  if (!startDate) {
    return {
      isValid: false,
      message: 'Start date is required',
      code: 'START_DATE_EMPTY',
    };
  }

  if (!endDate) {
    return {
      isValid: false,
      message: 'End date is required',
      code: 'END_DATE_EMPTY',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (Number.isNaN(start.getTime())) {
    return {
      isValid: false,
      message: 'Start date is invalid format',
      code: 'START_DATE_INVALID',
    };
  }

  if (Number.isNaN(end.getTime())) {
    return {
      isValid: false,
      message: 'End date is invalid format',
      code: 'END_DATE_INVALID',
    };
  }

  if (start > end) {
    return {
      isValid: false,
      message: 'Start date must be before or equal to end date',
      code: 'DATE_ORDER_INVALID',
    };
  }

  // Check ±1 year from today
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const oneYearFuture = new Date();
  oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1);

  if (start < oneYearAgo || end > oneYearFuture) {
    return {
      isValid: false,
      message: 'Dates must be within ±1 year from today',
      code: 'DATE_RANGE_EXCEEDED',
    };
  }

  return {
    isValid: true,
    message: 'Pay dates are valid',
    code: 'DATES_VALID',
  };
}

/**
 * Validates a single employee EDR (Employee Data Record)
 * @param {Object} employee - Employee data
 * @returns {Object} { isValid: boolean, errors: Array<{field, message, code}> }
 */
export function validateEmployeeRecord(employee) {
  const errors = [];

  // Check required fields
  if (!employee.emiratesId) {
    errors.push({
      field: 'emiratesId',
      message: 'Emirates ID is required',
      code: 'EMIRATEID_REQUIRED',
    });
  } else if (!/^\d{15}$/.test((employee.emiratesId || '').toString().trim())) {
    errors.push({
      field: 'emiratesId',
      message: 'Emirates ID must be 15 digits',
      code: 'EMIRATEID_INVALID',
    });
  }

  if (!employee.fullName || !employee.fullName.trim()) {
    errors.push({
      field: 'fullName',
      message: 'Full name is required',
      code: 'NAME_REQUIRED',
    });
  }

  if (!employee.accountNumber || !employee.accountNumber.toString().trim()) {
    errors.push({
      field: 'accountNumber',
      message: 'Account number is required',
      code: 'ACCOUNT_REQUIRED',
    });
  }

  if (!employee.salary && employee.salary !== 0) {
    errors.push({
      field: 'salary',
      message: 'Salary is required',
      code: 'SALARY_REQUIRED',
    });
  } else {
    const salaryValidation = validateAEDAmount(employee.salary, 'Salary');
    if (!salaryValidation.isValid) {
      errors.push({
        field: 'salary',
        message: salaryValidation.message,
        code: salaryValidation.code,
      });
    }
  }

  if (employee.allowance !== undefined && employee.allowance !== null) {
    const allowanceValidation = validateAEDAmount(employee.allowance, 'Allowance');
    if (!allowanceValidation.isValid) {
      errors.push({
        field: 'allowance',
        message: allowanceValidation.message,
        code: allowanceValidation.code,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates entire SIF file data
 * @param {Array} employees - Array of employee records
 * @param {Object} companyInfo - Company information
 * @returns {Object} { isValid: boolean, errors: Array<{type, message, code, field, details}> }
 */
export function validateSIFFile(employees, companyInfo) {
  const errors = [];

  // Company info validation
  if (!companyInfo.employerOrgNo || !companyInfo.employerOrgNo.toString().trim()) {
    errors.push({
      type: 'company',
      field: 'employerOrgNo',
      message: 'Employer organization number is required',
      code: 'EMPLOYER_ORG_REQUIRED',
    });
  }

  if (!companyInfo.organizationName || !companyInfo.organizationName.trim()) {
    errors.push({
      type: 'company',
      field: 'organizationName',
      message: 'Organization name is required',
      code: 'ORG_NAME_REQUIRED',
    });
  }

  // IBAN validation
  const ibanValidation = validateIBAN(companyInfo.iban, 'AE');
  if (!ibanValidation.isValid) {
    errors.push({
      type: 'company',
      field: 'iban',
      message: ibanValidation.message,
      code: ibanValidation.code,
    });
  }

  // Routing code validation
  const routingValidation = validateRoutingCode(companyInfo.routingCode);
  if (!routingValidation.isValid) {
    errors.push({
      type: 'company',
      field: 'routingCode',
      message: routingValidation.message,
      code: routingValidation.code,
    });
  }

  // Employees validation
  if (!employees || employees.length === 0) {
    errors.push({
      type: 'employees',
      message: 'At least one employee is required',
      code: 'NO_EMPLOYEES',
    });
  } else {
    employees.forEach((employee, index) => {
      const empValidation = validateEmployeeRecord(employee);
      if (!empValidation.isValid) {
        empValidation.errors.forEach((error) => {
          errors.push({
            type: 'employee',
            employeeIndex: index,
            employeeName: employee.fullName,
            ...error,
          });
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalErrors: errors.length,
      companyErrors: errors.filter((e) => e.type === 'company').length,
      employeeErrors: errors.filter((e) => e.type === 'employee').length,
    },
  };
}
