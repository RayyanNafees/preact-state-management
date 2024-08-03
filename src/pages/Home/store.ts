import { signal, computed, effect } from "@preact/signals";
import type React from "preact/compat";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};
export const todos = signal<Todo[]>([]);
export const user = signal<string>("");
export const userIds = signal<string[]>([]);

const baseURL = "http://localhost:8090/api/collections";

const todoURL = computed(
  () =>
    `${baseURL}/todos/records${
      user.value && `?filter=(userId="${user.value}")`
    }`
);

// todoURL = http://localhost:8090/api/collections/todos/records[?filter=(userId="test")]

// export const

export const fetchTodos = async () => {
  const newTodos = await fetch(todoURL.value)
    .then((r) => r.json())
    .then((r) => r.items);

  todos.value = newTodos || [];
};

export const fetchUsers = async () => {
  const newUsers = await fetch(`${baseURL}/users/records`)
    .then((r) => r.json())
    .then((r) => r.items.map(i=>i.id));

  userIds.value = newUsers || []
  user.value = newUsers[0];
};

effect(() => {
  fetchTodos();
});

effect(()=>{
  fetchUsers()
})

export const completedTodos = computed(() =>
  todos.value.filter((todo) => todo.completed)
);

export const addTodo = (e: React.ChangeEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!e.currentTarget) return;

  const form = new FormData(e.currentTarget as HTMLFormElement);
  const input = e.currentTarget.children.namedItem("todo") as HTMLInputElement;

  const text = form.get("todo") as string;
  if (!text) return;

  todos.value = todos.value.concat({
    id: crypto.randomUUID(),
    title: text,
    completed: false,
  });

  input.value = "";
};

export const deleteTodo = (id: string) => {
  todos.value = todos.value.filter((todo) => todo.id !== id);
};

export const checkTodo = (id: string, completed: boolean) => {
  todos.value = todos.value.map((todo) =>
    todo.id === id ? { ...todo, completed } : todo
  );
};
