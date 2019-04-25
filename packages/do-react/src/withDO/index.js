import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';

export default function withDO(WrappedComponent) {
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
      if (WrappedComponent.defaultProps && WrappedComponent.defaultProps.$do) {
        //Define mutate prop passed to WrappedComponent
        this.mutate = (mutationName, params, returnFields = { id: '' }) => {
          const mutation = this.context.$do.generateMutation(
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
        } = WrappedComponent.defaultProps.$do;
        //Generate query from doModel and pass to graphql for fetching
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
        const query = this.context.$do.generateQuery(queryFields);
        if (WrappedComponent.defaultProps.$do.skip) {
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
                  const newQuery = this.context.$do.generateQuery(queryFields);
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
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
      );
    }

    render() {
      console.log(this.context);
      if (WrappedComponent.defaultProps && WrappedComponent.defaultProps.$do) {
        const $do = merge(
          WrappedComponent.defaultProps.$do,
          this.state.returnedData
        );
        return <WrappedComponent $do={$do} {...this.props} />;
      } else {
        console.warn(
          `$do is not defined in defaultProps for ${this.getDisplayName()}`
        );
        return <WrappedComponent {...this.props} />;
      }
    }
  }

  HOC.contextType = Context;
  return HOC;
}
