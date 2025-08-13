export default function UserList(task) {
  return (
    task.assigned_users.length > 0 ? (
      <ol key={task.id}>
        <h2 className="text-sm font-medium text-gray-700">
          Assigned users for {task.title}
        </h2>
        {task.assigned_users.map((au) => {
          return (
            <div
            key={au.user_id}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm mt-1 py-2 px-3"
            >
              <div className='flex justify-between items-center'>
                <div>
                  {au.user_name} ({au.user_email})
                </div>
                <div>
                  {au.role}
                </div>
              </div>
            </div>
          );
        })}
      </ol> 
    ) : (
      <h2 key={task.id} className="text-sm font-medium text-gray-700">
        There is no assigned users for {task.title}
      </h2>
    )
  );
}

