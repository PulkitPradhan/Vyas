const { processMessagePipeline } = require('./lib/ats/pipeline');

async function main() {
  try {
    const res = await processMessagePipeline("What is paracetamol?", "web", "test-session-123");
    console.log("Result:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
