import { describe, it, expect } from 'vitest';
import { generateAllData } from '../data/mockGenerator';
import { buildCasesFromData } from '../data/loader';
import { evaluateRules } from './rules';

describe('DBT-GUARD Rules Engine', () => {
  const dataset = generateAllData();
  const { cases } = buildCasesFromData(
    dataset.farmers,
    dataset.bankAccounts,
    dataset.npciMapper,
    dataset.pfmsValidation,
    dataset.paymentStatus
  );

  it('generates exactly 1000 total cases', () => {
    expect(cases.length).toBe(1000);
  });

  it('produces exact expected status counts: 720 Ready, 20 Needs verification, 250 Issue identified, 10 Payment pending', () => {
    const readyCount = cases.filter((c) => c.status === 'Ready').length;
    const needsVerificationCount = cases.filter((c) => c.status === 'Needs verification').length;
    const issueIdentifiedCount = cases.filter((c) => c.status === 'Issue identified').length;
    const paymentPendingCount = cases.filter((c) => c.status === 'Payment pending').length;

    expect(readyCount).toBe(720);
    expect(needsVerificationCount).toBe(20);
    expect(issueIdentifiedCount).toBe(250);
    expect(paymentPendingCount).toBe(10);
    expect(readyCount + needsVerificationCount + issueIdentifiedCount + paymentPendingCount).toBe(1000);
  });

  it('correctly diagnoses KL-TSR-0001 Ravi K as NOT_MAPPED with 23rd instalment payment failure', () => {
    const raviCase = cases.find((c) => c.farmer_id === 'KL-TSR-0001');
    expect(raviCase).toBeDefined();
    expect(raviCase?.case_id).toBe('K104');
    expect(raviCase?.farmer_name_en).toBe('Ravi K');
    expect(raviCase?.status).toBe('Issue identified');
    expect(raviCase?.severity).toBe('Red');
    expect(raviCase?.rule_code).toBe('R03');

    // Also check direct rule evaluation
    const raviFarmer = dataset.farmers.find((f) => f.farmer_id === 'KL-TSR-0001')!;
    const raviAccount = dataset.bankAccounts.find((a) => a.farmer_id === 'KL-TSR-0001')!;
    const raviNpci = dataset.npciMapper.find((n) => n.aadhaar_token === raviFarmer.aadhaar_token)!;
    const raviPfms = dataset.pfmsValidation.find((p) => p.farmer_id === 'KL-TSR-0001')!;
    const raviPayments = dataset.paymentStatus.filter((p) => p.farmer_id === 'KL-TSR-0001');

    const evalResult = evaluateRules(raviFarmer, raviAccount, raviNpci, raviPfms, raviPayments, 3, 'Answered');
    expect(evalResult.rule_id).toBe('NOT_MAPPED');
    expect(evalResult.severity).toBe('Red');
    expect(evalResult.status).toBe('Issue identified');
    expect(evalResult.owner_office_type).toBe('bank_branch');
  });

  it('computes priority score accurately based on failure history and duration', () => {
    const raviFarmer = dataset.farmers.find((f) => f.farmer_id === 'KL-TSR-0001')!;
    const raviAccount = dataset.bankAccounts.find((a) => a.farmer_id === 'KL-TSR-0001')!;
    const raviNpci = dataset.npciMapper.find((n) => n.aadhaar_token === raviFarmer.aadhaar_token)!;
    const raviPfms = dataset.pfmsValidation.find((p) => p.farmer_id === 'KL-TSR-0001')!;
    const raviPayments = dataset.paymentStatus.filter((p) => p.farmer_id === 'KL-TSR-0001');

    // Base Red = 3. Previous payment failed (+1). If daysOpen > 7 (+1). If call not reached (+1)
    const baseEval = evaluateRules(raviFarmer, raviAccount, raviNpci, raviPfms, raviPayments, 3, 'Answered');
    expect(baseEval.priority).toBe(4); // 3 (Red) + 1 (payment failed)

    const urgentEval = evaluateRules(raviFarmer, raviAccount, raviNpci, raviPfms, raviPayments, 10, 'Not reached');
    expect(urgentEval.priority).toBe(6); // 3 (Red) + 1 (failed) + 1 (>7 days) + 1 (not reached) = 6
  });
});
