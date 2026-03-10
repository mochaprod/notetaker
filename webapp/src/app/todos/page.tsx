"use client";

import { Container } from "@/components/custom/container";
import { TodoData } from "@common/types/todo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTodos, setTodoStatus } from "./actions/get-todos";
import { TodoItem } from "./components/todo-item";

const TODOS_QUERY_KEY = ["todos"];

export default function TodosPage() {
    const { data: todos } = useQuery({
        queryKey: TODOS_QUERY_KEY,
        queryFn: getTodos,
        initialData: [],
    });

    const setTodoStatusMutation = useMutation({
        mutationFn: async ({ todoId, done }: { todoId: string, done: boolean }) => setTodoStatus(todoId, done),
        mutationKey: ["setTodoStatus"],
        onMutate: async ({ todoId, done }: { todoId: string, done: boolean }, { client }) => {
            const previousTodos = client.getQueryData<TodoData[]>(TODOS_QUERY_KEY);
            client.setQueryData<TodoData[]>(TODOS_QUERY_KEY, (old) => old?.map(todo => todo.id === todoId ? { ...todo, done } : todo));
            return { previousTodos };
        },
        onError: (err, newTodo, mutateResult, { client }) => {
            client.setQueryData(TODOS_QUERY_KEY, mutateResult?.previousTodos);
        },
        onSettled: (data, error, variables, result, { client: queryClient }) => {
            queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
        },
    });

    return (
        <Container
            className="flex gap-6"
        >
            <h1
                className="text-3xl font-bold"
            >
                Tasks
            </h1>
            <div
                className="flex gap-2 flex-col"
            >
                { todos.map((data) => (
                    <TodoItem
                        key={ data.id }
                        data={ data }
                        setTodoStatus={ (setTo: boolean) => setTodoStatusMutation.mutate({
                            todoId: data.id,
                            done: setTo,
                        }) }
                    />
                )) }
            </div>
        </Container>
    );
}
