import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/AuthContext'
import { getUsers, updateUserPrivilege } from '@/api/user-service/UserService'
import { User } from '@/api/user-service/User'

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);

  const { auth } = useAuth();

  useEffect(() => {
    async function loadUsers() {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch {
            toast({
                description: "Unable to load user data!"
            });
        }
    }

    loadUsers();
  }, []);

  const toggleAdminStatus = async (userId: string) => {
    const userToUpdate = users.find(user => user._id === userId);

    if (!userToUpdate) {
      toast({
        title: "Unable to Update Admin Status",
        description: `There was an error in updating the admin status. Try again later.`,
      })
      return;
    }

    const response = await updateUserPrivilege(userId, !userToUpdate.isAdmin);
    if (response.status !== 200) {
        toast({
            title: "Unable to Update Admin Status",
            description: `There was an error in updating the admin status. Try again later.`,
        })
        return;
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isAdmin: !user.isAdmin } : user
      )
    )

    const updatedUser = users.find(user => user._id === userId)
    if (updatedUser) {
      toast({
        title: "Admin Status Updated",
        description: `${userToUpdate.username} is ${userToUpdate.isAdmin ? 'no longer' : 'now'} an admin.`,
      })
    }
  }

  return (
    <div className="container mx-auto pt-3 pb-5 max-w-4xl">
      <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-[200px]">Username</TableHead>
            <TableHead className="w-[200px]">Admin Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium w-[200px]">{user.username}</TableCell>
              <TableCell className="w-[200px]">
                {user.isAdmin ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    <Check className="w-4 h-4 mr-1" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <X className="w-4 h-4 mr-1" /> Not Admin
                  </span>
                )}
              </TableCell>
              <TableCell className="w-[150px]">
                { 
                    auth.username !== user.username ?  
                    <Button
                        onClick={() => toggleAdminStatus(user._id)}
                        className={user.isAdmin ? "btnred" : "btnblack"}
                        size="sm"
                    >
                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                    : <>-</>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      </div>
    </div>
  )
}