import React, { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type cellProps = { area: string, children: ReactNode } & HTMLAttributes<HTMLDivElement>;
const Cell = ({ area, children, style, className, ...props }: cellProps) => {
    return <div
        style={{ gridArea: area, ...style } as CSSProperties}
        className={`${area} ${className ?? ''}`} {...props}
    >
        {children}
    </div>
}

export default Cell;