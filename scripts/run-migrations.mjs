/* eslint-disable no-undef */
// Import the child_process module
// @ts-check
/* eslint-env node */
/* eslint-disable no-console */
import { exec } from "child_process";

// Function to run the migration command
function runMigration() {
    // Execute the npm run migration command
    exec(
        "npm run migration:run",
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing migration: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Error output: ${stderr}`);
                return;
            }

            // Log the output of the command
            console.log(`Migration output: ${stdout}`);
        },
    );
}
// Run the migration function
runMigration();