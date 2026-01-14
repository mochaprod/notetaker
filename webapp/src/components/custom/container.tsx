import clsx from "clsx";
import React from "react";

export const containerClasses = "flex flex-col justify-center w-full max-w-md px-4 pt-6 mx-auto";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
}

export function Container({ as: Component = "main", className, children, ...props }: ContainerProps) {
    return (
        <Component
            className={ clsx(containerClasses, className) }
            { ...props }
        >
            { children }
        </Component>
    );
}
