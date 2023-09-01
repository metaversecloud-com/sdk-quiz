function checkEnvVariables() {
  const requiredEnvVariables = [
    "INSTANCE_DOMAIN",
    "INSTANCE_PROTOCOL",
    "INTERACTIVE_KEY",
    "INTERACTIVE_SECRET",
  ];
  const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables in the .env file: ${missingVariables.join(
        ", "
      )}`
    );
  }
}

export default checkEnvVariables;
