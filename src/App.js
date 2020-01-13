import React, { Component } from "react";
import "./App.css";

import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";

import { withAuthenticator } from "aws-amplify-react";
import Amplify, { Auth, API, graphqlOperation } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: []
    };
  }

  logout = () => {
    Auth.signOut();
    window.location.reload();
  };

  getTodos = async () => {
    try {
      const result = await API.graphql(graphqlOperation(queries.listTodos));
      this.setState({ items: result.data.listTodos.items });
    } catch (error) {
      alert("getTodos error: ", error);
    }
  };

  addTodo = async () => {
    try {
      const createTodoInput = {
        input: { name: this.refs.newTodo.value, status: "NEW" }
      };
      await API.graphql(
        graphqlOperation(mutations.createTodo, createTodoInput)
      );
    } catch (error) {
    } finally {
      this.refs.newTodo.value = "";
    }
  };

  componentDidMount() {
    this.getTodos();
  }

  render() {
    return (
      <div className="App">
        <main>
          <h1>TODO List</h1>
          <TodoList items={this.state.items} />
          <input type="text" ref="newTodo" />
          <button onClick={this.addTodo}>Add Todo</button>
        </main>
        <button onClick={this.logout}>Log Out</button>
      </div>
    );
  }
}

class TodoList extends Component {
  render() {
    return (
      <div className="TodoList">
        <ul>
          {this.props.items.map((item, index) => {
            return <TodoItem item={item} key={index} />;
          })}
        </ul>
      </div>
    );
  }
}

class TodoItem extends Component {
  render() {
    const { item } = this.props;

    return (
      <li>
        <input type="checkbox" />
        {item.name}
      </li>
    );
  }
}

export default withAuthenticator(App);
