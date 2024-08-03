import { useCallback, useMemo, useState } from "preact/hooks";
import type React from "preact/compat";
import useSWR from "swr";
import { postTodo, postDelete, postComplete } from "./api";

const baseURL = "http://localhost:8090/api/collections";
type Todo = {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
};

export function Home() {
  const [user, setUser] = useState<string>("");

  const { data: userIds = [] } = useSWR<string[]>(
    `${baseURL}/users/records`,
    (url) =>
      fetch(url)
        .then((r) => r.json())
        .then((r) => {
          if (!Array.isArray(r.items)) return;
          const users = r.items.map((i) => i.id); //all user IDs
          setUser(users[0]); // set default user as first
          return users;
        })
  );

  const {
    data: todos = [],
    isLoading: todoLoading,
    mutate: changeTodo,
  } = useSWR<Todo[]>(
    `${baseURL}/todos/records${user && `?filter=(userId="${user}")`}`,
    (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .then((r) => r.items)
  );

  const completedTodos = useMemo(
    () => todos?.filter((todo) => todo.completed),
    [todos]
  );

  const addTodo = useCallback(
    async (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!e.currentTarget) return;

      const formData = new FormData(e.currentTarget);
      const text = formData.get("todo") as string;
      if (!text) return;

      const newTodo = {
        completed: false,
        title: text,
        userId: user,
      };
      const newCreatedTodo = (await postTodo(newTodo)) as Todo;

      changeTodo((todos) => [...todos, newCreatedTodo]);
    },
    [changeTodo, user]
  );

  const checkTodo = async (id: string, checked: boolean) => {
    const checkedTodo = await postComplete(id, checked);
    changeTodo((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: checkedTodo.completed } : todo
      )
    );
  };

  return (
    <div class="flex justify-center items-center min-h-screen bg-gray-100 text-neutral-800">
      <form class="block p-5 max-w-xs bg-white rounded-xl" onSubmit={addTodo}>
        <h1 class="mb-4 text-2xl font-bold text-neutral-800">Todo List</h1>
        <div class="flex justify-start items-center mb-5 border-1">
          <p>User ID: </p>
          <select
            value={user}
            class="py-0.5 ml-2 rounded-xl text-neutral-900"
            onChange={(e) => {
              setUser(e.currentTarget.value);
            }}
          >
            {userIds.map((userId) => (
              <option key={userId} value={userId}>
                {user === userId ? userId.toUpperCase() : userId}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          class="rounded-md text-neutral-900"
          placeholder="Enter to add Todo"
          name="todo"
        />
        <ol class="my-5 ml-5 list-decimal marker:text-neutral-800">
          {todos.map((todo) => (
            <li
              key={todo.id}
              class="container flex justify-between items-center px-2 py-1 my-1 cursor-pointer rounded-e-lg bg-neutral-300 text-neutral-800 group hover: hover:bg-neutral-200"
              title="click to delete "
            >
              <div class="flex items-center pr-4">
                <input
                  type="checkbox"
									checked={todo.completed}
                  name={`completed-${todo.id}`}
                  id="hi"
                  class="mr-4 peer"
                  onChange={(e) => checkTodo(todo.id, e.currentTarget.checked)}
                />
                <span class="peer-checked:line-through">{todo.title}</span>
              </div>
              <div
                class="hidden text-red-500 group-hover:block"
                // onClick={(e) => deleteTodo(todo.id)}
                onKeyUp={() => false}
              >
                ✗
              </div>
            </li>
          ))}
        </ol>

        {!!completedTodos.length && (
          <ol>
            <span class="italic text-mg text-neutral-600">Completed</span>
            {completedTodos.map((todo) => (
              <li
                key={todo.id}
                class="px-3 py-1 mb-2 ml-5 max-w-min line-through rounded-xl text-neutral-500 text-nowrap"
              >
                {todo.title}
              </li>
            ))}
          </ol>
        )}

        {todoLoading && (
          <div class="container flex justify-center italic text-gray-600">
            <div class="mr-1 animate-spin">0</div>

            <p>Loading Todos...</p>
          </div>
        )}
      </form>
    </div>
  );
}
