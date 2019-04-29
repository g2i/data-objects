import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';

export default function withDO(WrappedComponent) {
  class HOC extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        returnedData: { mutate: this.mutate, errors: [], updating: false, loading: false }
      };
    }

    fetchData(fetch, query) {
      return fetch(query)
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
      const { returnedData } = this.state;
      if (
        WrappedComponent.defaultProps &&
        WrappedComponent.defaultProps.$do
      ) {

        //Define mutate prop passed to WrappedComponent
        this.mutate = (mutationName, params, returnFields = { id: '' }) => {
          const mutation = this.context.$do.generateMutation(
            mutationName,
            params,
            returnFields
          );

          this.setState({
            returnedData: {
              ...returnedData,
              updating: true,
            }
          })

          return this.context
            .graphql(mutation)
            .then(data => {
              this.setState({
                returnedData: {
                  ...returnedData,
                  ...data,
                  updating: false,
                }
              });
            })
            .catch(err => {
              this.setState({
                returnedData: {
                  ...returnedData,
                  errors: [...returnedData.errors, err],
                  updating: false,
                }
              });
            });
        };
        const {
          mutate,
          loading,
          errors,
          skip,
          updating,
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
