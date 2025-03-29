const UserEntry = () => {
    // Dummy representation of a user within a user list
    return (
        <div className= 'flex grid grid-cols-5 p-2 gap-4 bg-neutral-200'>
            <div className= 'basis-1/5'> 
                12345
            </div>
            <div className= 'basis-1/5'> 
                John
            </div>
            <div className= 'basis-1/5'> 
                Doe
            </div>
            <div className= 'basis-1/5'>
                johndoe@mega.org
            </div>
            <div className= 'basis-1/5'>
                Union Leader
            </div>
        </div>
    )
}
export default UserEntry