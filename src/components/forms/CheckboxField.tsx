import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
}: CheckboxFieldProps<T>) {
  const form = useFormContext<T>();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={"flex flex-row items-start gap-3 space-y-0 " + (className ?? "")}>
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="grid gap-1 leading-none">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
