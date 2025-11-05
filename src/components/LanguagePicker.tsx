import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./LanguagePicker.module.scss";

export type LanguageCode = "en" | "uk" | "de";

type Lang = {
    code: LanguageCode;
    label: string;
    Flag: React.FC<React.SVGProps<SVGSVGElement>>;
};

// --- Custom-drawn flag SVGs (simple, clean, no external assets) --- //
const FlagEN: Lang["Flag"] = (props) => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 30" width="960" height="600" {...props}>
	<clipPath clipPathUnits="userSpaceOnUse" id="cp">
		<path d="M0 0v15h48v15zM0 30h24V0h24z"/>
	</clipPath>
	<path fill="#012169" d="M0 0h48v30H0z"/>
	<path stroke="#FFF" stroke-width="6" d="M0 0 48 30M48 0 0 30"/>
	<path stroke="#c8102e" stroke-width="4" clip-path="url(#cp)" d="M0 0 48 30M48 0 0 30"/>
	<path fill="#c8102e" stroke="#FFF" stroke-width="2" d="M-1 11H20V-1h8v12h21v8H28V31H20V19H-1z"/>
</svg>
);

const FlagUA: Lang["Flag"] = (props) => (
    <svg viewBox="0 0 24 16" aria-hidden="true" {...props}>
        <rect width="24" height="16" fill="#0057b7" />
        <rect y="8" width="24" height="8" fill="#ffd700" />
    </svg>
);

const FlagDE: Lang["Flag"] = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width="1000" height="600" viewBox="0 0 5 3"><rect id="black_stripe" width="5" height="3" y="0" x="0" fill="#000" /><rect id="red_stripe" width="5" height="2" y="1" x="0" fill="#D00" /><rect id="gold_stripe" width="5" height="1" y="2" x="0" fill="#FFCE00" /></svg>
);

const LANGS: Lang[] = [
    { code: "en", label: "English", Flag: FlagEN },
    { code: "uk", label: "Українська", Flag: FlagUA },
    { code: "de", label: "Deutsch", Flag: FlagDE },
];

export interface LanguagePickerProps {
    /** Controlled selected value */
    value?: LanguageCode;
    /** Uncontrolled initial value */
    defaultValue?: LanguageCode;
    onChange?: (code: LanguageCode) => void;
    /** Extra class on the root wrapper */
    className?: string;
    /** Optional aria-label for the toggle button (for screen readers) */
    buttonAriaLabel?: string;
    /** Optional custom render for label next to the flag in button */
    renderButtonText?: (code: LanguageCode) => React.ReactNode;
}

/**
 * Header-ready language picker with an accessible dropdown.
 * No external libraries. Styles via CSS Modules (SCSS).
 */
const LanguagePicker: React.FC<LanguagePickerProps> = ({
    value,
    defaultValue = "en",
    onChange,
    className,
    buttonAriaLabel = "Choose language",
    renderButtonText,
}) => {
    const [open, setOpen] = useState(false);
    const [internal, setInternal] = useState<LanguageCode>(defaultValue);
    const selected = value ?? internal;

    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [focusIndex, setFocusIndex] = useState<number>(-1);
    const listId = useId();

    // Close on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (rootRef.current.contains(e.target as Node)) return;
            setOpen(false);
        }
        if (open) document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    // Keyboard navigation handling when the menu is open
    useEffect(() => {
        if (!open) return;
        setFocusIndex(LANGS.findIndex((l) => l.code === selected));
    }, [open, selected]);

    useEffect(() => {
        if (!open) return;
        const items = listRef.current?.querySelectorAll<HTMLButtonElement>(
            `button.${styles.menuItem}`
        );
        if (items && focusIndex >= 0 && focusIndex < items.length) {
            items[focusIndex].focus();
        }
    }, [focusIndex, open]);

    const choose = (code: LanguageCode) => {
        if (value === undefined) setInternal(code);
        onChange?.(code);
        setOpen(false);
    };

    const onButtonKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
        }
    };

    const onListKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusIndex((i) => (i + 1) % LANGS.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusIndex((i) => (i - 1 + LANGS.length) % LANGS.length);
        }
    };

    const CurrentFlag = LANGS.find((l) => l.code === selected)?.Flag ?? FlagEN;

    return (
        <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
            <button
                type="button"
                className={styles.button}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((o) => !o)}
                onKeyDown={onButtonKeyDown}
                aria-label={buttonAriaLabel}
            >
                <CurrentFlag className={styles.flag} />
                <span className={styles.buttonText} style={{ display: "none" }}>
                    {renderButtonText ? renderButtonText(selected) :
                        LANGS.find((l) => l.code === selected)?.label}
                </span>
            </button>

            <div
                id={listId}
                role="menu"
                aria-label="Language menu"
                className={styles.menu}
                data-open={open || undefined}
                onKeyDown={onListKeyDown}
                ref={listRef}
            >
                {LANGS.map(({ code, label, Flag }, idx) => (
                    <button
                        key={code}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected === code}
                        className={styles.menuItem}
                        data-active={selected === code || undefined}
                        onClick={() => choose(code)}
                        tabIndex={idx === 0 ? 0 : -1}
                    >
                        <Flag className={styles.flag} />
                        <span className={styles.optionLabel}>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguagePicker;
