const POLICY_KEY = "enlearnPolicy";

const savePolicy = userData => (ecosystemId, policy) =>
  new Promise(resolve =>
    userData.write(POLICY_KEY, { ecosystemId, policy }, resolve)
  );

const loadPolicy = userData => ecosystemId =>
  new Promise(resolve =>
    userData.read(POLICY_KEY, data => {
      resolve(data && data.ecosystemId === ecosystemId ? data.policy : null);
    })
  );

export const createUserDataPolicyStore = userData =>
  Promise.resolve({
    savePolicy: savePolicy(userData),
    loadPolicy: loadPolicy(userData),
  });
