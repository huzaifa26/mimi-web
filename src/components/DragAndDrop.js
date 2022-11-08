import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FileUploader } from "react-drag-drop-files";
import { makeStyles, Typography } from "@material-ui/core";
import uploadIcon from "../assets/icons/cloudData.png";
import { FormattedMessage } from "react-intl";
import { getPageStyles, getSectionHeaderStyles } from "../utils/helpers";

const useStyles = makeStyles((theme) => {
  return {
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    summaryRoot: {
      margin: `0 auto`,
      borderRadius: 20,
      background: `#F9FAFA`,
      padding: 10,
    },

    selectAllDiv: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    selectAllTypo: {
      fontWeight: "bold",
    },
    gridContainer: {
      backgroundColor: "#F9FAFA",
    },
    gridItem: {
      height: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    roundContainer: {
      height: 100,
      width: 100,
      borderRadius: 60,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    summaryHeader: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      cursor: "pointer",
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: 180,
      width: 200,
      backgroundColor: "white",
    },
    buttonText: {
      fontWeight: "bold",
      fontSize: 20,
    },
    mainContainer: {
      backgroundColor: "#F9FAFA",
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      margin: 20,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    summaryMainDiv: {
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      margin: 10,
      justifyContent: "center",
      alignItems: "flex-start",
      padding: 20,
      width: "80%",
      backgroundColor: "#fff",
    },
    dottedDiv: {
      marginBottom: 5,
      height: 300,
      width: 400,
      backgroundColor: "#fff",
      border: "8px dashed #C1DBDB",
      borderRadius: 30,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    greyText: {
      color: "#AFAFB2",
      fontWeight: 500,
    },
    summaryButton: {
      display: "flex",
      justifyContent: "flex-end",
      margin: 10,
    },
    summaryDiv: {
      backgroundColor: "#F9FAFA",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      borderRadius: 20,
      margin: 10,
    },
    summaryTitle: {
      fontWeight: "bold",
      fontSize: 20,
    },
    uploadButton: {
      width: 200,
    },
    pinkButton: {
      backgroundColor: "#F4EEF7",
      height: 50,
      width: 300,
      color: "#000",
      fontSize: 16,
      margin: 20,
      "&:hover": {
        backgroundColor: "#e9cdf7",
      },
    },
  };
});

const fileTypes = ["XLSX", "CSV"];

function DragDrop(props) {
  const classes = useStyles();
  const [fileName, setFileName] = useState("");

  const handleChange = (file /*:File*/) => {
    /* Boilerplate to set up FileReader */
    setFileName(file?.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: "string",
        raw:true,
        
      });
      
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      props.handleSubmit(data);
     
    };
    reader.readAsText(file);
   
  };

  return (
    <FileUploader
      handleChange={handleChange}
      name="file"
      types={fileTypes}
      hoverTitle="."
    >
      <div className={classes.dottedDiv}>
        <img src={uploadIcon} alt="dragndrop-img" />
        <Typography className={classes.buttonText}>
          <FormattedMessage id="drag_&_drop_to_upload" />
        </Typography>
        <Typography
          style={{
            color: "#AFAFB2",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <FormattedMessage id="or_click_here_to_browse" />
        </Typography>
        {fileName && (
          <Typography
            style={{
              color: "#AFAFB2",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {fileName}
          </Typography>
        )}
      </div>
    </FileUploader>
  );
}

export default DragDrop;
