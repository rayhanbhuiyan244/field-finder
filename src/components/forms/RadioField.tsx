import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface RadioFieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface RadioFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  options: RadioFieldOption[];
  required?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function RadioField<T extends FieldValues>({
  name, label, description, options, required, className, orientation = "vertical",
}: RadioFieldProps<T>) {
  const form = useFormContext<T>();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              className={orientation === "horizontal" ? "flex flex-wrap gap-4" : "grid gap-2"}
            >
              {options.map((opt) => {
                const id = `${String(name)}-${opt.value}`;
                return (
                  <div key={opt.value} className="flex items-start gap-2">
                    <RadioGroupItem value={opt.value} id={id} />
                    <div className="grid gap-0.5 leading-none">
                      <Label htmlFor={id} className="cursor-pointer font-medium">{opt.label}</Label>
                      {opt.description && (
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}