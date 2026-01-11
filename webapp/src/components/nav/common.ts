import React from "react";

export type NavItem = {
    title: string;
    href: string;
    disabled?: boolean;
    icon?: React.ReactNode;
};
