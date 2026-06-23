interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export default function Button({ children, isLoading, ...props }: ButtonProps) {
    return (
        <button
            className="w-full bg-primary hover:bg-primary-hover text-background font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center"
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </button>
    );
}