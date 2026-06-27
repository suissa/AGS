declare module 'inquirer' {
  interface PromptModule {
    prompt(questions: object[]): Promise<Record<string, unknown>>;
  }
  const inquirer: { prompt: PromptModule['prompt'] };
  export default inquirer;
}
