'use client';

import React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"

import { Button } from "@/app/_components/ui/button"

type Checked = DropdownMenuCheckboxItemProps["checked"]

import { ChevronsUpDown } from "lucide-react"

const userTypes = [{
    label: "Cliente",
    value: "cliente",
},
{
    label: "Dono de Barbearia",
    value: "dono_barbearia",

}];

export const UserTypeDropdown = ({ field }: { field: any }) => {
    const [value, setValue] = React.useState(field.value);
    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-muted-foreground">
                    {value ? userTypes.find((type) => type.value === value)?.label : "Escolha "}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
                <DropdownMenuSeparator />
                {userTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                        key={type.value}
                        checked={value === type.value}
                        onCheckedChange={() => {
                            const newValue = type.value;
                            setValue(newValue);
                            field.onChange(newValue);
                        }}
                    >
                        {type.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};