import { createSlice } from '@reduxjs/toolkit';

/**
 * WPS SIF Payroll State Management
 * Manages SIF file templates, current file, employees, and generation history
 * Redux slice for payroll and salary file generation
 */

const initialState = {
  // Templates: array of saved SIF file templates
  templates: [],

  // Current SIF file being edited
  currentFile: {
    templateId: null,
    templateName: '',
    companyInfo: {
      employerOrgNo: '',
      organizationName: '',
      bankCode: '',
      routingCode: '',
      accountNumber: '',
      iban: '',
      accountHolderName: '',
      email: '',
      phone: '',
    },
    employees: [],
    validationErrors: [],
    metadata: {
      createdAt: null,
      updatedAt: null,
      lastGeneratedAt: null,
    },
  },

  // Generation history: array of {filename, generatedAt, employeeCount, totalSalary}
  history: [],

  // UI state
  ui: {
    templateSelectorOpen: false,
    savingTemplate: false,
    generatingFile: false,
    errorMessage: null,
    successMessage: null,
  },
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    // Template management
    setTemplate: (state, action) => {
      state.currentFile.templateId = action.payload.templateId;
      state.currentFile.templateName = action.payload.templateName;
      state.currentFile.companyInfo = { ...action.payload.companyInfo };
      state.currentFile.employees = [];
      state.currentFile.validationErrors = [];
    },

    saveTemplate: (state, action) => {
      const { templateId, templateName, companyInfo, employees } = action.payload;
      const existingIndex = state.templates.findIndex((t) => t.templateId === templateId);

      if (existingIndex >= 0) {
        state.templates[existingIndex] = {
          templateId,
          templateName,
          companyInfo,
          employees: [...employees],
          savedAt: new Date().toISOString(),
        };
      } else {
        state.templates.push({
          templateId,
          templateName,
          companyInfo,
          employees: [...employees],
          savedAt: new Date().toISOString(),
        });
      }
    },

    deleteTemplate: (state, action) => {
      state.templates = state.templates.filter((t) => t.templateId !== action.payload);
    },

    loadTemplate: (state, action) => {
      const template = state.templates.find((t) => t.templateId === action.payload);
      if (template) {
        state.currentFile.templateId = template.templateId;
        state.currentFile.templateName = template.templateName;
        state.currentFile.companyInfo = { ...template.companyInfo };
        state.currentFile.employees = [...template.employees];
      }
    },

    duplicateTemplate: (state, action) => {
      const { templateId, newTemplateId, newTemplateName } = action.payload;
      const template = state.templates.find((t) => t.templateId === templateId);
      if (template) {
        state.templates.push({
          templateId: newTemplateId,
          templateName: newTemplateName,
          companyInfo: { ...template.companyInfo },
          employees: JSON.parse(JSON.stringify(template.employees)),
          savedAt: new Date().toISOString(),
        });
      }
    },

    // Company info management
    updateCompanyInfo: (state, action) => {
      state.currentFile.companyInfo = {
        ...state.currentFile.companyInfo,
        ...action.payload,
      };
      state.currentFile.metadata.updatedAt = new Date().toISOString();
    },

    // Employee management
    addEmployee: (state, action) => {
      const newEmployee = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...action.payload,
      };
      state.currentFile.employees.push(newEmployee);
      state.currentFile.metadata.updatedAt = new Date().toISOString();
    },

    removeEmployee: (state, action) => {
      state.currentFile.employees = state.currentFile.employees.filter((emp) => emp.id !== action.payload);
      state.currentFile.metadata.updatedAt = new Date().toISOString();
    },

    updateEmployee: (state, action) => {
      const { employeeId, data } = action.payload;
      const employee = state.currentFile.employees.find((emp) => emp.id === employeeId);
      if (employee) {
        Object.assign(employee, data);
        state.currentFile.metadata.updatedAt = new Date().toISOString();
      }
    },

    // Validation
    setValidationErrors: (state, action) => {
      state.currentFile.validationErrors = action.payload;
    },

    clearValidationErrors: (state) => {
      state.currentFile.validationErrors = [];
    },

    // Generation history
    addToHistory: (state, action) => {
      state.history.unshift({
        id: `hist_${Date.now()}`,
        ...action.payload,
        generatedAt: new Date().toISOString(),
      });
      state.currentFile.metadata.lastGeneratedAt = new Date().toISOString();
      // Keep last 50 records
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },

    clearHistory: (state) => {
      state.history = [];
    },

    // UI state
    setTemplateSelectorOpen: (state, action) => {
      state.ui.templateSelectorOpen = action.payload;
    },

    setSavingTemplate: (state, action) => {
      state.ui.savingTemplate = action.payload;
    },

    setGeneratingFile: (state, action) => {
      state.ui.generatingFile = action.payload;
    },

    setErrorMessage: (state, action) => {
      state.ui.errorMessage = action.payload;
    },

    setSuccessMessage: (state, action) => {
      state.ui.successMessage = action.payload;
    },

    clearMessages: (state) => {
      state.ui.errorMessage = null;
      state.ui.successMessage = null;
    },
  },
});

export const {
  setTemplate,
  saveTemplate,
  deleteTemplate,
  loadTemplate,
  duplicateTemplate,
  updateCompanyInfo,
  addEmployee,
  removeEmployee,
  updateEmployee,
  setValidationErrors,
  clearValidationErrors,
  addToHistory,
  clearHistory,
  setTemplateSelectorOpen,
  setSavingTemplate,
  setGeneratingFile,
  setErrorMessage,
  setSuccessMessage,
  clearMessages,
} = payrollSlice.actions;

export default payrollSlice.reducer;

// Selectors
export const selectAllTemplates = (state) => state.payroll.templates;
export const selectCurrentFile = (state) => state.payroll.currentFile;
export const selectCurrentTemplateId = (state) => state.payroll.currentFile.templateId;
export const selectCurrentTemplateName = (state) => state.payroll.currentFile.templateName;
export const selectCompanyInfo = (state) => state.payroll.currentFile.companyInfo;
export const selectEmployees = (state) => state.payroll.currentFile.employees;
export const selectCurrentFileEmployeeCount = (state) => state.payroll.currentFile.employees.length;
export const selectCurrentFileTotalSalary = (state) =>
  state.payroll.currentFile.employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
export const selectValidationErrors = (state) => state.payroll.currentFile.validationErrors;
export const selectGenerationHistory = (state) => state.payroll.history;
export const selectTemplateSelectorOpen = (state) => state.payroll.ui.templateSelectorOpen;
export const selectSavingTemplate = (state) => state.payroll.ui.savingTemplate;
export const selectGeneratingFile = (state) => state.payroll.ui.generatingFile;
export const selectErrorMessage = (state) => state.payroll.ui.errorMessage;
export const selectSuccessMessage = (state) => state.payroll.ui.successMessage;
