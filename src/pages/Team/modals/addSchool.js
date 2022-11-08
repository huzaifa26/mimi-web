import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Menu,
} from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import { FirebaseHelpers, getModalStyles } from "../../../utils/helpers";
import { useStore, useUi } from "../../../store";
import { Button } from "../../../components";

const useStyles = makeStyles((theme) => ({
  ...getModalStyles(theme),

  crossIcon: {
    cursor: "pointer",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
  },
  headerText: {
    color: "black",
    fontWeight: "bold",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    width: "98%",
  },

  buttonOne: {
    width: "40%",
    backgroundColor: "rgba(143, 146, 161, 0.1)",
    borderRadius: 16,
    marginRight: "5%",
    textTransform: "none",
  },
  buttonTwo: {
    width: "40%",
    backgroundColor: "#685BE7",
    borderRadius: 16,
    color: "#ffffff",
    textTransform: "none",
  },
  buttonsDiv: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  columnFlex: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  detailsTypo: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8F92A1",
    display: "inline",
  },
  footerDiv: {
    display: "flex",
    flexDirection: "column",
  },
  daysDiv: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(143, 146, 161, 0.05)",
    textAlign: "left",
    display: "flex",
    justifyContent: "flex-start",
    marginTop: 10,
    textTransform: "none",
    fontSize: 9,
    fontWeight: "bold",
  },
}));

export const AddSchoolBody = (props) => {
  const { actions } = useUi();
  const { state: storeState } = useStore();
  const { user, } = storeState;
  const classes = useStyles();
  const [ReferenceCode, setReferenceCode] = useState();
  const [language, setLanguage] = useState();
  const [loading, setLoading] = useState(false);
  const [defaultImage, setDefaultImage] = useState(
    "https://firebasestorage.googleapis.com/v0/b/mimi-plan.appspot.com/o/images%2FdefaultAvatar.png?alt=media&token=d8133d4a-1874-4462-9b3b-3e24baefa6b9"
  );
  const [name, setName] = useState();
  // const [code, setCode] = useState();
  const [expireDate, setExpireDate] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null); //state variables for drop downs
  const [noReference, setNoReference] = useState(false);
  const [anchorType, setAnchorType] = useState(null);
  // const [image, setImage] = useState();
  // const [imageSrc, setImageSrc] = useState();
  // const [openUI, setOpenUI] = useState();
  const [id, setId] = useState();
  const handleType = (event) => {
    setAnchorType(event.currentTarget);
  };
  const handleTypeClose = () => {
    setAnchorType(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await FirebaseHelpers.createInstitution.execute({
        user,
        institute: {
          id: id.toUpperCase(),
          image: defaultImage,
          name: name,
          expireDate: expireDate,
          language: language,
          referenceCode: ReferenceCode,
        },
      });
    } catch (error) {
      actions.alert(error, "error");
      setLoading(false);
    }
  };

  return (
    <div className={classes.paper}>
      <div className={classes.footer}>
        <TextField
          className={classes.nameTypo}
          id="standard-basic"
          label={<FormattedMessage id="school_name"></FormattedMessage>}
          size="small"
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          className={classes.nameTypo}
          id="standard-basic"
          label={<FormattedMessage id="code"></FormattedMessage>}
          size="small"
          onChange={(e) => setId(e.target.value)}
          inputProps={{ maxLength: 6 }}
        />
        <Typography className={classes.detailsTypo}>
          <FormattedMessage id="subscription_expire_date"></FormattedMessage>
        </Typography>
        <TextField
          className={classes.nameTypo}
          id="standard-basic"
          size="small"
          type="date"
          onChange={(e) => setExpireDate(e.target.value)}
        />
        <div className={classes.columnFlex}>
          <div className={classes.footerDiv}>
            <Typography className={classes.detailsTypo}>
              <FormattedMessage id="reference_code"></FormattedMessage>
            </Typography>
            <div>
              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleType}
                className={classes.button}
                disabled={!noReference}
              >
                {ReferenceCode ? ReferenceCode : "Select Reference Code"}
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorType}
                keepMounted
                open={Boolean(anchorType)}
                onClose={handleTypeClose}
              >
                {/* Dummy List items */}
                <MenuItem
                  onClick={() => {
                    setReferenceCode("1526");
                    handleTypeClose();
                  }}
                >
                  1526
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setReferenceCode("1234");
                    handleTypeClose();
                  }}
                >
                  1234
                </MenuItem>
              </Menu>
            </div>
          </div>
          <div className={classes.footerDiv}>
            <Typography className={classes.detailsTypo}>
              <FormattedMessage id="language"></FormattedMessage>
            </Typography>
            <div>
              {/* quantity Drop down */}

              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
                className={classes.button}
              >
                {language ? language : "Select Language"}
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    setLanguage("English");
                    handleClose();
                  }}
                >
                  English
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setLanguage("Hebrew");
                    handleClose();
                  }}
                >
                  Hebrew
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>

        <div className={classes.daysDiv}>
          {/* unlimited check box */}
          <Checkbox
            defaultChecked
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            size="small"
            onClick={() => setNoReference(!noReference)}
          />
          <Typography className={classes.detailsTypo}>
            <FormattedMessage id="no_reference"></FormattedMessage>
          </Typography>
        </div>
      </div>
      <div className={classes.buttonsDiv}>
        <Button className={classes.buttonOne}>
          <FormattedMessage id="cancel"></FormattedMessage>
        </Button>
        <Button
          className={classes.buttonTwo}
          onClick={handleSubmit}
          loading={loading}
        >
          <FormattedMessage id="add"></FormattedMessage>
        </Button>
      </div>
    </div>
  );
};
