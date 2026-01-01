// a reusable skeleton block - you control shape via className 

export function Skeleton({className} : {className?: string}){
    return (
        <div
            className={`animate-pulse bg-muted rounded-md ${className}`}
        />
    )
}