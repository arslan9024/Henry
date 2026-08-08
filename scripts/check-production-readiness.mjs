import { evaluateDeploymentReadiness } from '../src/services/deploymentReadinessService.js';

const color = {
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  cyan: '\u001b[36m',
  reset: '\u001b[0m',
};

const result = evaluateDeploymentReadiness(process.env);

console.log(`${color.cyan}[Henry readiness] provider=${result.provider}${color.reset}`);
result.checks.forEach((check) => {
  const tone = check.status === 'pass' ? color.green : color.red;
  const mark = check.status === 'pass' ? 'PASS' : 'FAIL';
  console.log(`${tone}[${mark}] ${check.label}${color.reset}`);
});
result.warnings.forEach((warning) => console.log(`${color.yellow}[WARN] ${warning}${color.reset}`));
result.errors.forEach((error) => console.error(`${color.red}[ERROR] ${error}${color.reset}`));

if (!result.ready) {
  console.error(`${color.red}[Henry readiness] BLOCKED (${result.errors.length} error(s))${color.reset}`);
  process.exitCode = 1;
} else {
  console.log(`${color.green}[Henry readiness] CONFIGURATION READY${color.reset}`);
}
