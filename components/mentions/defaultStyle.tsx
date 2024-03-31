export default {
    control: {
      backgroundColor: "#fff",
      fontSize: 14,
      fontWeight: "normal",
      //width: "100%",
      //resize: "none",
    },
  
    "&multiLine": {
      control: {
        fontFamily: "monospace",
        minHeight: 63,
        minWidth: 180,
        //width: "100%",
        //maxWidth: 400,
        //overflow: "none",
      },
      highlighter: {
        padding: 9,
        border: "1px solid transparent",
      },
      input: {
        padding: 9,
        border: "1px solid white",
      },
    },
  
    "&singleLine": {
      display: "inline-block",
      width: 180,
  
      highlighter: {
        padding: 1,
        border: "2px inset transparent",
      },
      input: {
        padding: 1,
        border: "2px inset",
      },
    },
  
    suggestions: {
      list: {
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.15)",
        fontSize: 14,
      },
      item: {
        padding: "5px 15px",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        "&focused": {
          backgroundColor: "#cee4e5",
        },
      },
    },
  };