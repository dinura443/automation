import PromptSync from 'prompt-sync'; // Correct import


// Function to get user input
export function getUserInput(): { dashboardName: string } {
  const prompt = PromptSync();
  const dashboardName = prompt('Enter the dashboard name: ');
  return { dashboardName };
}