import { Input } from "@/components/ui/input";

/**
 * Username input field for the Account Settings page.
 */
export default function UsernameInputField({ value, onChange } : { value : string, onChange : React.ChangeEventHandler<HTMLInputElement> }) {
    return (
        <div>
            <label htmlFor="input-username">Username</label>
            <Input
                type="text" 
                className="w-[350px]"
                value={ value }
                id="input-username"
                placeholder="Your username..."
                onChange={onChange}
            />
        </div>
    )
}