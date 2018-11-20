import { createUserDataPolicyStore } from "./user-data-policy-store";

export const createPolicyStore = app => createUserDataPolicyStore(app.userData);
