import React from "react";
import Context from "context";
import merge from "lodash/merge";

export default function withDAL(WrappedComponent) {
  return props => {
    class HOC extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          returnedData: { mutate: this.mutate, errors: [] }
        };
      }

      fetchData(fetch, query) {
        fetch(query)
          .then(data => {
            this.setState({
              returnedData: {
                ...this.state.returnedData,
                ...data,
                loading: false
              }
            });
          })
          .catch(err => {
            this.setState({
              returnedData: {
                ...this.state.returnedData,
                errors: [...this.state.returnedData.errors, err],
                loading: false
              }
            });
          });
      }

      componentDidMount() {
        if (
          WrappedComponent.defaultProps &&
          WrappedComponent.defaultProps.dal
        ) {
          //Define mutate prop passed to WrappedComponent
          this.mutate = (mutationName, params, returnFields = { id: "" }) => {
            const mutation = this.context.dal.generateMutation(
              mutationName,
              params,
              returnFields
            );
            this.context
              .graphql(mutation)
              .then(data => {
                this.setState({
                  returnedData: {
                    ...this.state.returnedData,
                    ...data
                  }
                });
              })
              .catch(err => {
                this.setState({
                  returnedData: {
                    ...this.state.returnedData,
                    errors: [...this.state.returnedData.errors, err]
                  }
                });
              });
          };
          const {
            mutate,
            loading,
            errors,
            skip,
            executeQuery,
            ...queryFields
          } = WrappedComponent.defaultProps.dal;
          //Generate query from dalModel and pass to graphql for fetching
          if (this.props.variables) {
            Object.keys(this.props.variables).reduce((queryFields, key) => {
              if (Array.isArray(queryFields[key])) {
                queryFields[key][0]._variables = this.props.variables[key];
              } else {
                queryFields[key]._variables = this.props.variables[key];
              }
              return queryFields;
            }, queryFields);
          }
          const query = this.context.dal.generateQuery(queryFields);
          if (WrappedComponent.defaultProps.dal.skip) {
            this.setState({
              returnedData: {
                ...this.state.returnedData,
                executeQuery: variables => {
                  if (variables) {
                    Object.keys(variables).reduce((queryFields, key) => {
                      if (Array.isArray(queryFields[key])) {
                        queryFields[key][0]._variables = variables[key];
                      } else {
                        queryFields[key]._variables = variables[key];
                      }
                      return queryFields;
                    }, queryFields);
                    const newQuery = this.context.dal.generateQuery(
                      queryFields
                    );
                    this.fetchData(this.context.graphql, newQuery);
                  } else {
                    this.fetchData(this.context.graphql, query);
                  }
                }
              }
            });
          } else {
            this.setState({
              returnedData: {
                ...this.state.returnedData,
                mutate: this.mutate,
                loading: true
              }
            });
            this.fetchData(this.context.graphql, query);
          }
        }
      }

      getDisplayName() {
        return (
          WrappedComponent.displayName || WrappedComponent.name || "Component"
        );
      }

      render() {
        if (
          WrappedComponent.defaultProps &&
          WrappedComponent.defaultProps.dal
        ) {
          const dal = merge(
            WrappedComponent.defaultProps.dal,
            this.state.returnedData
          );
          return <WrappedComponent dal={dal} {...this.props} />;
        } else {
          console.warn(
            `dal is not defined in defaultProps for ${this.getDisplayName()}`
          );
          return <WrappedComponent {...this.props} />;
        }
      }
    }

    HOC.contextType = Context;
    return <HOC {...props} />;
  };
}
