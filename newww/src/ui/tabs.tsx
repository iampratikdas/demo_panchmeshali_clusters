import * as React from 'react';

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export const TabsList = ({ children, className = '' }: TabsListProps) => {
    return (
        <div className={`inline-flex items-center flex-col sm:flex-row gap-2 sm:gap-3 p-1.5 rounded-xl bg-muted/50 backdrop-blur-sm w-full sm:w-auto ${className}`}>
            {children}
        </div>
    );
};

export interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = context.value === value;

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all duration-200 flex-1 sm:flex-initial min-w-0 ${isActive
                ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/30'
                } ${className}`}
        >
            {children}
        </button>
    );
};

export interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const isActive = context.value === value;

    if (!isActive) return null;

    return (
        <div className={`mt-4 sm:mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
            {children}
        </div>
    );
};
