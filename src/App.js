import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [
        { name: "Feed the cat", status: "NEW" },
        { name: "Discover purpose of life", status: "NEW" },
        { name: "Learn to cloud", status: "NEW" }
      ]
    };
  }

  render() {
    return (
      <div className="App">
        <main>
          <h1>TODO List</h1>
          <TodoList items={this.state.items} />
        </main>
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

export default App;
