import {
  alpha,
  Box,
  Divider,
  Grid,
  Input,
  makeStyles,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import React, { Fragment, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Button,
  Delete,
  Links,
  Loader,
  SimpleModal,
  ToolButton,
} from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import {
  FirebaseHelpers,
  getModalStyles,
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../../utils/helpers";

import Group from "../../../assets/icons/groupicon.png";
import Permission from "../../../assets/icons/Shield_done.png";
import History from "../../../assets/icons/history.png";
import GroupAccess from "../../../assets/icons/teamPic.png";
import Report from "../../../assets/icons/setReport.png";
import { ManagePermissionsBody } from "./managePermissions";
import { ManageAccessBody } from "./manageAccess";
import { ReportBody } from "./addReport";
import { HistoryBody } from "./history";
import { RoleMappings, ROLES } from "../../../utils/constants";
import { useRef } from "react";
import { nanoid } from "nanoid";

export const ProfileBody = (props) => {
  const { handleClose, staffId } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, defaultAvatars } = storeState;

  const intl = useIntl();

  const [staff, setStaff] = useState();

  const [modalStates, setModalStates] = useState({
    managePermsissions: false,
    manageAccess: false,
    history: false,
    report: false,
  });

  const staffLog=useRef(null);

  // Log
  useEffect(() => {
    return async() => {
      if (staffLog.current !== null) {
        const subject_id = nanoid(6);
        const payload = {
            id: subject_id,
            activity: "staff",
            subActivity: staffLog?.current?.name,
            uid: user.id
        }
        console.log("staff "+staffLog?.current?.name+" opened, uid:" + user.id);
        // await db
        //     .collection('Institution')
        //     .doc(user._code)
        //     .collection('log')
        //     .doc(payload.id)
        //     .set(payload)
    }
    }
  }, [])

  useEffect(() => {
    db.collection("Institution")
      .doc(user._code)
      .collection("staff")
      .doc(staffId)
      .onSnapshot(async (snapshot) => {
        const _staff = snapshot.data();
        staffLog.current=snapshot.data()

        const canAccessKids = [ROLES.gStaff].includes(_staff.type);

        if (canAccessKids) {
          if (_staff.kids_access.length === 1) {
            _staff._groups = `1 ${intl.formatMessage({ id: "kid" })}`;
          } else {
            if (!_staff.kids_access?.length) {
              _staff._groups = intl.formatMessage({ id: "no_kids" });
            } else {
              _staff._groups = `${
                _staff.kids_access.length
              } ${intl.formatMessage({ id: "kids" })}`;
            }
          }
        } else {
          if (_staff.group_ids.length === 1) {
            const [groupId] = _staff.group_ids;
            const _group = (
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("groups")
                .doc(groupId)
                .get()
            ).data();

            _staff._groups = _group.name;
          } else {
            if (!_staff.group_ids?.length) {
              _staff._groups = intl.formatMessage({ id: "no_groups" });
            } else {
              _staff._groups = `${_staff.group_ids.length} ${intl.formatMessage(
                { id: "groups" }
              )}`;
            }
          }
        }

        setStaff(_staff);
      });
  }, []);

  const closeManagePermissions = () => {
    setModalStates((prev) => ({ ...prev, managePermsissions: false }));
  };
  const closeManageAccess = () => {
    setModalStates((prev) => ({ ...prev, manageAccess: false }));
  };
  const closeHistory = () => {
    setModalStates((prev) => ({ ...prev, history: false }));
  };
  const closeReport = () => {
    setModalStates((prev) => ({ ...prev, report: false }));
  };

  const handleDeleteStaff = () => {
    const action = async () => {
      await FirebaseHelpers.deleteStaff.execute({
        staff,
        user,
      });
  

      handleClose();
    };

    actions.showDialog({
      action,
      title: `Delete ${staff.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  if (!staff) return <Loader />;

  return (
    <Fragment>
      <SimpleModal
        title={<FormattedMessage id="manage_permissions" />}
        open={modalStates.managePermsissions}
        handleClose={closeManagePermissions}
      >
        <ManagePermissionsBody
          handleClose={closeManagePermissions}
          staff={staff}
        />
      </SimpleModal>
      <SimpleModal
        extended
        title={<FormattedMessage id="manage_access" />}
        open={modalStates.manageAccess}
        handleClose={closeManageAccess}
      >
        <ManageAccessBody handleClose={closeManageAccess} staff={staff} />
      </SimpleModal>
      <SimpleModal
        extended
        title={<FormattedMessage id="history" />}
        open={modalStates.history}
        handleClose={closeHistory}
      >
        <HistoryBody handleClose={closeHistory} staff={staff} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="manage_general_staff_report" />}
        open={modalStates.report}
        handleClose={closeReport}
      >
        <ReportBody handleClose={closeReport} staff={staff} />
      </SimpleModal>

      <div className={classes.header}>
        <div>
          <div className={classes.imageContainer}>
            <img
              src={staff?.image || defaultAvatars.staff}
              className={classes.staffImage}
            />
          </div>
        </div>
        <Box>
          <Typography
            className={clsx([
              classes.default_typography_capitalize,
              classes.default_typography_bold,
              classes.default_typography_heading,
            ])}
          >
            {staff.name}
          </Typography>
          <Typography
            className={clsx([
              classes.default_typography_colorLight,
              classes.default_typography_paragraph,
            ])}
          >
            {staff.email}
          </Typography>

          <Typography
            className={clsx([
              classes.default_typography_capitalize,
              classes.default_typography_colorLight,
              classes.default_typography_paragraph,
            ])}
          >
            {RoleMappings[staff.type]}
          </Typography>
          <Typography
            className={clsx([
              classes.default_typography_capitalize,
              classes.default_typography_colorLight,
              classes.default_typography_paragraph,
            ])}
          >
            {staff._groups}
          </Typography>
        </Box>

        <Box display={"flex"} alignItems={"center"} justifyContent="center">
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            mx={1}
            style={{
              width: 70,
              height: 70,
              background: "#8F92A10D",
              borderRadius: "50%",
            }}
          >
            <img src={Group} />
          </Box>
          <Box>
            <Typography
              className={clsx([
                classes.default_typography_colorLight,
                classes.default_typography_capitalize,
                classes.default_typography_bold,
                classes.default_typography_label,
              ])}
            >
              <FormattedMessage id="reports(this week)" />
            </Typography>
            <Box display={"flex"} alignItems={"center"}>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_heading,
                ])}
              >
                0
              </Typography>
              <Box marginX={2}>
                <Typography
                  className={clsx([
                    classes.default_typography_colorSuccess,
                    classes.default_typography_capitalize,
                    classes.default_typography_bold,
                    classes.default_typography_subHeading,
                  ])}
                >
                  0%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} alignItems={"center"} marginX="auto">
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            mx={1}
            style={{
              width: 70,
              height: 70,
              background: "#8F92A10D",
              borderRadius: "50%",
            }}
          >
            <img src={Group} />
          </Box>
          <Box>
            <Typography
              className={clsx([
                classes.default_typography_colorLight,
                classes.default_typography_capitalize,
                classes.default_typography_bold,
                classes.default_typography_label,
              ])}
            >
              <FormattedMessage id="reports(this month)" />
            </Typography>
            <Box display={"flex"} alignItems={"center"}>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_heading,
                ])}
              >
                0
              </Typography>
              <Box marginX={2}>
                <Typography
                  className={clsx([
                    classes.default_typography_colorSuccess,
                    classes.default_typography_capitalize,
                    classes.default_typography_bold,
                    classes.default_typography_subHeading,
                  ])}
                >
                  0%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </div>

      <Grid container>
        <Grid item lg={6} xs={12}>
          <Box marginY={2}>
            <Divider />
          </Box>
          <Grid container spacing={1}>
            <Grid item md={6} xs={12}>
              <ToolButton
                image={<img src={GroupAccess} />}
                background={alpha("#FF991F", 0.1)}
                label={
                  staff?.type === ROLES.gStaff ? "kid_access" : "group_access"
                }
                onClick={() => {
                  setModalStates((prev) => ({ ...prev, manageAccess: true }));
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <ToolButton
                image={<img src={History} />}
                background={alpha("#57CAF7", 0.1)}
                label={"history"}
                onClick={() => {
                  setModalStates((prev) => ({ ...prev, history: true }));
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <ToolButton
                image={<img src={Permission} />}
                background={alpha("#4FBF67", 0.1)}
                label={"manage_permissions"}
                onClick={() => {
                  setModalStates((prev) => ({
                    ...prev,
                    managePermsissions: true,
                  }));
                }}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <ToolButton
                image={<Delete style={{ color: "#D84141" }} fontSize="large" />}
                background={alpha("#FF1111", 0.1)}
                label={"delete_staff"}
                onClick={handleDeleteStaff}
              />
            </Grid>
            {staff.type === ROLES.gStaff && (
              <Grid item xs={12}>
                <ToolButton
                  fullWidth
                  image={<img src={Report} />}
                  background={alpha("#6304FE ", 0.1)}
                  label={"set_report"}
                  onClick={() => {
                    setModalStates((prev) => ({ ...prev, report: true }));
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item lg={6} xs={12}></Grid>
      </Grid>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    ...getTypographyStyles(theme),
    header: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      "& > *:not(:last-child)": {
        marginRight: 30,
      },
      [theme.breakpoints.only("xs")]: {
        flexDirection: "column",
        alignItems: "center",

        "& > *:not(:last-child)": {
          marginRight: 0,
          marginBottom: 20,
        },
      },
    },
    staffImage: {
      height: 120,
      width: 120,
      objectFit: "cover",
      borderRadius: 15,
    },
  };
});
