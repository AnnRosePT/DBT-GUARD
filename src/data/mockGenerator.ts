
const LOCAL_BODIES = [
  { en: 'Irinjalakuda (M)', ml: 'ഇരിഞ്ഞാലക്കുട', kb: 'KB Irinjalakuda' },
  { en: 'Kattoor', ml: 'കാട്ടൂർ', kb: 'KB Kattoor' },
  { en: 'Muriyad', ml: 'മുരിയാട്', kb: 'KB Muriyad' },
  { en: 'Karalam', ml: 'കാരളം', kb: 'KB Karalam' },
  { en: 'Padiyur', ml: 'പടിയൂർ', kb: 'KB Padiyur' },
  { en: 'Aloor', ml: 'ആളൂർ', kb: 'KB Aloor' },
  { en: 'Vellookkara', ml: 'വെള്ളൂക്കര', kb: 'KB Vellookkara' },
  { en: 'Poomangalam', ml: 'പൂമംഗലം', kb: 'KB Poomangalam' },
];

const BANKS = [
  { name: 'State Bank of India', branch: 'SBI Irinjalakuda Main', ifsc: 'SBIN0008618' },
  { name: 'State Bank of India', branch: 'SBI Irinjalakuda Town', ifsc: 'SBIN0070162' },
  { name: 'Canara Bank', branch: 'Canara Bank Aloor', ifsc: 'CNRB0001245' },
  { name: 'Federal Bank', branch: 'Federal Bank Muriyad', ifsc: 'FDRL0001089' },
  { name: 'Kerala Gramin Bank', branch: 'KGB Kattoor', ifsc: 'KLGB0040182' },
  { name: 'Punjab National Bank', branch: 'PNB Kodakara', ifsc: 'PUNB0184000' },
];

const FIRST_NAMES = [
  { en: 'Ravi', ml: 'രവി' },
  { en: 'Joseph', ml: 'ജോസഫ്' },
  { en: 'Devaki', ml: 'ദേവകി' },
  { en: 'Lakshmi', ml: 'ലക്ഷ്മി' },
  { en: 'Muhammed', ml: 'മുഹമ്മദ്' },
  { en: 'Fathima', ml: 'ഫാത്തിമ' },
  { en: 'Sreedharan', ml: 'ശ്രീധരൻ' },
  { en: 'Thomas', ml: 'തോമസ്' },
  { en: 'Kunjumon', ml: 'കുഞ്ഞുമോൻ' },
  { en: 'Valsala', ml: 'വത്സല' },
  { en: 'Gopalan', ml: 'ഗോപാലൻ' },
  { en: 'Sankaran', ml: 'ശങ്കരൻ' },
  { en: 'Radhamani', ml: 'രാധാമണി' },
  { en: 'Sujatha', ml: 'സുജാത' },
  { en: 'Balan', ml: 'ബാലൻ' },
  { en: 'Leela', ml: 'ലീല' },
  { en: 'Chandran', ml: 'ചന്ദ്രൻ' },
  { en: 'Mariamma', ml: 'മറിയാമ്മ' },
  { en: 'Prabhakaran', ml: 'പ്രഭാകരൻ' },
  { en: 'Antony', ml: 'ആന്റണി' },
];

const LAST_INITIALS = ['K', 'M', 'P', 'R', 'S', 'V', 'N', 'G', 'T', 'B'];

export function generateAllData() {
  const farmers: any[] = [];
  const bankAccounts: any[] = [];
  const npciMapper: any[] = [];
  const pfmsValidation: any[] = [];
  const paymentStatus: any[] = [];

  // We need exactly:
  // 250 Red (Issue identified)
  // 20 Amber (Needs verification)
  // 10 Grey (Payment pending)
  // 720 Green (Ready)
  // Total = 1000

  for (let i = 0; i < 1000; i++) {
    const num = i + 1;
    const farmerId = `KL-TSR-${String(num).padStart(4, '0')}`;
    const aadhaarToken = String(7000 + (num % 2999));
    const aadhaarMasked = `XXXX-XXXX-${aadhaarToken}`;
    const mobileRaw = `98460${String(10000 + (num % 89999)).padStart(5, '0')}`;
    const mobileMasked = `+91 98460XXXXX`;

    const lb = LOCAL_BODIES[i % LOCAL_BODIES.length];
    const bank = BANKS[i % BANKS.length];
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const initial = LAST_INITIALS[i % LAST_INITIALS.length];
    const nameEn = i === 0 ? 'Ravi K' : `${fn.en} ${initial}`;
    const nameMl = i === 0 ? 'രവി കെ' : `${fn.ml} ${initial}`;
    const ward = `Ward ${String((i % 18) + 1).padStart(2, '0')}`;
    const crop = ['Paddy', 'Coconut', 'Banana', 'Vegetables', 'Nutmeg', 'Pepper'][i % 6];
    const category = ['Small Holder', 'Marginal', 'Large'][i % 3];

    // Default clean state
    let ekycStatus: 'Completed' | 'Pending' | 'Failed' = 'Completed';
    let landStatus: 'Seeded' | 'Pending' | 'Mismatch' = 'Seeded';
    let consentCall: 'Y' | 'N' = i % 15 === 0 ? 'N' : 'Y';
    let issueInjected = 'CLEAN';

    let accountStatus: 'Active' | 'Closed' | 'Dormant' | 'Frozen' = 'Active';
    let kycStatus: 'Valid' | 'Pending' | 'Expired' = 'Valid';
    let ifsc = bank.ifsc;
    let bankName = bank.name;
    let branchName = bank.branch;

    let mappedStatus: 'Mapped' | 'Not mapped' | 'De-seeded' | '' = 'Mapped';
    let npciLastUpdated = '2026-09-25'; // within 30 days of 2026-10-16

    let pfmsStatus: 'Passed' | 'Rejected' | 'Pending' = 'Passed';
    let pfmsCode = 'OK';
    let pfmsDesc = 'PFMS Account Validation Passed';

    let pay21Status: any = 'Credited';
    let pay22Status: any = 'Credited';
    let pay23Status: any = 'Disbursed';

    // Index 0: KL-TSR-0001 Ravi K (Special case K104)
    if (i === 0) {
      mappedStatus = 'Not mapped'; // Triggers R03 NOT_MAPPED
      bankName = 'State Bank of India';
      branchName = 'SBI Irinjalakuda Main';
      ifsc = 'SBIN0008618';
      pfmsStatus = 'Rejected';
      pfmsCode = 'R01';
      pfmsDesc = 'Aadhaar not mapped to NPCI mapper';
      pay23Status = 'Payment Failed';
      issueInjected = 'NOT_MAPPED';
    }
    // Next 249 Red cases (i = 1 to 249):
    else if (i >= 1 && i <= 90) {
      // R01: ekyc pending (90 cases)
      ekycStatus = 'Pending';
      pfmsStatus = 'Rejected';
      pfmsCode = 'E01';
      pfmsDesc = 'e-KYC Pending';
      pay23Status = 'Payment Failed';
      issueInjected = 'EKYC_PENDING';
    } else if (i >= 91 && i <= 140) {
      // R02: land seeding pending (50 cases)
      landStatus = 'Pending';
      pfmsStatus = 'Rejected';
      pfmsCode = 'L02';
      pfmsDesc = 'Land Seeding Pending in RoR';
      pay23Status = 'Payment Failed';
      issueInjected = 'LAND_PENDING';
    } else if (i >= 141 && i <= 180) {
      // R03: Not mapped (40 cases)
      mappedStatus = 'Not mapped';
      pfmsStatus = 'Rejected';
      pfmsCode = 'R01';
      pfmsDesc = 'Aadhaar not mapped in NPCI';
      pay23Status = 'Payment Failed';
      issueInjected = 'NOT_MAPPED';
    } else if (i >= 181 && i <= 210) {
      // R04: De-seeded (30 cases)
      mappedStatus = 'De-seeded';
      pfmsStatus = 'Rejected';
      pfmsCode = 'M04';
      pfmsDesc = 'Aadhaar Mandate De-seeded';
      pay23Status = 'Payment Failed';
      issueInjected = 'DESEEDED';
    } else if (i >= 211 && i <= 228) {
      // R05: Account closed (18 cases)
      accountStatus = 'Closed';
      pfmsStatus = 'Rejected';
      pfmsCode = 'B08';
      pfmsDesc = 'Account closed at branch';
      pay23Status = 'Payment Failed';
      issueInjected = 'ACC_CLOSED';
    } else if (i >= 229 && i <= 239) {
      // R06: Invalid IFSC (11 cases)
      ifsc = 'SBIN9999999_INV';
      pfmsStatus = 'Rejected';
      pfmsCode = 'F06';
      pfmsDesc = 'Invalid IFSC code format';
      pay23Status = 'Payment Failed';
      issueInjected = 'WRONG_BANK';
    } else if (i >= 240 && i <= 249) {
      // R07: Bank KYC Pending/Expired or Frozen (10 cases)
      kycStatus = 'Expired';
      pfmsStatus = 'Rejected';
      pfmsCode = 'B12';
      pfmsDesc = 'Bank Account KYC Expired';
      pay23Status = 'Payment Failed';
      issueInjected = 'KYC_PENDING';
    }
    // 20 Amber cases (i = 250 to 269): Needs verification
    else if (i >= 250 && i <= 254) {
      // R08: name mismatch (5 cases)
      pfmsCode = 'N02';
      pfmsDesc = 'Beneficiary name mismatch with bank CBS';
      issueInjected = 'NAME_MISMATCH';
    } else if (i >= 255 && i <= 259) {
      // R09: Inactive/Dormant (5 cases)
      accountStatus = 'Dormant';
      issueInjected = 'INACTIVE';
    } else if (i >= 260 && i <= 264) {
      // R10: Stale mapper > 90 days (5 cases)
      npciLastUpdated = '2026-05-10'; // > 90 days before 2026-10-16
      issueInjected = 'DATA_STALE';
    } else if (i >= 265 && i <= 269) {
      // R11: credited bank != bank on record (5 cases)
      pfmsCode = 'B09';
      pfmsDesc = 'Credited bank differs from bank on record';
      issueInjected = 'CREDITED_BANK_MISMATCH';
    }
    // 10 Grey cases (i = 270 to 279): Payment pending
    else if (i >= 270 && i <= 279) {
      // R12: latest payment "PFMS Response Pending" (10 cases)
      pay23Status = 'PFMS Response Pending';
      issueInjected = 'PENDING';
    }
    // Remaining 720 cases (i = 280 to 999): Clean / Ready (Green)
    else {
      issueInjected = 'NONE';
    }

    farmers.push({
      farmer_id: farmerId,
      name_en: nameEn,
      name_ml: nameMl,
      aadhaar_token: aadhaarToken,
      aadhaar_masked: aadhaarMasked,
      mobile_masked: mobileMasked,
      mobile_raw: mobileRaw,
      local_body: lb.en,
      ward: ward,
      krishi_bhavan: lb.kb,
      category: category,
      land_seeding_status: landStatus,
      ekyc_status: ekycStatus,
      consent_call: consentCall,
      issue_injected: issueInjected,
    });

    bankAccounts.push({
      farmer_id: farmerId,
      bank_name: bankName,
      branch_name: branchName,
      ifsc: ifsc,
      account_number_masked: `XXXXXXXX${String(9000 + (num % 999))}`,
      account_status: accountStatus,
      kyc_status: kycStatus,
    });

    npciMapper.push({
      aadhaar_token: aadhaarToken,
      bank_name: bankName,
      mapped_status: mappedStatus,
      last_updated_date: npciLastUpdated,
    });

    pfmsValidation.push({
      farmer_id: farmerId,
      validation_status: pfmsStatus,
      error_code: pfmsCode,
      error_description: pfmsDesc,
      validation_date: '2026-10-14',
    });

    paymentStatus.push(
      {
        farmer_id: farmerId,
        instalment_no: 21,
        instalment_date: '2025-11-19',
        amount: 2000,
        status: pay21Status,
        transaction_id: `UTR-20251119-SBI-${String(10000 + num)}`,
        remarks: 'Clean validation',
      },
      {
        farmer_id: farmerId,
        instalment_no: 22,
        instalment_date: '2026-03-13',
        amount: 2000,
        status: pay22Status,
        transaction_id: `UTR-20260313-SBI-${String(40000 + num)}`,
        remarks: 'State clearinghouse cleared',
      },
      {
        farmer_id: farmerId,
        instalment_no: 23,
        instalment_date: '2026-06-20',
        amount: 2000,
        status: pay23Status,
        transaction_id:
          pay23Status === 'Payment Failed'
            ? `PFMS-REJ-${String(80000 + num)}`
            : `UTR-20260620-SBI-${String(70000 + num)}`,
        remarks:
          pay23Status === 'Payment Failed'
            ? 'PFMS clearinghouse reject'
            : pay23Status === 'PFMS Response Pending'
            ? 'Treasury Response Pending'
            : 'Disbursed to account',
      }
    );
  }

  return { farmers, bankAccounts, npciMapper, pfmsValidation, paymentStatus };
}
