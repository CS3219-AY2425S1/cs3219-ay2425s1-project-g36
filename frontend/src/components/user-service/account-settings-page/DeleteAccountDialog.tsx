import { deleteAccount } from "@/api/user-service/UserService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function DeleteAccountDialog() {
    const { auth, logout } = useAuth();
    const { toast } = useToast();
    const HTTP_OK = 200;

    async function handleDeleteClick() {
        // get current user ID and username
        const userId = auth.id;
        const username = auth.username;

        // delete user account, and send toast notification indicating account deletion
        const response = await deleteAccount(userId);

        if (response.status === HTTP_OK) {
            // log user out
            logout();

            toast({
                description: `Deleted user ${username} successfully`,
            });
        } else {
            // deletion wasn't successful, inform user

            toast({
                description: `There was an error when deleting user ${username}. Try again later?`,
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button className="btnred">
                    Delete Account
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-50">
                <DialogHeader>
                <DialogTitle>Are you absolutely sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data.
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <DialogClose asChild>
                            <Button type="button" className="btngray" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="button" className="btnred" variant="secondary" onClick={ handleDeleteClick }>
                                Delete
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}