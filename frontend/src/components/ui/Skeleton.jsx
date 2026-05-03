import { cn } from '../../utils/cn';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "bg-slate-200 dark:bg-slate-800 animate-shimmer rounded-md",
                className
            )}
            {...props}
        />
    );
};

export { Skeleton };
