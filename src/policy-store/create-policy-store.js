import { createUserDataPolicyStore } from "./userdata";

export const createPolicyStore = app => createUserDataPolicyStore(app.userData);
