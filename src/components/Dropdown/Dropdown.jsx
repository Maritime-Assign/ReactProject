import DropdownButton from './DropdownButton.jsx'
import DropdownContent from './DropdownContent.jsx'
import DropdownItem from './DropdownItem.jsx'

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
                <DropdownItem>
                {content}
                </DropdownItem>
            </DropdownContent>
        </div>
    );
};

export default Dropdown;
