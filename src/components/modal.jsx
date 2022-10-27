import React from "react";
import { makeStyles, Divider, Typography, Modal } from "@material-ui/core";
import { CrossIcon } from "./Icons";
import clsx from "clsx";
import { getPageStyles } from "../utils/helpers";

function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${50}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  ...getPageStyles(theme),
  paper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, 0)",
    borderRadius: 25,
    backgroundColor: `#fff`,
    padding: theme.spacing(2, 3),
    "&:focus-visible": {
      outline: "none",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,

    [theme.breakpoints.down("sm")]: {
      paddingTop: 10,
      paddingBottom: 10,
    },
  },
  headerText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 20,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    minWidth: 600,
    width: "auto",
    maxHeight: "80vh",
    paddingTop: "10px !important",
    paddingBottom: "10px !important",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      minWidth: "75vw",
      maxWidth: "75vw",
      maxHeight: "80vh",
    },
  },
  crossIcon: {
    cursor: "pointer",
  },
  extended: {
    minWidth: 900,
    [theme.breakpoints.down("sm")]: {
      minWidth: "75vw",
      maxWidth: "75vw",
      maxHeight: "80vh",
    },
  },
}));

export const SimpleModal = (props) => {
  const { handleClose, children, title, extended, ...otherProps } = props;

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  return (
    <Modal
      open={props.open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      {...otherProps}
    >
      <div style={modalStyle} className={classes.paper}>
        <div className={classes.header}>
          <Typography className={classes.headerText}>{title}</Typography>

          {handleClose && (
            <CrossIcon onClick={handleClose} className={classes.crossIcon} />
          )}
        </div>
        <Divider />
        <div
          className={clsx({
            [classes.default_page_root]: true,
            [classes.default_page_removePadding]: true,
            [classes.body]: true,
            [classes.extended]: extended,
          })}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
};
