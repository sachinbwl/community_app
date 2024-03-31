import { useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import defaultStyle from "./defaultStyle";
import defaultMentionStyle from "./defaultMentionStyle";

const users = [
  {
    id: "jack",
    display: "Jack",
  },
  {
    id: "john",
    display: "john",
  },
];


const mentionattherate = () => {
    const [value, setValue] = useState("");
    
    return (
        <MentionsInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={"Comment..."}
          a11ySuggestionsListLabel={"Suggested mentions"}
          style={defaultStyle}
        >
          <Mention trigger="@" data={users} style={defaultMentionStyle} />
        </MentionsInput>
    );
  };
  
  export default mentionattherate;