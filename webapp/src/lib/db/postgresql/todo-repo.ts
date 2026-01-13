import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { TodoRepository } from "../db";
import { Todo, TodoData } from "@common/types/todo";

export class PostgresqlTodoRepository implements TodoRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async addTodo(userId: string, todoData: Todo) {
        const {
            content,
            done,
            important,
            datetime,
        } = todoData;

        const todo = await this.prisma.todo.create({
            data: {
                content,
                done,
                important,
                dateTime: datetime,
                userId,
            },
        });

        const {
            dateTime,
            ...data
        } = todo;

        return {
            ...data,
            datetime: dateTime,
        };
    }

    async getTodos(userId: string): Promise<TodoData[]> {
        const todos = await this.prisma.todo.findMany({
            where: {
                userId,
            },
            orderBy: {
                dateTime: "desc",
            },
        });

        return todos.map(({
            id,
            content,
            done,
            important,
            dateTime,
            createdAt,
            updatedAt,
        }) => ({
            id,
            content,
            done,
            important,
            datetime: dateTime,
            createdAt,
            updatedAt,
        }));
    }

    async updateTodo(userId: string, todoId: string, data: Todo) {
        const {
            content,
            done,
            important,
            datetime,
        } = data;

        await this.prisma.todo.update({
            where: {
                id: todoId,
                userId,
            },
            data: {
                content,
                done,
                important,
                dateTime: datetime,
                updatedAt: new Date(),
            },
        });
    }

    async deleteTodo(userId: string, todoId: string) {
        await this.prisma.todo.delete({
            where: {
                id: todoId,
                userId,
            },
        });
    }
}
