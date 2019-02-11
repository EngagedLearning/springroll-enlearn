import uuid from "uuid/v4";

const createNewId = dataStore => {
  const id = uuid();
  return dataStore.write("studentId", id).then(() => id, () => id);
};

export const getStudentId = dataStore =>
  dataStore
    .read("studentId")
    .then(id => id || createNewId(dataStore))
    .catch(() => createNewId(dataStore));
