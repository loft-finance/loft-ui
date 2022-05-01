export default ({value, decimals = 2, ...props }: any) => {
    if(Number(value) < 0) return <>--</>
    
    const v = (Number(value) * 100).toFixed(2);
    return (
        <>{v} %</>
    );
}