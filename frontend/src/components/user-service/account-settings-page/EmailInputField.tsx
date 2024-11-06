import { Input } from "@/components/ui/input";

/**
 * Email input field for the Account Settings page.
 */
export default function EmailInputField({ value, onChange } : { value : string, onChange : React.ChangeEventHandler<HTMLInputElement> }) {
    return (
        <div>
            <label htmlFor="input-email">Email</label>
            <Input
                type="text" 
                className="w-[350px]"
                value={ value }
                id="input-email"
                placeholder="Your email..."
                onChange={onChange}
            />
        </div>
    )
}