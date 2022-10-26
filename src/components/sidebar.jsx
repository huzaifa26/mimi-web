import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import logo from "../assets/logo/applogo.png";
import icons from "./Icons";
import {
  Divider,
  Typography,
  IconButton,
  ListItemIcon,
  Grid,
  Button,
  Avatar,
  Box,
} from "@material-ui/core";
import { useHistory, useLocation } from "react-router";
import { alpha } from "@material-ui/core/styles/colorManipulator";
import { LANGUAGE_ORIENTATION, RoleMappings, ROLES } from "../utils/constants";
import { useStore, useUi } from "../store";
import { Routes } from "../utils/config";
import { auth } from "../utils/firebase";

const drawerWidth = 250;
const activeBgColor = alpha(`#E4E4E4`, 0.2);

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "100%",
    background: "#fff",
    overflowX: "hidden",
  },
  logoImage: {
    height: "60px",
    width: "60px",
    borderRadius: "50%",
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 15,
  },
  toolbar: {
    margin: 0,
    padding: 0,
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 ",
    ...theme.mixins.toolbar,
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },

  listItemText: {
    color: "#808191",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingRight: "5px",
    color: "#ffffff",
  },

  divider: {
    marginTop: "auto",
    background: "#303030",
  },
  listItemIcons: {
    justifyContent: "center",
    color: "#808191",
    margin: "0px auto",
  },
  drawer: {
    background: "#1B1D21",
    color: "#f3f3f3",
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    overflowX: "hidden",
    borderRadius:
      theme.direction === "ltr" ? "0px 20px 20px 0px" : "20px 0px 0px 20px",
    background: "#1B1D21",
    color: "#f3f3f3",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  drawerClose: {
    background: "#1B1D21",
    color: "#f3f3f3",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7) + 1,
    },
    "& $list": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  profileName: {
    fontSize: "medium",
    textTransform: "capitalize",
  },
  profileRole: {
    fontSize: "small",
    color: "#808191",
    textTransform: "capitalize",
  },
  profileText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  profileContainer: {
    "& .MuiListItemText-primary": {
      textTransform: "capitalize",
      color: "#fff",
    },
    "& .MuiListItemText-secondary": {
      textTransform: "capitalize",
      color: "#808191",
    },
  },
  list: {
    paddingLeft: "1rem",
    paddingRight: "1rem",
    flexDirection: theme.direction === "ltr" ? "row" : "row-reverse",
    textAlign: "start",
  },
  active: {
    borderRadius: 10,
    background: `${activeBgColor} !important`,
    "& .MuiListItemText-root .MuiTypography-root": {
      color: "#fff !important",
    },
  },
  content: {
    flex: 1,
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    padding: 20,
    [theme.breakpoints.only("xs")]: {
      padding: 0,
    },
  },

  fullScreen: {
    height: "100%",
    width: "100%",
  },
}));

export function Sidebar({ children }) {
  const location = useLocation();
  const history = useHistory();
  const classes = useStyles();
  const { state: uiState } = useUi();
  const { state: storeState } = useStore();
  const [open, setOpen] = useState(window.innerWidth > 500 ? true : false);

  if (!storeState.user || !uiState.sidebar) return children;

  const { user, defaultAvatars, orientation } = storeState;
  console.log(user);

  const checkActive = (path) => {
    const [basePath] = path.split("/").filter((el) => el);

    const [comparison] = location.pathname.split("/").filter((el) => el);

    return basePath === comparison;
  };

  return (
    <Box display={"flex"} className={classes.root}>
      {user?.permissions?.webPanelAccess === true &&
        <Drawer
        variant="permanent"
        open={open}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={() => setOpen(!open)}>
            {open ? icons.right : icons.menu}
          </IconButton>
        </div>
        <List>
          {open && (
            <ListItem>
              <img src={logo} className={classes.logoImage} />
              <ListItemText
                primary="Mimi"
                classes={{ primary: classes.logoText }}
              />
            </ListItem>
          )}

          {Routes.filter((el) => el.icon).map((el, idx) => {
            if (
              user.type !== ROLES.admin &&
              el.roles.length &&
              !el.roles.includes(user.type)
            )
              return;

            return (
              <ListItem
                component={"li"}
                key={idx}
                button
                className={clsx({
                  [classes.list]: true,
                  [classes.active]: checkActive(el.path),
                })}
                onClick={() => {
                  history.push(el.path);
                }}
              >
                {orientation == "ltr" && (
                  <ListItemIcon className={classes.listItemIcons}>
                    {el.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={el.title}
                  classes={{ primary: classes.listItemText }}
                />

                {orientation == "rtl" && (
                  <ListItemIcon className={classes.listItemIcons}>
                    {el.icon}
                  </ListItemIcon>
                )}
              </ListItem>
            );
          })}
        </List>
        <Divider className={classes.divider} />

        <ListItem
          component={"li"}
          button
          className={clsx({
            [classes.list]: true,
            [classes.active]: checkActive("/profile"),
            [classes.profileContainer]: true,
          })}
          onClick={() => {
            history.push("/profile");
          }}
        >
          {orientation == "ltr" && (
            <ListItemIcon className={classes.listItemIcons}>
              <Avatar src={user.image || defaultAvatars?.staff} />
            </ListItemIcon>
          )}
          <ListItemText
            primary={user.name}
            secondary={RoleMappings[user.type]}
            classes={{ primary: classes.listItemText }}
          />

          {orientation == "rtl" && (
            <ListItemIcon className={classes.listItemIcons}>
              <Avatar src={user.image || defaultAvatars?.staff} />
            </ListItemIcon>
          )}
        </ListItem>
        </Drawer>
      } 

      <main className={classes.content}>{children}</main>
    </Box>
  );
}
