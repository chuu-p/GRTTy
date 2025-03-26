// import { useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { useState } from "react";
import { Todo } from "./protobuf-ts-gen/example";
import { TodoServiceClient } from "./protobuf-ts-gen/example.client";
// import { HealthCheckServiceClient } from "./protobuf-ts-gen/example.client";
// import { HealthCheckRequest, HealthCheckReply } from "./protobuf-ts-gen/example";

const BACKEND_URL = `http://${import.meta.env.VITE_GRPC_SERVER_ADDRESS}:${import.meta.env.VITE_GRPC_SERVER_PORT}`;

const transport = new GrpcWebFetchTransport({
  baseUrl: BACKEND_URL,
});
const todoClient = new TodoServiceClient(transport);

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');

  const resetNewTodo = () => {
    setNewTodoTitle('');
    setNewTodoDescription('');
  };

  const addTodo = () => {
    if (newTodoTitle.trim() === '') return;

    const newTodo: Todo = {
      id: BigInt(Date.now()),
      title: newTodoTitle,
      description: newTodoDescription,
      completed: false,
    };

    todoClient
      .addTodo(newTodo)
      .then((res) => {
        setTodos([...todos, res.response]);
        setStatus(`Success!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));

    resetNewTodo();
  };

  const deleteTodo = (id: bigint) => {
    todoClient.deleteTodo({ id })
      .then((_) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        setStatus(`Success!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));
  };

  const updateTodo = (id: bigint, updatedTodo: Todo) => {
    todoClient
      .updateTodo(updatedTodo)
      .then((res) => {
        // TODO MIB
        // setTodos(todos.filter((todo) => todo.id !== id));
        // setTodos([...todos, res.response]);
        setTodos(todos.map((todo) => (todo.id === id ? res.response : todo)));
        setStatus(`Success!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));
  };

  const handleTodoChange = (id: bigint, field: keyof Todo, value: any) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, [field]: value } : todo
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>

      {/* Todo Entry */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newTodoDescription}
          onChange={(e) => setNewTodoDescription(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={addTodo} className="bg-blue-500 text-white p-2">
          Add Todo
        </button>
      </div>

      {/* Todo List */}
      <div>
        {todos.map((todo) => (
          <div key={todo.id.toString()} className="border p-2 mb-2">
            <input
              type="text"
              value={todo.title}
              onChange={(e) =>
                handleTodoChange(todo.id, 'title', e.target.value)
              }
              className="border p-1 mr-2"
            />
            <input
              type="text"
              value={todo.description}
              onChange={(e) =>
                handleTodoChange(todo.id, 'description', e.target.value)
              }
              className="border p-1 mr-2"
            />
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) =>
                handleTodoChange(todo.id, 'completed', e.target.checked)
              }
              className="mr-2"
            />
            <button
              onClick={() => updateTodo(todo.id, todo)}
              className="bg-green-500 text-white p-1 mr-2"
            >
              Update
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white p-1"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// export default function HealthCheck() {
// const [outputValue, setOutValue] = useState("Click 'Check Health!' to trigger a health check");

// const handleSubmit = async () => {
//   console.log(`Sending Request to ${BACKEND_URL}`);
//   echoClient
//     .checkHealth(HealthCheckRequest.create({}))
//     .then((res) => setOutValue(`Success! ${res}`))
//     .catch((e) => setOutValue(`Error! ${e}`));
// };

//   return (
//     <>
//       <div className="max-w-2xl p-8 text-center">
//         <h1 className="text-3xl font-bold underline">Hello world!</h1>
//         {/* <button className="border p-1 rounded shadow" onClick={handleSubmit}>Check Health!</button> */}
//         {/* <p>{outputValue}</p> */}
//       </div>
//     </>
//   );

// }