import React, { useState, useEffect, Fragment, useMemo } from "react";
import { makeStyles, alpha } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { Divider, Box } from "@material-ui/core";
import {
  Lock,
  History,
  People,
  Ticket,
  Person,
  Delete,
  ErrorIcon,
} from "../../components/Icons";

import trophy from "../../assets/icons/Vector.png";
import Score from "../../assets/icons/Icon.png";
import Star from "../../assets/icons/star.png";
import StarFull from "../../assets/icons/starIcon.png";

import Calendar from "../../assets/icons/calender.png";
import File from "../../assets/icons/file-text.png";
import Group from "../../assets/icons/Group.png";
import clsx from "clsx";

import { FormattedMessage } from "react-intl";

import "firebase/firestore";
import { PERMISSIONS } from "../../utils/constants";
import {
  FirebaseHelpers,
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import firebase from "firebase/app";
import { db } from "../../utils/firebase";
import { useHistory, useParams } from "react-router";
import { useStore, useUi } from "../../store";
import { SimpleModal, Links, Badge, ToolBox, Loader } from "../../components";
import ScrollArea from "react-scrollbar";
import { ChangePasswordBody } from "./modals/changePassword";
import { ChangeScoreBody } from "./modals/changeScore";
import { GrantScoreBody } from "./modals/grantScore";
import { GroupTranferBody } from "./modals/groupTransfer";
import { AssignDaysBody } from "./modals/assignDays";
import { VoucherBody } from "./modals/voucher";
import { Award } from "../../components/award";
import { GroupReportBody as KidReportBody } from "../../components/specialReportModal/specialReportModal";

export const KidsDetail = (props) => {
  const params = useParams();

  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, defaultAvatars, institute } = storeState;

  const [kid, setKid] = useState();
  const [prizes, setPrizes] = useState([]);
  const [nextPrize, setNextPrize] = useState();
  const [eligiblePrize, setEligiblePrize] = useState();
  const [subjects, setSubjects] = useState([]);

  const [modalStates, setModalStates] = useState({
    grantScore: false,
    changeScore: false,
    changePassword: false,
    voucher: false,
    groupTransfer: false,
    assignDays: false,
    kidReport: false,
  });

  const closeGrantScoreModal = () => {
    setModalStates((prev) => ({ ...prev, grantScore: false }));
  };
  const closeKidReport = () => {
    setModalStates((prev) => ({ ...prev, kidReport: false }));
  };
  const closeChangeScoreModal = () => {
    setModalStates((prev) => ({ ...prev, changeScore: false }));
  };
  const closeChangePasswordModal = () => {
    setModalStates((prev) => ({ ...prev, changePassword: false }));
  };
  const closeVoucherModal = () => {
    setModalStates((prev) => ({ ...prev, voucher: false }));
  };
  const closeGroupTransferModal = () => {
    setModalStates((prev) => ({ ...prev, groupTransfer: false }));
  };
  const closeAssignDaysModal = () => {
    setModalStates((prev) => ({ ...prev, assignDays: false }));
  };

  useEffect(() => {
    (async () => {
      db.collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(params.id)
        .onSnapshot(async (querySnapshot) => {
          setKid(querySnapshot.data());
        });
    })();
  }, []);
  useEffect(() => {
    if (!kid) return;

    (async () => {
      if (kid.has_special_program) {
        const report_templates = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .collection("subjects")
            .get()
        ).docs.map((el) => el.data());
        setSubjects(report_templates);
      } else {
        const report_templates = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(kid.groupId)
            .collection("report_templates")
            .get()
        ).docs.map((el) => el.data());
        setSubjects(report_templates);
      }
    })();
  }, [modalStates.kidReport, kid]);
  useEffect(() => {
    if (!kid?.id) return;
    (async () => {
      const _prizes = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("routePlan")
          .doc(kid.route_id)
          .collection("prizes")
          .orderBy("requiredLevel")
          .get()
      ).docs.map((el) => el.data());

      let _eligible = null;

      _prizes.forEach((prize) => {
        if (kid.level >= prize.requiredLevel) _eligible = prize;
      });

      setPrizes(_prizes);
      setEligiblePrize(_eligible);

      setNextPrize(_prizes.find((el) => el.requiredLevel > kid.level));
    })();
  }, [kid?.id]);

  const history = useHistory();
  const classes = useStyles();

  const handleInsights = () => {
    history.push(`/kids/${kid.id}/insights`);
  };
  const handleChangePassword = () => {
    setModalStates((prev) => ({ ...prev, changePassword: true }));
  };
  const handleAchievement = () => {};
  const handleGrantScore = () => {
    setModalStates((prev) => ({ ...prev, grantScore: true }));
  };
  const handleHistory = () => {
    history.push(`/kids/${kid.id}/history`);
  };
  const handleGroupTransfer = () => {
    setModalStates((prev) => ({ ...prev, groupTransfer: true }));
  };
  const handleVochers = () => {
    setModalStates((prev) => ({ ...prev, voucher: true }));
  };
  const handleChangeScore = () => {
    setModalStates((prev) => ({ ...prev, changeScore: true }));
  };
  const handleProfilePic = async () => {
    if (!user.permissions[PERMISSIONS.picAccess])
      return actions.alert("You don't have access to perform this action");

    actions.showDialog({
      action: FirebaseHelpers.enableKidProfilePicture.execute.bind(null, {
        user,
        kid,
      }),
      title: `Change Profile Permission?`,
      body: `Are you sure you want to this ${
        kid.profile_permission ? "disable" : "enable"
      } this permission`,
    });
  };
  const handleSwitchSpecial = () => {
    if (!kid.has_special_program)
      return actions.alert("Kid is not in Special Program");
    history.push(`/specialProgram/${kid.id}`);
  };
  const handleAssginDays = () => {
    setModalStates((prev) => ({ ...prev, assignDays: true }));
  };
  const hanldeDeleteKid = () => {
    if (!user.permissions[PERMISSIONS.deleteKid])
      return actions.alert("You don't have access to perform this action");

    actions.showDialog({
      action: FirebaseHelpers.deleteKid.execute.bind(null, {
        kid,
        user,
        history,
      }),
      title: `Delete ${kid.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };
  const handleSpecialReportSave = async (
    subjectDeleted,
    subSubjectDeleted,
    subjectAdded,
    subSubjectAdded,
    subjectEdit,
    subSubjectEdit
  ) => {
    if (kid.has_special_program == false) {
      db.collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .update({
          has_special_program: true,
        });

      let report_templates;
      let docs = await Promise.all(
        (report_templates = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(kid.groupId)
            .collection("report_templates")
            .get()
        ).docs.map((el) => el.data()))
      )
        .then(
          report_templates.forEach((el) => {
            db.collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid.id)
              .collection("subjects")
              .doc(el.id)
              .set(el);
          })
        )
        .then(
          report_templates.forEach((el) => {
            db.collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid.id)
              .collection("achievements")
              .doc(el.id)
              .set({
                redPoints: 0,
                streak: 0,
                subjectName: el.name,
                isDeleted: true,
                subject_id: el.id,
              });
          })
        );
    }
    let _save1 = await Promise.all(
      subjectAdded.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          subSubject: [],
          obtainedPoints: 0,
          hasSubSubject: false,
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            has_special_program: true,
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.id)
          .set(payload);

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("achievements")
          .doc(sub.id)
          .set({
            redPoints: 0,
            streak: 0,
            subjectName: sub.name,
            isDeleted: false,
            subject_id: sub.id,
          });
      })
    );
    let _save2 = await Promise.all(
      subSubjectAdded.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            has_special_program: true,
          });
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: 0,
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.subjectId)
          .update({
            subSubject: firebase.firestore.FieldValue.arrayUnion(payload),
            hasSubSubject: true,
            totalPoints: sub.subjectPoints,
          });
      })
    );
    let _save3 = await Promise.all(
      subjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            has_special_program: true,
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.id)
          .delete();

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("achievements")
          .doc(sub.id)
          .update({
            isDeleted: true,
            redPoints: 0,
            streak: 0,
          });
      })
    );
    let _save4 = await Promise.all(
      subSubjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            has_special_program: true,
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.subjectId)
          .update({
            subSubject: firebase.firestore.FieldValue.arrayRemove(
              sub.subSubject
            ),
            totalPoints: sub.subjectPoints,
          });
        if (!sub.subSubjectLength) {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .collection("subjects")
            .doc(sub.subjectId)
            .update({
              hasSubSubject: false,
            });
        }
      })
    );
    let _save5 = await Promise.all(
      subjectEdit.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            isSpecialReport: true,
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.id)
          .delete();
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          subSubject: sub.subSubject,
          obtainedPoints: sub.obtainedPoints,
          hasSubSubject: sub.hasSubSubject,
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.id)
          .set(payload);
      })
    );
    let _save6 = await Promise.all(
      subSubjectEdit.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: sub.obtainedPoints,
        };
        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.subjectId)
          .get();
        let _report_templates = reportTemplates.data();
        _report_templates.subSubject.map((e, idx) => {
          if (e.id == sub.id) {
            _report_templates.subSubject[idx] = payload;
          }
        });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .update({
            isSpecialReport: true,
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.subjectId)
          .delete();
        const _payload = {
          id: _report_templates.id,
          name: _report_templates.name,
          totalPoints: _report_templates.totalPoints,
          subSubject: _report_templates.subSubject,
          obtainedPoints: _report_templates.obtainedPoints,
          hasSubSubject: _report_templates.hasSubSubject,
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.subjectId)
          .set(_payload);
      })
    );
    closeKidReport();
  };

  const handleReportDefault = async () => {
    let subjects = await db
      .collection("Institution")
      .doc(user._code)
      .collection("kid")
      .doc(kid.id)
      .collection("subjects")
      .get();
    await db
      .collection("Institution")
      .doc(user._code)
      .collection("kid")
      .doc(kid.id)
      .update({
        has_special_program: false,
      });
    await Promise.all(
      subjects.docs.map(async (sub) =>
        db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("subjects")
          .doc(sub.id)
          .delete()
      )
    );
    closeKidReport();
  };

  const actionBarlinks = [
    {
      ref: "/kids",
      title: <FormattedMessage id="kids" />,
    },
    {
      ref: `/kids/${params.id}`,
      title: <FormattedMessage id="profile" />,
    },
  ];
  const toolslinks = [
    {
      ref: "#",
      title: <FormattedMessage id="tools" />,
    },
  ];
  const awardslinks = [
    {
      ref: "#",
      title: <FormattedMessage id="track_awards" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={actionBarlinks} />
      </div>
    </div>
  );
  const toolBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={toolslinks} />
      </div>
    </div>
  );
  const awardBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={awardslinks} />
      </div>
    </div>
  );

  if (!kid)
    return (
      <section
        className={clsx([classes.default_page_root, classes.default_page_Bg1])}
      >
        <Loader />
      </section>
    );

  const progress =
    (Number(kid.xp - kid.xpForPreviousLevel) /
      Number(kid.xpForNextLevel - kid.xpForPreviousLevel)) *
    100;

  const nextAwardXp = nextPrize?.requiredLevel
    ? Number(nextPrize?.requiredLevel * institute?.points_for_next_level) -
      Number(kid.xp)
    : null;

  return (
    <Fragment>
      {/* ------------------------------------- */}
      <SimpleModal
        disableBackdropClick
        title={<FormattedMessage id="kid_report" />}
        open={modalStates.kidReport}
        handleClose={closeKidReport}
      >
        <KidReportBody
          handleSave={handleSpecialReportSave}
          restoreDefault={handleReportDefault}
          open={modalStates.kidReport}
          _subjects={subjects}
          type="kid"
          kid={kid}
          handleClose={closeKidReport}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="change_password" />}
        open={modalStates.changePassword}
        handleClose={closeChangePasswordModal}
      >
        <ChangePasswordBody kid={kid} handleClose={closeChangePasswordModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="change_score" />}
        open={modalStates.changeScore}
        handleClose={closeChangeScoreModal}
      >
        <ChangeScoreBody kid={kid} handleClose={closeChangeScoreModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="grant_score" />}
        open={modalStates.grantScore}
        handleClose={closeGrantScoreModal}
      >
        <GrantScoreBody kid={kid} handleClose={closeGrantScoreModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="group_transfer" />}
        open={modalStates.groupTransfer}
        handleClose={closeGroupTransferModal}
      >
        <GroupTranferBody kid={kid} handleClose={closeGroupTransferModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="assign_days" />}
        open={modalStates.assignDays}
        handleClose={closeAssignDaysModal}
      >
        <AssignDaysBody kid={kid} handleClose={closeAssignDaysModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="vouchers" />}
        open={modalStates.voucher}
        handleClose={closeVoucherModal}
      >
        <VoucherBody kidId={kid.id} handleClose={closeVoucherModal} />
      </SimpleModal>

      {/* ------------------------------------- */}

      <section
        className={clsx([classes.default_page_root, classes.default_page_Bg1])}
      >
        {actionBar}
        <Box marginBottom={2}>
          <Divider />
        </Box>

        <div className={classes.header}>
          <img
            src={kid?.image || defaultAvatars?.kid}
            className={classes.kidImage}
            alt=''
          />
          <Box textAlign={"center"} display="flex" alignItems={"center"}>
            <Box>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_heading,
                ])}
              >
                {kid?.name}
              </Typography>
              <Typography
                className={clsx([
                  classes.default_typography_bold,
                  classes.default_typography_paragraph,
                ])}
              >
                {kid?.username}
              </Typography>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_paragraph,
                ])}
              >
                {kid?.groupName}
              </Typography>
            </Box>

            <Box marginX={2}>
              <Badge value={kid.level} />
            </Box>
          </Box>

          <Box textAlign={"center"}>
            <Typography
              className={clsx([
                classes.default_typography_uppercase,
                classes.default_typography_bold,
                classes.default_typography_label,
                classes.default_typography_colorLight,
              ])}
            >
              <FormattedMessage id="points" />
            </Typography>
            <Box marginY={1}>
              <Typography
                className={clsx([
                  classes.default_typography_capsule,
                  classes.default_typography_subHeading,
                ])}
              >
                {kid?.score}
              </Typography>
            </Box>
          </Box>

          <div className={classes.progressBar}>
            <CircularProgressbarWithChildren
              value={progress}
              styles={buildStyles({
                rotation: 0.25,
                strokeLinecap: "round",
                textSize: "20px",
                pathTransitionDuration: 0.5,
                pathColor: "#4FBF67",
                textColor: "#f88",
                trailColor: "#d6d6d6",
                backgroundColor: "#3e98c7",
              })}
            >
              <Typography className={classes.progressBarText}>
                {kid.xp}
              </Typography>
            </CircularProgressbarWithChildren>
          </div>

          <div>
            <Box display={"flex"} alignItems="center" marginY={2}>
              <Box marginX={1}>
                <div className={classes.greyDot}></div>
              </Box>

              <Typography>
                <FormattedMessage id="point_goal" /> :{" "}
                <strong>{kid.xpForNextLevel}</strong>
              </Typography>
            </Box>

            <Box display={"flex"} alignItems="center" marginY={2}>
              <Box marginX={1}>
                <div className={classes.greenDot}></div>
              </Box>
              <Typography>
                <FormattedMessage id="current_point" />:{" "}
                <strong>{kid.xp}</strong>
              </Typography>
            </Box>
          </div>
        </div>

        <Box marginY={2}>
          <Divider />
        </Box>

        <Grid
          className={classes.default_page_scrollContainer}
          container
          spacing={2}
        >
          <Grid
            item
            md={8}
            xs={12}
            className={classes.default_page_scrollContainer}
          >
            <section
              className={clsx([
                classes.default_page_root,
                classes.default_page_BgWhite,
              ])}
            >
              <ScrollArea smoothScrolling>
                {toolBar}
                <Box marginBottom={2}>
                  <Divider />
                </Box>
                <Grid container spacing={2}>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={<img src={File} />}
                      background={alpha("#FF991F", 0.1)}
                      label={"insights"}
                      onClick={handleInsights}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <Lock style={{ color: "#3791DC" }} fontSize="large" />
                      }
                      background={alpha("#0052CC", 0.1)}
                      label={"change_password"}
                      onClick={handleChangePassword}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={<img src={trophy} />}
                      background={alpha("#B5008A", 0.1)}
                      label={"achievement"}
                      onClick={handleAchievement}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={<img src={Group} />}
                      background={alpha("#A600D4", 0.1)}
                      label={"grant_score"}
                      onClick={handleGrantScore}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <History
                          fontSize="large"
                          style={{ color: "#6A6A6A" }}
                        />
                      }
                      background={alpha("#E1E1E1", 0.3)}
                      label={"history"}
                      onClick={handleHistory}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <People style={{ color: "#FE4789" }} fontSize="large" />
                      }
                      background={alpha("#FE4789", 0.2)}
                      label={"group_transfer"}
                      onClick={handleGroupTransfer}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <Ticket
                          style={{ color: "#5C82E3", fontSize: 50 }}
                          fontSize="large"
                        />
                      }
                      background={alpha("#5C82E3", 0.12)}
                      label={"vouchers"}
                      onClick={handleVochers}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={<img src={Score} />}
                      background={alpha("#00D8F6", 0.2)}
                      label={"change_score"}
                      onClick={handleChangeScore}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <Person style={{ color: "#4FBF67" }} fontSize="large" />
                      }
                      background={alpha("#4FBF67", 0.2)}
                      label={
                        kid.profile_permission
                          ? "disable_profile_pic"
                          : "enable_profile_pic"
                      }
                      onClick={handleProfilePic}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        kid.has_special_program ? (
                          <img
                            src={StarFull}
                            style={{ height: 45, width: 45 }}
                          />
                        ) : (
                          <img src={Star} />
                        )
                      }
                      background={alpha("#FF991F", 0.2)}
                      label={"special_program"}
                      onClick={() => {
                        setModalStates((prev) => ({
                          ...prev,
                          kidReport: true,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={<img src={Calendar} />}
                      background={alpha("#3BFFFF", 0.2)}
                      label={"assign_days"}
                      onClick={handleAssginDays}
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <ToolBox
                      image={
                        <Delete style={{ color: "#D84141", fontSize: 50 }} />
                      }
                      background={alpha("#57CAF7", 0.1)}
                      label={"delete_kid"}
                      onClick={hanldeDeleteKid}
                    />
                  </Grid>
                </Grid>
              </ScrollArea>
            </section>
          </Grid>
          <Grid
            item
            md={4}
            xs={12}
            className={classes.default_page_scrollContainer}
          >
            <section
              className={clsx([classes.default_page_root])}
              style={{
                justifyContent: "space-between",
              }}
            >
              <ScrollArea smoothScrolling>
                {awardBar}
                {prizes.map((el, idx) => (
                  <Award
                    index={idx + 1}
                    level={el.requiredLevel}
                    label={el.name}
                    selected={el.requiredLevel == eligiblePrize?.requiredLevel}
                  />
                ))}
              </ScrollArea>

              {nextAwardXp && (
                <Box
                  marginTop={2}
                  px={3}
                  py={3}
                  className={classes.tackAwardInfo}
                >
                  <ErrorIcon style={{ color: "#808191", marginRight: 10 }} />
                  <Typography
                    className={clsx([
                      classes.default_typography_paragraph,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    Another <strong>{nextAwardXp}</strong> points untill the
                    next prize
                  </Typography>
                </Box>
              )}
            </section>
          </Grid>
        </Grid>
      </section>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  ...getSectionHeaderStyles(theme),
  ...getPageStyles(theme),
  ...getTypographyStyles(theme),
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: 30,
      marginLeft: 30,
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",

      "& > *:not(:last-child)": {
        marginRight: 0,
        marginLeft: 0,
        marginBottom: 20,
      },
    },
  },
  kidScore: {
    padding: "8px 25px",
    borderRadius: 50,
    background: "#DEEBFF",
    color: "#57CAF7",
    fontWeight: "bold",
  },
  kidImage: {
    height: 120,
    width: 120,
    objectFit: "cover",
    borderRadius: 15,
  },

  progressBar: {
    position: "relative",
    width: 100,
    height: 100,
  },
  progressBarText: {
    position: "absolute",
    left: "50%",
    top: "45%",
    transform: "translate(-50%, -50%)",
    fontWeight: "bold",
  },
  greyDot: {
    backgroundColor: "#d6d6d6",
    height: 20,
    width: 20,
    borderRadius: "50%",
  },
  greenDot: {
    backgroundColor: "#4FBF67",
    height: 20,
    width: 20,
    borderRadius: "50%",
  },
  tackAwardInfo: {
    background: alpha("#C4C4C4", 0.1),
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));
