import convertDOModelToMutation from "./mutation";

describe("convertDOModelToMutation", () => {
  describe("parsing a basic mutation", () => {
    it("should return proper syntax mutation String", () => {
      const mutationName = "createUser";
      const params = { user: { username: "user", password: "password" } };
      const mutationModel = {
        createUser: {
          _params: {
            user: {
              type: "UserInput!",
              inputFields: [
                {
                  name: "username",
                  type: "String!"
                },
                {
                  name: "password",
                  type: "String!"
                }
              ]
            }
          },
          username: "",
          password: ""
        }
      };
      const mutationString =
        "mutation createUser($user: UserInput!){createUser(user: $user){username password}}";
      const mutation = convertDOModelToMutation(
        mutationName,
        params,
        mutationModel
      );
      expect(mutation.mutation).toEqual(mutationString);
    });
    it("should pass the params through", () => {
      const mutationName = "createUser";
      const params = { user: { username: "user", password: "password" } };
      const mutationModel = {
        createUser: {
          _params: {
            user: {
              type: "UserInput!",
              inputFields: [
                {
                  name: "username",
                  type: "String!"
                },
                {
                  name: "password",
                  type: "String!"
                }
              ]
            }
          },
          username: "",
          password: ""
        }
      };
      const mutation = convertDOModelToMutation(
        mutationName,
        params,
        mutationModel
      );
      expect(mutation.params).toEqual(params);
    });
  });
  describe("parsing a complex mutation", () => {
    it("should return a mutation string with proper syntax", () => {
      const mutationName = "updateUser";
      const params = {
        id: "1",
        user: { username: "user", password: "password" }
      };
      const mutationModel = {
        updateUser: {
          _params: {
            id: {
              type: "String!",
              inputFields: null
            },
            user: {
              type: "UserInput!",
              inputFields: [
                {
                  name: "username",
                  type: "String!"
                },
                {
                  name: "password",
                  type: "String!"
                }
              ]
            }
          },
          username: "",
          password: ""
        }
      };
      const mutationString =
        "mutation updateUser($id: String!, $user: UserInput!){updateUser(id: $id, user: $user){username password}}";
      const mutation = convertDOModelToMutation(
        mutationName,
        params,
        mutationModel
      );
      expect(mutation.mutation).toEqual(mutationString);
    });
    it("should pass params through", () => {
      const mutationName = "updateUser";
      const params = {
        id: "1",
        user: { username: "user", password: "password" }
      };
      const mutationModel = {
        updateUser: {
          _params: {
            id: {
              type: "String!",
              inputFields: null
            },
            user: {
              type: "UserInput!",
              inputFields: [
                {
                  name: "username",
                  type: "String!"
                },
                {
                  name: "password",
                  type: "String!"
                }
              ]
            }
          },
          username: "",
          password: ""
        }
      };
      const mutation = convertDOModelToMutation(
        mutationName,
        params,
        mutationModel
      );
      expect(mutation.params).toEqual(params);
    });
  });
});
