import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { useEffect, useState } from "react";
import { Todo } from "./protobuf-ts-gen/example";
import { TodoServiceClient } from "./protobuf-ts-gen/example.client";

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

  const fetchTodos = () => {
    todoClient
      .getTodos({})
      .then((res) => {
        setTodos(res.response.todos);
        setStatus(`Success init!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));
  };

  useEffect(() => {
    const loadTodos = () => {
      fetchTodos();
    };

    loadTodos();
  }, []); // The empty dependency array ensures this runs only once

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
        setStatus(`Success add!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));

    resetNewTodo();
  };

  const deleteTodo = (id: bigint) => {
    todoClient.deleteTodo({ id })
      .then((_) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        setStatus(`Success delete!`)
      })
      .catch((e) => setStatus(`Error! ${e}`));
  };

  const updateTodo = (id: bigint, updatedTodo: Todo) => {
    todoClient
      .updateTodo(updatedTodo)
      .then((res) => {
        setTodos(todos.map((todo) => (todo.id === id ? res.response : todo)));
        setStatus(`Success update!`)
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
    <div className="p-4 text-center bg-black text-white h-screen">
        <h1 className="text-center text-2xl font-bold mb-4">Todo App</h1>
        <h3 className="text-m font-bold mb-4">Status: {status}</h3>

        <div className="flex flex-col max-w-lg mx-auto gap-2 mb-10">
          <input
            type="text"
            placeholder="Title"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="border p-1 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            className="border p-1 mr-2"
          />
          <button onClick={addTodo} className="bg-blue-500 w-l text-white p-1 mr-2">
            Add Todo
          </button>
        </div>

        <div>
          {todos.map((todo) => (
            <div key={todo.id.toString()} className="p-1 mb-2">
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
