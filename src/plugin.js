function createApi () {
  return {
    createProblem (numberOfSteps, excludedTraces = null, metadata = null) {
      return Promise.resolve()
    },

    getProblem (problemId) {
      return Promise.resolve()
    },

    startProblem (problemId, metadata = null) {
      return Promise.resolve()
    },

    recordStepResult (correct, metadata = null) {
      return Promise.resolve()
    },

    recordProblemResult (completed, metadata = null) {
      return Promise.resolve()
    },

    selectScaffold (metadata = null) {
      return Promise.resolve()
    },

    recordScaffoldShown (scaffoldId, metadata = null) {
      return Promise.resolve()
    },
  }
}

export function setupPlugin (app) {
  app.enlearn = createApi()
  return Promise.resolve()
}

export function teardownPlugin (app) {
  delete app.enlearn
  return Promise.resolve()
}
