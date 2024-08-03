const baseURL = "http://localhost:8090/api/collections";

type Todo = {
  userId: string;
  title: string;
  completed: boolean;
};

export const postTodo = async (todo: Todo): Promise<Todo> =>
  fetch(`${baseURL}/todos/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  }).then((r) => r.json());

export const postComplete = async (id: string, completed: boolean): Promise<Todo> =>
  fetch(`${baseURL}/todos/records/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  }).then((r) => r.json());

export const postDelete = async (id: string): Promise<Todo> =>
  fetch(`${baseURL}/todos/records/${id}`, {
    method: "DELETE",
  }).then((r) => r.json());
