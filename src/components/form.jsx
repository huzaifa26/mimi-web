import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => {
  return {
    formContainer: {
      position: "relative",
      background: "#fff",
      padding: "20px 50px",
      margin: "0 auto",
      borderRadius: "20px",
      justifyContent: "center",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      [theme.breakpoints.up("lg")]: {
        width: 500,
      },
      [theme.breakpoints.only("md")]: {
        width: 520,
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },

      "& > *": {
        width: "100%",
        marginBottom: 10,
      },
    },
  };
});

export const Form = ({ children }) => {
  const classes = useStyles();

  return <div className={clsx([classes.formContainer])}>{children}</div>;
};
