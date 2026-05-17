import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import payrollReducer, {
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
  // Selectors
  selectAllTemplates,
  selectCurrentFile,
  selectCurrentTemplateId,
  selectCurrentTemplateName,
  selectCompanyInfo,
  selectEmployees,
  selectCurrentFileEmployeeCount,
  selectCurrentFileTotalSalary,
  selectValidationErrors,
  selectGenerationHistory,
  selectTemplateSelectorOpen,
  selectSavingTemplate,
  selectGeneratingFile,
  selectErrorMessage,
  selectSuccessMessage,
} from '../store/payrollSlice';

describe('payrollSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        payroll: payrollReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().payroll;
      expect(state.templates).toEqual([]);
      expect(state.currentFile).toBeDefined();
      expect(state.currentFile.templateId).toBeNull();
      expect(state.currentFile.companyInfo).toBeDefined();
      expect(state.currentFile.employees).toEqual([]);
    });
  });

  describe('Actions - Company Info', () => {
    it('should update company info', () => {
      const companyData = {
        employerOrgNo: '12345',
        organizationName: 'Test Company',
        bankCode: '123',
        routingCode: '123456789',
        accountNumber: '1234567890123456',
        iban: 'AE211234567890123456789',
        accountHolderName: 'Test Account',
        email: 'test@example.com',
        phone: '+971501234567',
      };

      store.dispatch(updateCompanyInfo(companyData));
      const state = store.getState().payroll;

      expect(state.currentFile.companyInfo).toMatchObject(companyData);
    });
  });

  describe('Actions - Employees', () => {
    it('should add employee', () => {
      const employee = {
        emiratesId: '123456789012345',
        fullName: 'John Doe',
        accountNumber: '1234567890123456',
        salary: 5000,
        allowance: 500,
      };

      store.dispatch(addEmployee(employee));
      const state = store.getState().payroll;

      expect(state.currentFile.employees).toHaveLength(1);
      expect(state.currentFile.employees[0]).toMatchObject(employee);
    });

    it('should remove employee by id', () => {
      const employee1 = {
        emiratesId: '111111111111111',
        fullName: 'Employee 1',
        accountNumber: '1111111111111111',
        salary: 5000,
        allowance: 0,
      };
      const employee2 = {
        emiratesId: '222222222222222',
        fullName: 'Employee 2',
        accountNumber: '2222222222222222',
        salary: 6000,
        allowance: 0,
      };

      store.dispatch(addEmployee(employee1));
      store.dispatch(addEmployee(employee2));

      const employees = selectEmployees(store.getState());
      const firstEmployeeId = employees[0].id;

      store.dispatch(removeEmployee(firstEmployeeId));
      const updatedEmployees = selectEmployees(store.getState());

      expect(updatedEmployees).toHaveLength(1);
      expect(updatedEmployees[0].fullName).toBe('Employee 2');
    });

    it('should update employee', () => {
      const employee = {
        emiratesId: '123456789012345',
        fullName: 'John Doe',
        accountNumber: '1234567890123456',
        salary: 5000,
        allowance: 500,
      };

      store.dispatch(addEmployee(employee));
      const employeeId = selectEmployees(store.getState())[0].id;

      store.dispatch(
        updateEmployee({
          employeeId,
          data: { salary: 6000, allowance: 1000 },
        }),
      );

      const updatedEmployee = selectEmployees(store.getState())[0];
      expect(updatedEmployee.salary).toBe(6000);
      expect(updatedEmployee.allowance).toBe(1000);
    });
  });

  describe('Actions - Templates', () => {
    it('should save template', () => {
      const companyInfo = {
        employerOrgNo: '12345',
        organizationName: 'Test Company',
        bankCode: '123',
        routingCode: '123456789',
        accountNumber: '1234567890123456',
        iban: 'AE211234567890123456789',
        accountHolderName: 'Test Account',
        email: 'test@example.com',
        phone: '+971501234567',
      };

      const employee = {
        emiratesId: '123456789012345',
        fullName: 'John Doe',
        accountNumber: '1234567890123456',
        salary: 5000,
        allowance: 500,
      };

      store.dispatch(updateCompanyInfo(companyInfo));
      store.dispatch(addEmployee(employee));
      store.dispatch(
        saveTemplate({
          templateName: 'Test Template',
          companyInfo,
          employees: selectEmployees(store.getState()),
        }),
      );

      const templates = selectAllTemplates(store.getState());
      expect(templates).toHaveLength(1);
      expect(templates[0].templateName).toBe('Test Template');
      expect(templates[0].companyInfo).toMatchObject(companyInfo);
    });

    it('should load template', () => {
      const companyInfo = {
        employerOrgNo: '12345',
        organizationName: 'Test Company',
        bankCode: '123',
        routingCode: '123456789',
        accountNumber: '1234567890123456',
        iban: 'AE211234567890123456789',
        accountHolderName: 'Test Account',
        email: 'test@example.com',
        phone: '+971501234567',
      };

      const employee = {
        emiratesId: '123456789012345',
        fullName: 'John Doe',
        accountNumber: '1234567890123456',
        salary: 5000,
        allowance: 500,
      };

      store.dispatch(updateCompanyInfo(companyInfo));
      store.dispatch(addEmployee(employee));
      store.dispatch(
        saveTemplate({
          templateName: 'Test Template',
          companyInfo,
          employees: selectEmployees(store.getState()),
        }),
      );

      // Clear current file
      store.dispatch(updateCompanyInfo({}));

      const templates = selectAllTemplates(store.getState());
      const templateId = templates[0].id;

      // Load template
      store.dispatch(loadTemplate(templateId));

      const loadedCompanyInfo = selectCompanyInfo(store.getState());
      const loadedEmployees = selectEmployees(store.getState());

      expect(loadedCompanyInfo).toMatchObject(companyInfo);
      expect(loadedEmployees).toHaveLength(1);
      expect(loadedEmployees[0].fullName).toBe('John Doe');
    });

    it('should delete template', () => {
      const template = {
        templateName: 'Test Template',
        companyInfo: { organizationName: 'Test Co' },
        employees: [],
      };

      store.dispatch(saveTemplate(template));
      const templates = selectAllTemplates(store.getState());
      expect(templates).toHaveLength(1);

      const templateId = templates[0].id;
      store.dispatch(deleteTemplate(templateId));

      const remainingTemplates = selectAllTemplates(store.getState());
      expect(remainingTemplates).toHaveLength(0);
    });

    it('should duplicate template', () => {
      const template = {
        templateName: 'Original Template',
        companyInfo: { organizationName: 'Test Co' },
        employees: [],
      };

      store.dispatch(saveTemplate(template));
      const templates = selectAllTemplates(store.getState());
      const templateId = templates[0].id;

      store.dispatch(
        duplicateTemplate({
          templateId,
          newTemplateId: `template_${Date.now()}`,
          newTemplateName: `${template.templateName} (Copy)`,
        }),
      );

      const allTemplates = selectAllTemplates(store.getState());
      expect(allTemplates).toHaveLength(2);
      expect(allTemplates[1].templateName).toContain('Original Template');
    });
  });

  describe('Actions - Validation', () => {
    it('should set validation errors', () => {
      const errors = [
        { field: 'emiratesId', message: 'Invalid format' },
        { field: 'salary', message: 'Required field' },
      ];

      store.dispatch(setValidationErrors(errors));
      const validationErrors = selectValidationErrors(store.getState());

      expect(validationErrors).toHaveLength(2);
      expect(validationErrors).toEqual(errors);
    });

    it('should clear validation errors', () => {
      const errors = [{ field: 'emiratesId', message: 'Invalid format' }];

      store.dispatch(setValidationErrors(errors));
      expect(selectValidationErrors(store.getState())).toHaveLength(1);

      store.dispatch(clearValidationErrors());
      expect(selectValidationErrors(store.getState())).toHaveLength(0);
    });
  });

  describe('Actions - History', () => {
    it('should add to history', () => {
      const historyItem = {
        sifFilename: 'EMPLOYER_NO_20260506123456.SIF',
        employeeCount: 10,
        totalSalary: 50000,
      };

      store.dispatch(addToHistory(historyItem));
      const history = selectGenerationHistory(store.getState());

      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(historyItem);
    });

    it('should clear history', () => {
      store.dispatch(addToHistory({ sifFilename: 'test1.SIF', employeeCount: 1, totalSalary: 5000 }));
      store.dispatch(addToHistory({ sifFilename: 'test2.SIF', employeeCount: 2, totalSalary: 10000 }));

      const history = selectGenerationHistory(store.getState());
      expect(history).toHaveLength(2);

      store.dispatch(clearHistory());
      expect(selectGenerationHistory(store.getState())).toHaveLength(0);
    });
  });

  describe('Actions - UI State', () => {
    it('should set error message', () => {
      const message = 'Test error';
      store.dispatch(setErrorMessage(message));
      expect(selectErrorMessage(store.getState())).toBe(message);
    });

    it('should set success message', () => {
      const message = 'Success!';
      store.dispatch(setSuccessMessage(message));
      expect(selectSuccessMessage(store.getState())).toBe(message);
    });

    it('should clear messages', () => {
      store.dispatch(setErrorMessage('Error'));
      store.dispatch(setSuccessMessage('Success'));

      store.dispatch(clearMessages());

      expect(selectErrorMessage(store.getState())).toBe(null);
      expect(selectSuccessMessage(store.getState())).toBe(null);
    });

    it('should set generating file flag', () => {
      store.dispatch(setGeneratingFile(true));
      expect(selectGeneratingFile(store.getState())).toBe(true);

      store.dispatch(setGeneratingFile(false));
      expect(selectGeneratingFile(store.getState())).toBe(false);
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      const companyInfo = {
        employerOrgNo: '12345',
        organizationName: 'Test Company',
        bankCode: '123',
        routingCode: '123456789',
        accountNumber: '1234567890123456',
        iban: 'AE211234567890123456789',
        accountHolderName: 'Test Account',
        email: 'test@example.com',
        phone: '+971501234567',
      };

      store.dispatch(updateCompanyInfo(companyInfo));
      store.dispatch(
        addEmployee({
          emiratesId: '111111111111111',
          fullName: 'Employee 1',
          accountNumber: '1111111111111111',
          salary: 5000,
          allowance: 500,
        }),
      );
      store.dispatch(
        addEmployee({
          emiratesId: '222222222222222',
          fullName: 'Employee 2',
          accountNumber: '2222222222222222',
          salary: 6000,
          allowance: 1000,
        }),
      );
    });

    it('should select company info', () => {
      const companyInfo = selectCompanyInfo(store.getState());
      expect(companyInfo.organizationName).toBe('Test Company');
      expect(companyInfo.employerOrgNo).toBe('12345');
    });

    it('should select employees', () => {
      const employees = selectEmployees(store.getState());
      expect(employees).toHaveLength(2);
      expect(employees[0].fullName).toBe('Employee 1');
    });

    it('should select employee count', () => {
      const count = selectCurrentFileEmployeeCount(store.getState());
      expect(count).toBe(2);
    });

    it('should select total salary', () => {
      const total = selectCurrentFileTotalSalary(store.getState());
      expect(total).toBe(11000); // 5000 + 6000
    });
  });
});
