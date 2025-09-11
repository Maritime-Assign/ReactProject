import './DropdownContent.css'

const DropdownContent = ({children, open}) => {
    return (
        <div
        className={`dropdown-content ${open ?
        'content-open' : null}`}
        >
            {children}
        </div>
    );
};

export default DropdownContent;
