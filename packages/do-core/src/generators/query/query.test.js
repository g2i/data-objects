import convertDALModelToQuery from "./query";

describe("convertDALModelToQuery", () => {
  it("should return a string", () => {
    expect(typeof convertDALModelToQuery({})).toEqual("string");
  });
  describe("basic query", () => {
    it("should return a query with proper syntax", () => {
      const query = "{users{id username}}";
      const dalModel = {
        users: {
          id: "",
          username: ""
        }
      };
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
  describe("query with variables", () => {
    it("should return a query with proper syntax", () => {
      const dalModel = {
        users: {
          _variables: { filter: { id: "1" } },
          id: "",
          username: ""
        }
      };
      const query = '{users(filter:{"id":"1"}){id username}}';
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
  describe("query with iterable property", () => {
    it("should return a query with proper syntax", () => {
      const dalModel = {
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
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
  describe("query with deep nesting", () => {
    it("should return a query with proper syntax", () => {
      const dalModel = {
        users: {
          id: "",
          role: {
            name: ""
          }
        }
      };
      const query = "{users{id role{name}}}";
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
  describe("query with number property", () => {
    it("should return a query with proper syntax", () => {
      const dalModel = {
        users: {
          id: 1,
          name: ""
        }
      };
      const query = "{users{id name}}";
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
  describe("query with a boolean property", () => {
    it("should return a query with proper syntax", () => {
      const dalModel = {
        users: {
          admin: true
        }
      };
      const query = "{users{admin}}";
      expect(convertDALModelToQuery(dalModel)).toEqual(query);
    });
  });
});
