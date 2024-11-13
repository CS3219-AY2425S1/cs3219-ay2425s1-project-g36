import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../../ui/textarea";
import CustomMarkdown from "@/components/common/CustomMarkdown";

export default function QuestionInputField({ name, placeholder, value, setValue } : {
  name : string,
  placeholder : string,
  value : string,
  setValue : ( newValue : string ) => void
}) {
  function QuestionPreview() {
    return (
      <div className="h-[100%] rounded-md border border-input p-2 overflow-auto border-gray-900">
        <CustomMarkdown>
          { value }
        </CustomMarkdown>
      </div>
    )
  }

  const handleKeyDown = (event : any) => {
    if (event.key === "Tab") {
      event.preventDefault();
      
      // Insert spaces at the cursor position
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // add two spaces
      const spaces = "  ";

      // Insert the spaces at the cursor position
      const value = textarea.value;
      textarea.value = value.substring(0, start) + spaces + value.substring(end);

      // Move the cursor after the inserted spaces
      textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
    }

    // handlers for Ctrl+B, Ctrl+I (bold italic)
    if ((event.ctrlKey && ['b', 'i'].includes(event.key)) || event.key === "$") {
      event.preventDefault();

      // Get the textarea
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Retrieve the selected text
      const selectedText = textarea.value.substring(start, end);

      const boldText = { format: `**${selectedText}**`, bef: 2, aft: 2 };
      const italicText = { format: `_${selectedText}_`, bef: 1, aft: 1 };
      const eqnText = { format: `\$${selectedText}\$`, bef: 1, aft: 1 };

      const adjustedText = 
        (event.key === 'b') ? boldText :
        (event.key === 'i') ? italicText :
        eqnText;

      // Update the textarea value with the bold text
      const value = textarea.value;
      textarea.value =
        value.substring(0, start) + adjustedText.format + value.substring(end);

      // Set the cursor position after the inserted text
      textarea.selectionStart = start + adjustedText.bef; // Move cursor inside markers
      textarea.selectionEnd = end + adjustedText.aft;
    }
  };

  return (
    <div>
      <label htmlFor={ "input-" + name }>{ name }</label>
      <Tabs defaultValue="code" className="h-[300px]">
        <TabsList className="h-[30px]">
          <strong className="mr-3">View:</strong>
          <TabsTrigger value="code">Markdown</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="both">Markdown + Preview</TabsTrigger>
        </TabsList>
        <TabsContent className="h-[270px]" value="code">
          <Textarea 
            id={ "input-" + name } 
            placeholder={ placeholder }
            className="h-[100%] font-mono"
            value={ value }
            onKeyDown={ handleKeyDown }
            onChange={ (event) => {
              event.preventDefault();
              setValue(event.target.value);
            } }
          />
        </TabsContent>
        <TabsContent className="h-[270px]" value="preview">
          <QuestionPreview />
        </TabsContent>
        <TabsContent className="h-[270px]" value="both">
          <div className="flex h-[25px] gap-1">
            <div className="flex-[50%]">
              <strong>Markdown</strong>
            </div>
            <div className="flex-[50%]">
              <strong>Preview</strong>
            </div>
          </div>
          <div className="flex h-[245px] gap-1">
            <div className="flex-[50%]">
              <Textarea 
                id={ "input-" + name } 
                placeholder={ placeholder }
                className="h-[100%] font-mono"
                value={ value }
                onKeyDown={ handleKeyDown }
                onChange={ (event) => {
                  setValue(event.target.value);
                } }
              />
            </div>
            <div className="flex-[50%]">
              <QuestionPreview />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}