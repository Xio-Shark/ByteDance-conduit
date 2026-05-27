export function buildRunResultActions(actions) {
  return {
    confirm: actions.confirm,
    continueRun: actions.continueRun,
    resume: actions.resume,
    retry: actions.retry,
    submitPr: actions.submitPr,
  };
}

export function createResumeFromEditHandler(actions) {
  return () => actions.resume("editing");
}
