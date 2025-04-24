import './DropdownButton.css'

const DropdownButton = ({children, open, toggle}) => {
    return (
        <div
        className={`dropdown-btn rounded-full ${open ?
        'button-open rounded-full' : null}`}
        onClick={toggle}
        >
            {children}
        </div>
    );
};

export default DropdownButton;
