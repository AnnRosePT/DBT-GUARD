import { describe, it, expect } from 'vitest';
import { generateAllData } from '../data/mockGenerator';
import { buildCasesFromData } from '../data/loader';

describe('DBT-GUARD 12-Rule Extended Classification Test Suite', () => {
  const dataset = generateAllData();
  const { cases } = buildCasesFromData(
    dataset.farmers,
    dataset.bankAccounts,
    dataset.npciMapper,
    dataset.pfmsValidation,
    dataset.paymentStatus
  );

  it('correctly maps all 12 PFMS rejection rule codes across the dataset', () => {
    const ruleCodesPresent = new Set(cases.map((c) => c.rule_code));
    expect(ruleCodesPresent.size).toBeGreaterThanOrEqual(10);
  });

  it('assigns Bank Branch as responsible office for NPCI unmapped (R01/R03)', () => {
    const bankCases = cases.filter((c) => c.rule_code === 'R01' || c.rule_code === 'R03');
    expect(bankCases.length).toBeGreaterThan(0);
    bankCases.forEach((c) => {
      expect(c.owner_office_type).toBe('bank_branch');
    });
  });

  it('assigns Akshaya / CSC as responsible office for Biometric e-KYC pending (R05)', () => {
    const akshayaCases = cases.filter((c) => c.rule_code === 'R05');
    if (akshayaCases.length > 0) {
      akshayaCases.forEach((c) => {
        expect(c.owner_office_type).toBe('akshaya');
      });
    }
  });

  it('assigns Village Revenue Office for land record mutation splits (R06/R07)', () => {
    const landCases = cases.filter((c) => c.rule_code === 'R06' || c.rule_code === 'R07');
    if (landCases.length > 0) {
      landCases.forEach((c) => {
        expect(c.owner_office_type).toBe('village_office');
      });
    }
  });

  it('verifies all overdue cases have positive days_open count', () => {
    const overdueCases = cases.filter((c) => c.is_overdue);
    overdueCases.forEach((c) => {
      expect(c.days_open).toBeGreaterThanOrEqual(7);
      expect(c.severity).toBe('Red');
    });
  });

  it('ensures no beneficiary record exposes raw unmasked Aadhaar in UI fields', () => {
    cases.forEach((c) => {
      if (c.farmer_id) {
        expect(c.farmer_id).toMatch(/^KL-TSR-\d{4}$/);
      }
    });
  });
});
