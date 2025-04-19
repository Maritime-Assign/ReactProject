import DropdownButton from './DropdownButton.jsx'
import DropdownContent from './DropdownContent.jsx'

import { useState } from 'react';

const Dropdown = ({buttonText, content}) => {

    const [open, setOpen] = useState(false);

    const toggleDropdown = () => {
        setOpen((open) => !open);
    };

    return(
        <div>
            <DropdownButton
            toggle={toggleDropdown}
            open={open}>
                {buttonText}
            </DropdownButton>
            <DropdownContent
            open={open}>
                {content}
            </DropdownContent>
        </div>
    );
};

export default Dropdown;
