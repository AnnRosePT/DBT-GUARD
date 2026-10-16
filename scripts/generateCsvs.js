import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { generateAllData } from '../src/data/mockGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/data/mock');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const { farmers, bankAccounts, npciMapper, pfmsValidation, paymentStatus } = generateAllData();

fs.writeFileSync(path.join(targetDir, 'farmers.csv'), Papa.unparse(farmers));
fs.writeFileSync(path.join(targetDir, 'bank_accounts.csv'), Papa.unparse(bankAccounts));
fs.writeFileSync(path.join(targetDir, 'npci_mapper.csv'), Papa.unparse(npciMapper));
fs.writeFileSync(path.join(targetDir, 'pfms_validation.csv'), Papa.unparse(pfmsValidation));
fs.writeFileSync(path.join(targetDir, 'payment_status.csv'), Papa.unparse(paymentStatus));

console.log('CSVs generated successfully in public/data/mock/');
