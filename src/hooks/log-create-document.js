export const logCreateDocument = async (context) => {
  console.log(`Created Document ${context.path}.${context.method}`)
}
