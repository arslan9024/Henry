/**
 * SIF File Generation
 * Generates SIF (Salary Information File) content in Mashreq format
 * Exports functions for SIF and TXT file generation with download capability
 */

/**
 * Generates EDR (Employee Data Record) line for single employee
 * Format: EDR,employerOrgNo,sequenceNo,emiratesId,fullName,accountNumber,salary,allowance,salary+allowance,00
 * @param {Object} employee - Employee data
 * @param {number} sequenceNo - Employee sequence number
 * @param {string} employerOrgNo - Employer organization number
 * @returns {string} EDR line
 */
function generateEDRLine(employee, sequenceNo, employerOrgNo) {
  const { emiratesId = '', fullName = '', accountNumber = '', salary = 0, allowance = 0 } = employee;

  const totalAmount = (parseFloat(salary) || 0) + (parseFloat(allowance) || 0);

  // Format: EDR,orgNo,seq,emiratesId,name,account,salary,allowance,total,00
  return [
    'EDR',
    employerOrgNo,
    String(sequenceNo).padStart(6, '0'),
    emiratesId,
    fullName,
    accountNumber,
    parseFloat(salary).toFixed(2),
    parseFloat(allowance).toFixed(2),
    totalAmount.toFixed(2),
    '00', // Status code (00 = active)
  ].join(',');
}

/**
 * Generates SCR (Summary Control Record) line with totals
 * Format: SCR,employerOrgNo,totalEmployees,totalSalary,totalAllowance,total,checksum
 * @param {Object} scr - SCR data with totals
 * @returns {string} SCR line
 */
function generateSCRLine(scr) {
  const {
    employerOrgNo = '',
    totalEmployees = 0,
    totalSalary = 0,
    totalAllowance = 0,
    total = 0,
    checksum = 0,
  } = scr;

  return [
    'SCR',
    employerOrgNo,
    String(totalEmployees).padStart(6, '0'),
    parseFloat(totalSalary).toFixed(2),
    parseFloat(totalAllowance).toFixed(2),
    parseFloat(total).toFixed(2),
    String(checksum).padStart(10, '0'),
  ].join(',');
}

/**
 * Calculates SCR (Summary Control Record) with totals and checksum
 * Checksum: sum of (employeeCount + total salary + total allowance) mod 10^8
 * @param {Array} employees - Array of employee records
 * @param {Object} companyInfo - Company information
 * @returns {Object} SCR data with totals
 */
export function calculateSCRSummary(employees, companyInfo) {
  const totalEmployees = employees.length;
  const totalSalary = employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
  const totalAllowance = employees.reduce((sum, emp) => sum + (parseFloat(emp.allowance) || 0), 0);
  const total = totalSalary + totalAllowance;

  // Calculate checksum: sum of totals mod 10^8
  const checksumValue =
    (totalEmployees + Math.floor(totalSalary * 100) + Math.floor(totalAllowance * 100)) % 100000000;

  return {
    employerOrgNo: companyInfo.employerOrgNo,
    totalEmployees,
    totalSalary,
    totalAllowance,
    total,
    checksum: checksumValue,
  };
}

/**
 * Generates complete SIF file content (FHR + EDR lines + SCR)
 * FHR: File header record with timestamp
 * EDR: Employee data records (one per employee)
 * SCR: Summary control record with totals
 * @param {Array} employees - Array of employee records
 * @param {Object} companyInfo - Company information
 * @returns {string} SIF file content
 */
export function generateSIFContent(employees, companyInfo) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .substring(0, 14); // YYYYMMDDHHMMSS
  const employerOrgNo = companyInfo.employerOrgNo || '';

  // File Header Record (FHR)
  const fhrLine = [
    'FHR',
    employerOrgNo,
    'WPS',
    timestamp,
    '001', // Version
  ].join(',');

  // Employee Data Records (EDR)
  const edrLines = employees.map((emp, index) => generateEDRLine(emp, index + 1, employerOrgNo));

  // Summary Control Record (SCR)
  const scr = calculateSCRSummary(employees, companyInfo);
  const scrLine = generateSCRLine(scr);

  // Combine all lines
  const lines = [fhrLine, ...edrLines, scrLine];
  return lines.join('\n');
}

/**
 * Generates SIF filename (13-char employer ID + timestamp)
 * Format: EMPLOYER_NO_YYYYMMDDHHMMSS.SIF
 * @param {string} employerOrgNo - Employer organization number
 * @param {Date} timestamp - Timestamp for filename (default: now)
 * @returns {string} Filename
 */
export function generateSIFFilename(employerOrgNo, timestamp = new Date()) {
  const empNo = String(employerOrgNo).padEnd(13, '0').substring(0, 13);
  const ts = timestamp
    .toISOString()
    .replace(/[-:T.]/g, '')
    .substring(0, 14); // YYYYMMDDHHMMSS
  return `${empNo}_${ts}.SIF`;
}

/**
 * Generates TXT verification file (human-readable format)
 * @param {Array} employees - Array of employee records
 * @param {Object} companyInfo - Company information
 * @param {string} filename - Filename for reference
 * @returns {string} TXT content
 */
export function generateTXTVerification(employees, companyInfo, filename) {
  const now = new Date().toLocaleString();
  const scr = calculateSCRSummary(employees, companyInfo);

  const content = [];
  content.push('================================================================================');
  content.push('WPS SALARY INFORMATION FILE - VERIFICATION REPORT');
  content.push('================================================================================');
  content.push('');
  content.push(`Generated: ${now}`);
  content.push(`File: ${filename}`);
  content.push('');
  content.push('--- COMPANY INFORMATION ---');
  content.push(`Employer Org Number: ${companyInfo.employerOrgNo}`);
  content.push(`Organization Name: ${companyInfo.organizationName}`);
  content.push(`IBAN: ${companyInfo.iban}`);
  content.push(`Routing Code: ${companyInfo.routingCode}`);
  content.push(`Account Number: ${companyInfo.accountNumber}`);
  content.push(`Account Holder: ${companyInfo.accountHolderName}`);
  content.push(`Email: ${companyInfo.email}`);
  content.push(`Phone: ${companyInfo.phone}`);
  content.push('');
  content.push('--- SUMMARY ---');
  content.push(`Total Employees: ${scr.totalEmployees}`);
  content.push(`Total Salary: AED ${scr.totalSalary.toFixed(2)}`);
  content.push(`Total Allowance: AED ${scr.totalAllowance.toFixed(2)}`);
  content.push(`Total Payment: AED ${scr.total.toFixed(2)}`);
  content.push(`Checksum: ${scr.checksum}`);
  content.push('');
  content.push('--- EMPLOYEE RECORDS ---');
  content.push('');

  employees.forEach((emp, index) => {
    content.push(`Employee ${index + 1}:`);
    content.push(`  Emirates ID: ${emp.emiratesId}`);
    content.push(`  Name: ${emp.fullName}`);
    content.push(`  Account: ${emp.accountNumber}`);
    content.push(`  Salary: AED ${(parseFloat(emp.salary) || 0).toFixed(2)}`);
    if (emp.allowance) {
      content.push(`  Allowance: AED ${(parseFloat(emp.allowance) || 0).toFixed(2)}`);
    }
    content.push(
      `  Total: AED ${((parseFloat(emp.salary) || 0) + (parseFloat(emp.allowance) || 0)).toFixed(2)}`,
    );
    content.push('');
  });

  content.push('================================================================================');
  content.push('END OF VERIFICATION REPORT');
  content.push('================================================================================');

  return content.join('\n');
}

/**
 * Downloads SIF file (triggers browser download)
 * @param {string} content - SIF file content
 * @param {string} filename - Filename for download
 * @returns {void}
 */
export function downloadSIFFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Downloads TXT verification file (triggers browser download)
 * @param {string} content - TXT file content
 * @param {string} filename - Filename for download (with .TXT extension)
 * @returns {void}
 */
export function downloadTXTFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Main export function: generates and downloads SIF file
 * @param {Array} employees - Array of employee records
 * @param {Object} companyInfo - Company information
 * @param {Object} options - { downloadSif: boolean, downloadTxt: boolean }
 * @returns {Promise} Resolves with {success, sifFilename, txtFilename}
 */
export async function generateAndDownloadSIFFile(employees, companyInfo, options = {}) {
  try {
    const { downloadSif = true, downloadTxt = false } = options;

    // Generate content
    const sifContent = generateSIFContent(employees, companyInfo);
    const sifFilename = generateSIFFilename(companyInfo.employerOrgNo);

    // Download SIF if requested
    if (downloadSif) {
      downloadSIFFile(sifContent, sifFilename);
    }

    // Generate and download TXT if requested
    let txtFilename = null;
    if (downloadTxt) {
      const txtContent = generateTXTVerification(employees, companyInfo, sifFilename);
      txtFilename = sifFilename.replace('.SIF', '_VERIFICATION.TXT');
      downloadTXTFile(txtContent, txtFilename);
    }

    return {
      success: true,
      sifFilename,
      txtFilename,
      sifContent,
    };
  } catch (error) {
    console.error('Error generating SIF file:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
