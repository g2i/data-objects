# Data Objects

Data Objects are a collections of graphql helpers for front end projects.  Our goal is to make querying data from a graphql endpoint more intuitive and natural.

## the problem
After quite a few React and React Native + GraphQL projects under our belts, we noticed a common struggle around how to organize and manage the queries on the front end.

Whether storing the queries in const files or inside the Containers, we noticed maintenance and development issues keeping up with the necessary data and changes.

We also noticed a bad habit of fetching WAY more data than you needed because it was easier than query modification in real time.

## our vision
We want to defined the data we need in a normal flow of application development and then have our graphql queries created and fetched for us

We envisioned something like this for React:
```
defaultProps = {
  $do: {
    developers: [
      {
        _variables: {filter: { first_name: "Lee" }},
        first_name: "placeholder...",
        last_name: "placeholder...",
        assessments: [
          {
            title: "placeholder..."
          }
        ]
      }
    ]
  }
};
```

Where the data and placeholders would be replaced with actual data from graphql after fetch.

## the current state of this project
The above example actually works and we are using this library to build some internal tools.  We will continue to contribute to this as we find and fix issues during a production use case.  I would not recommend anyone use this in a prject yet, but when it is ready we will continue to open source and support it and add more doucmentation here.

## who are we?
We are [G2i](http://g2i.co).  We connect health companies to healthy developers and strive to be **G**ood news **2** the **i**nternet by
* Treating engineers and companies with grace and respect
* Support Open Source projects
* Contributing a portion of all of our projects to [Street Kids in Kenya](http://www.maridhiano.com/street-outreaches)
