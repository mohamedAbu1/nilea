"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type StyledSelectOption = {
  value: string;
  label: string;
};

type StyledSelectProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  options?: StyledSelectOption[];
  children?: ReactNode;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  required?: boolean;
  disabled?: boolean;
};

export function StyledSelect({
  name,
  value,
  defaultValue,
  options: providedOptions,
  children,
  onChange,
  className = "",
  placeholder = "Choose an option",
  ariaLabel,
  required = false,
  disabled = false,
}: StyledSelectProps) {
  const childOptions = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; children?: ReactNode }>(child)) return [];
    const optionValue = child.props.value ?? String(child.props.children ?? "");
    return [{ value: optionValue, label: String(child.props.children ?? optionValue) }];
  });
  const options = providedOptions ?? childOptions;
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === (value ?? defaultValue))));
  const selectedValue = isControlled ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!isControlled) return;
    const nextIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(0, nextIndex));
  }, [isControlled, options, value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const handleFormReset = () => {
      if (isControlled) return;
      const resetValue = defaultValue ?? options[0]?.value ?? "";
      const resetIndex = options.findIndex((option) => option.value === resetValue);
      setInternalValue(resetValue);
      setActiveIndex(Math.max(0, resetIndex));
      setOpen(false);
    };
    form.addEventListener("reset", handleFormReset);
    return () => form.removeEventListener("reset", handleFormReset);
  }, [defaultValue, isControlled, options]);

  const choose = (nextValue: string, nextIndex: number) => {
    if (!isControlled) setInternalValue(nextValue);
    setActiveIndex(nextIndex);
    setOpen(false);
    onChange?.(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = open ? (activeIndex + direction + options.length) % options.length : Math.max(0, selectedIndex);
      setActiveIndex(nextIndex);
      setOpen(true);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : Math.max(0, options.length - 1));
      setOpen(true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[activeIndex]) choose(options[activeIndex].value, activeIndex);
      else setOpen(true);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") setOpen(false);
  };

  return (
    <div ref={rootRef} className={`alpnile-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <button
        type="button"
        className="alpnile-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-disabled={disabled}
        aria-required={required}
        disabled={disabled}
        onClick={() => { setActiveIndex(Math.max(0, selectedIndex)); setOpen((current) => !current); }}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>{selectedOption?.label ?? placeholder}</span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <div id={listId} className="alpnile-select-menu" role="listbox" aria-label={ariaLabel ?? name}>
          <div className="alpnile-select-menu-glow" aria-hidden="true" />
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              className={`alpnile-select-option ${option.value === selectedValue ? "is-selected" : ""} ${index === activeIndex ? "is-active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option.value, index)}
            >
              <span className="alpnile-select-option-mark" aria-hidden="true">𓂀</span>
              <span>{option.label}</span>
              {option.value === selectedValue && <b aria-hidden="true">✓</b>}
            </button>
          ))}
        </div>
      )}
      {required && <input className="alpnile-select-validation" tabIndex={-1} required={!selectedValue} aria-hidden="true" value={selectedValue} readOnly />}
    </div>
  );
}
