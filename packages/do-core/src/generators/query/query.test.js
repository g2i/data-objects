import convertDOModelToQuery from "./query";

describe("convertDOModelToQuery", () => {
  it("should return a string", () => {
    expect(typeof convertDOModelToQuery({})).toEqual("string");
  });
  describe("basic query", () => {
    it("should return a query with proper syntax", () => {
      const query = "{users{id username}}";
      const doModel = {
        users: {
          id: "",
          username: ""
        }
      };
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
  describe("query with variables", () => {
    it("should return a query with proper syntax", () => {
      const doModel = {
        users: {
          _variables: { filter: { id: "1" } },
          id: "",
          username: ""
        }
      };
      const query = '{users(filter:{"id":"1"}){id username}}';
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
  describe("query with iterable property", () => {
    it("should return a query with proper syntax", () => {
      const doModel = {
        users: {
          id: "",
          tweets: [
            {
              body: "My first tweet!"
            }
          ]
        }
      };
      const query = "{users{id tweets{body}}}";
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
  describe("query with deep nesting", () => {
    it("should return a query with proper syntax", () => {
      const doModel = {
        users: {
          id: "",
          role: {
            name: ""
          }
        }
      };
      const query = "{users{id role{name}}}";
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
  describe("query with number property", () => {
    it("should return a query with proper syntax", () => {
      const doModel = {
        users: {
          id: 1,
          name: ""
        }
      };
      const query = "{users{id name}}";
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
  describe("query with a boolean property", () => {
    it("should return a query with proper syntax", () => {
      const doModel = {
        users: {
          admin: true
        }
      };
      const query = "{users{admin}}";
      expect(convertDOModelToQuery(doModel)).toEqual(query);
    });
  });
});
