import React, { Component } from "react";
import "./App.css";

import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import * as subscriptions from "./graphql/subscriptions";

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
      console.log("addTodo error: ", error);
    } finally {
      this.refs.newTodo.value = "";
    }
  };

  componentDidMount() {
    this.getTodos();

    try {
      API.graphql(graphqlOperation(subscriptions.onCreateTodo)).subscribe({
        next: result => {
          console.log("result: ", result);
          const { items } = this.state;
          items.push(result.value.data.onCreateTodo);
          this.setState({ items });
        }
      });
      API.graphql(graphqlOperation(subscriptions.onUpdateTodo)).subscribe({
        next: result => {
          const items = this.state.items;
          const todo = result.value.data.onUpdateTodo;
          const idx = items.findIndex(item => item.id === todo.id);
          items[idx] = todo;
          this.setState({ items });
        }
      });
    } catch (error) {
      console.log("subscriptions error: ", error);
    }
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
  updateTodoStatus = async event => {
    try {
      const { item } = this.props;
      const todoStatus = event.target.checked ? "DONE" : "NOT DONE";
      const updateTodoInput = {
        input: { id: item.id, name: item.name, status: todoStatus }
      };
      await API.graphql(
        graphqlOperation(mutations.updateTodo, updateTodoInput)
      );
    } catch (error) {
      console.log("updateTodoStatus error: ", error);
    }
  };
  render() {
    const { item } = this.props;

    return (
      <li>
        <input
          type="checkbox"
          checked={item.status === "DONE"}
          onChange={this.updateTodoStatus}
        />
        {item.name}
      </li>
    );
  }
}

export default withAuthenticator(App);
