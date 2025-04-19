const DropdownButton = ({children, open, toggle}) => {
    return (
        <div 
        onClick={toggle}
        >
            {children}
        </div>
    );
};

export default DropdownButton;
