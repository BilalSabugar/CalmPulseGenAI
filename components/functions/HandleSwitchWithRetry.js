/**
 * A function that attempts to execute an async function multiple times before failing.
 * @param {() => Promise<any>} asyncFunction The async function to execute.
 */
const handleSaveWithRetry = async (asyncFunction) => {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await asyncFunction();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
};

export default handleSaveWithRetry;