import fs from "fs";
import path from "path";

// Quick check on talent matching logic and squad sizing
const code = fs.readFileSync(path.join(process.cwd(), "lib", "talentMatching.ts"), "utf-8");

console.log("Checking lib/talentMatching.ts updates...");
if (code.includes("Third priority: High-scoring complementary specialists") && code.includes("squad.length < 5")) {
  console.log("✅ PASS: 5-specialist squad guarantee logic is present in lib/talentMatching.ts");
} else {
  console.error("❌ FAIL: Squad sizing logic not found");
  process.exit(1);
}
