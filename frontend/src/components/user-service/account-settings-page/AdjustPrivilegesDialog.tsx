import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import AdjustPrivilegesList from "./AdjustPrivilegesList";

export default function AdjustPrivilegesDialog() {
    return (
        <Dialog>
            <DialogTrigger>
                <Button className="btnblack">
                    Adjust User Privileges
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-50">
                <DialogHeader>
                <DialogTitle>Adjust User Privileges</DialogTitle>
                <DialogDescription>
                    This form allows you to set other users as admins. Changes will be instantly saved. You cannot remove admin privileges from yourself.
                    <AdjustPrivilegesList />
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <DialogClose asChild>
                            <Button type="button" className="btngray" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}