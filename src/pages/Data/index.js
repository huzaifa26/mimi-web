import React, { Fragment, useEffect, useState } from "react";
import {
  TableCell,
  Typography,
  makeStyles,
  Grid,
  Divider,
  alpha,
  Box,
} from "@material-ui/core";

import { FormattedMessage, useIntl } from "react-intl";
import { Button, SimpleModal, Links, DataTable } from "../../components";
import { useStore } from "../../store";

import {
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import GroupIcon from "../../assets/icons/purpleIcon.png";
import Clock from "../../assets/icons/timeCircle.png";
import Score from "../../assets/icons/dataTool.png";
import Voucher from "../../assets/icons/dataVoucher.png";
import ExcelUpload from "../../assets/icons/dataLoad.png";
import Points from "../../assets/icons/points.png";
import ScrollArea from "react-scrollbar";
import clsx from "clsx";
import firebase from "firebase/app";
import { db } from "../../utils/firebase";
import moment from "moment";
import { GrantScoreBody } from "./modals/grantScore";
import { UpdateScoreBody } from "./modals/updateScore";
import { ProfilePermissionBody } from "./modals/profilePermission";
import { EarnedPointsBody } from "./modals/earnedPoints";
import { GrantVoucherBody } from "./modals/grantVoucher";
import { FileUploadBody } from "./modals/fileUpload";
import { GroupReportBody as BasicReportBody } from "../../components/specialReportModal/specialReportModal";

const headers = [
  {
    id: `name`,
  },
  {
    id: `percentage`,
  },
  {
    id: `voucher_code`,
  },
];

export const Data = React.memo(() => {
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user, institute } = storeState;

  const intl = useIntl();

  const [stats, setStats] = useState({
    kids: 0,
    groups: 0,
    staff: 0,
    subDaysLeft: 0,
  });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    (async () => {
      const _groups = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .get()
      ).docs.length;
      const _kids = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .get()
      ).docs.length;
      const _staff = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .get()
      ).docs.length;

      setStats((prev) => ({
        ...prev,
        kids: _kids,
        groups: _groups,
        staff: _staff,
      }));
    })();
  }, []);

  console.log(subjects);

  useEffect(() => {
    if (!institute) return;
    const subDate = moment(new Date(institute.subscription_end_date));
    setStats((prev) => ({
      ...prev,
      subDaysLeft: subDate.diff(moment(), "days"),
    }));
  }, [institute]);

  const [modalStates, setModalStates] = useState({
    updateScore: false,
    grantScore: false,
    grantVoucher: false,
    profilePermission: false,
    earnedPoints: false,
    basicReport: false,
    fileUpload: false,
  });
  useEffect(() => {
    (async () => {
      const report_templates = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .get()
      ).docs.map((el) => el.data());
      // console.log(report_templates);
      setSubjects(report_templates);
    })();
  }, [modalStates.basicReport]);
  const closeGrantScoreModal = () => {
    setModalStates((prev) => ({ ...prev, grantScore: false }));
  };
  const closeFileUploadModal = () => {
    setModalStates((prev) => ({ ...prev, fileUpload: false }));
  };
  const closeUpdateScoreModal = () => {
    setModalStates((prev) => ({ ...prev, updateScore: false }));
  };
  const closeGrantVoucherModal = () => {
    setModalStates((prev) => ({ ...prev, grantVoucher: false }));
  };
  const closeProfilePermissionModal = () => {
    setModalStates((prev) => ({ ...prev, profilePermission: false }));
  };
  const closeEarnedPointsModal = () => {
    setModalStates((prev) => ({ ...prev, earnedPoints: false }));
  };
  const closeBasicReportModal = () => {
    setModalStates((prev) => ({ ...prev, basicReport: false }));
  };
  const handleSpecialReportSave = async (
    subjectDeleted,
    subSubjectDeleted,
    subjectAdded,
    subSubjectAdded,
    subjectEdit,
    subSubjectEdit
  ) => {

    // delete subject
    let _save3 = await Promise.all(
      subjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.id)
          .delete();

        let groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());

        groups.map(async (group) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
            .doc(sub.id)
            .delete();

          let kids = (
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .where("groupId", "==", group.id)
              .get()
          ).docs.map((el) => el.data());

          kids.map(async (el) => {
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(el.id)
              .collection("achievements")
              .doc(sub.id)
              .update({
                isDeleted: true,
                redPoints: 0,
                streak: 0,
              });
          });
        });
      })
    );

    // delete sub subject
    let _save4 = await Promise.all(
      subSubjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.subjectId)
          .update({
            subSubject: firebase.firestore.FieldValue.arrayRemove(
              sub.subSubject
            ),
            totalPoints: sub.subjectPoints,
          });
        let groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());

        groups.map(async (group) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
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
              .collection("groups")
              .doc(group.id)
              .collection("report_templates")
              .doc(sub.subjectId)
              .update({
                hasSubSubject: false,
              });
          }
        });

        if (!sub.subSubjectLength) {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("basicReport")
            .doc(sub.subjectId)
            .update({
              hasSubSubject: false,
            });
        }
      })
    );

    // add subject
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
          .collection("basicReport")
          .doc(sub.id)
          .set(payload);

        const groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());

        await Promise.all(
          groups.map(async (group) => {
            const batch = db.batch();

            const ref = db
              .collection("Institution")
              .doc(user._code)
              .collection("groups")
              .doc(group.id)
              .collection("report_templates")
              .doc(sub.id);
            batch.set(ref, payload);

            const kids = (
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .where("groupId", "==", group.id)
                .get()
            ).docs.map((el) => el.data());
            const reportTemplates = (
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("groups")
                .doc(group.id)
                .collection("report_templates")
                .get()
            ).docs.map((el) => el.data());

            kids.forEach((kid) => {
              reportTemplates.forEach((report) => {
                batch.set(
                  db
                    .collection("Institution")
                    .doc(user._code)
                    .collection("kid")
                    .doc(kid.id)
                    .collection("achievements")
                    .doc(report.id),
                  {
                    redPoints: 0,
                    streak: 0,
                    subjectName: report.name,
                    isDeleted: true,
                    subject_id: report.id,
                  }
                );
              });
            });

            await batch.commit();
          })
        );
      })
    );

    // add sub subject
    let _save2 = await Promise.all(
      subSubjectAdded.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: 0,
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.subjectId)
          .update({
            subSubject: firebase.firestore.FieldValue.arrayUnion(payload),
            hasSubSubject: true,
            totalPoints: sub.subjectPoints,
          });

        const groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());

        await Promise.all(
          groups.map(async (group) => {
            const batch = db.batch();

            const report = {
              id: sub.id,
              name: sub.name,
              totalPoints: sub.totalPoints,
              obtainedPoints: 0,
            };

            batch.update(
              db
                .collection("Institution")
                .doc(user._code)
                .collection("groups")
                .doc(group.id)
                .collection("report_templates")
                .doc(sub.subjectId),
              {
                subSubject: firebase.firestore.FieldValue.arrayUnion(report),
                hasSubSubject: true,
                totalPoints: sub.subjectPoints,
              }
            );

            await batch.commit();
          })
        );
      })
    );

    // edit subject
    let _save5 = await Promise.all(
      subjectEdit.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.id)
          .delete();
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          // subject: sub.subject,
          subSubject: sub.subSubject,
          obtainedPoints: sub.obtainedPoints,
          hasSubSubject: sub.hasSubSubject,
        };
        // console.log(payload);
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.id)
          .set(payload);

        let groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());
        groups.map(async (group) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
            .doc(sub.id)
            .delete();
          const payload = {
            id: sub.id,
            name: sub.name,
            totalPoints: sub.totalPoints,
            // subSubject: sub.subject,
            subSubject: sub.subSubject,
            obtainedPoints: sub.obtainedPoints,
            hasSubSubject: sub.hasSubSubject,
          };
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
            .doc(sub.id)
            .set(payload);
        });
      })
    );

    // edit sub subject
    let _save6 = await Promise.all(
      subSubjectEdit.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: sub.obtainedPoints,
        };

        let groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("isSpecialReport", "==", false)
            .get()
        ).docs.map((el) => el.data());

        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.subjectId)
          .get();

          console.log(reportTemplates);

        let _report_templates = reportTemplates.data();

        // console.log(_report_templates);

        _report_templates.subSubject.map((e, idx) => {
          if (e.id === sub.id) {
            _report_templates.subSubject[idx] = payload;
          }
        });
        groups.map(async (group) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
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
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
            .doc(sub.subjectId)
            .set(_payload);
        });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
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

        let totalSum=0;
        _payload.subSubject.forEach((subSubject)=>{
          totalSum=totalSum+subSubject.totalPoints;
        });

        _payload.totalPoints=totalSum;
        
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .doc(sub.subjectId)
          .set(_payload);
      })
    );

    closeBasicReportModal();
  };

  const links = [
    {
      ref: "/data",
      title: <FormattedMessage id="data" />,
    },
  ];

  const informationlinks = [
    {
      ref: "#",
      title: <FormattedMessage id="information" />,
    },
  ];
  const toollinks = [
    {
      ref: "#",
      title: <FormattedMessage id="tools" />,
    },
  ];
  const invitationlinks = [
    {
      ref: "#",
      title: <FormattedMessage id="invitation_vouchers" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
      <div className={classes.default_headerSection_actionsContainer}>
        <Button
          className={classes.buttonReport}
          startIcon={<img width={30} src={GroupIcon} alt=''/>}
          onClick={() => {
            setModalStates((prev) => ({ ...prev, basicReport: true }));
          }}
        >
          <FormattedMessage id="set_basic_report" />
        </Button>

        <Button
          className={classes.buttonSubscription}
          disableRipple
          startIcon={<img src={Clock} />}
        >
          <FormattedMessage id="subscription_ends_in" />
          <Box marginX={1} color="#685BE7">
            {`${stats.subDaysLeft} ${intl.formatMessage({ id: "days" })}`}
          </Box>
        </Button>
      </div>
    </div>
  );
  const informationBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={informationlinks} />
      </div>
    </div>
  );
  const toolBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={toollinks} />
      </div>
    </div>
  );
  const invitationBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={invitationlinks} />
      </div>
    </div>
  );

  const renderInvitations = (invite) => {
    return (
      <Fragment>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
      </Fragment>
    );
  };

  return (
    <section className={clsx([classes.default_page_root, classes.pageBg])}>
      <SimpleModal
        title={<FormattedMessage id="grant_score" />}
        open={modalStates.grantScore}
        handleClose={closeGrantScoreModal}
      >
        <GrantScoreBody handleClose={closeGrantScoreModal} />
      </SimpleModal>
      <SimpleModal
        disableBackdropClick
        title={<FormattedMessage id="set_basic_report" />}
        open={modalStates.basicReport}
        handleClose={closeBasicReportModal}
      >
        <BasicReportBody
          handleSave={handleSpecialReportSave}
          open={modalStates.groupReport}
          _subjects={subjects}
          type="basicReport"
          handleClose={closeBasicReportModal}
        />
      </SimpleModal>
      <SimpleModal
        disableBackdropClick
        title={<FormattedMessage id="excel_upload" />}
        open={modalStates.fileUpload}
        handleClose={closeFileUploadModal}
      >
        <FileUploadBody
          open={modalStates.groupReport}
          handleClose={closeFileUploadModal}
        />
      </SimpleModal>

      {/* <SimpleModal
        title={<FormattedMessage id="set_basic_report" />}
        open={modalStates.basicReport}
        handleClose={closeBasicReportModal}
      >
        <BasicReportBody handleClose={closeBasicReportModal} />
      </SimpleModal> */}

      <SimpleModal
        title={<FormattedMessage id="update_score" />}
        open={modalStates.updateScore}
        handleClose={closeUpdateScoreModal}
      >
        <UpdateScoreBody handleClose={closeUpdateScoreModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="profile_permissions" />}
        open={modalStates.profilePermission}
        handleClose={closeProfilePermissionModal}
      >
        <ProfilePermissionBody handleClose={closeProfilePermissionModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="boarding_school_EXP" />}
        open={modalStates.earnedPoints}
        handleClose={closeEarnedPointsModal}
      >
        <EarnedPointsBody handleClose={closeEarnedPointsModal} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="grant_voucher" />}
        open={modalStates.grantVoucher}
        handleClose={closeGrantVoucherModal}
      >
        <GrantVoucherBody handleClose={closeGrantVoucherModal} />
      </SimpleModal>

      {actionBar}

      <Grid
        container
        spacing={4}
        style={{
          flex: 1,
        }}
      >
        <Grid item xs={12} lg={6} style={{ flex: 1, height: "100%" }}>
          <section
            className={clsx([
              classes.default_page_root,
              classes.bg1,
              classes.heightTopBar,
            ])}
          >
            {informationBar}

            <section
              className={clsx([
                classes.default_page_root,
                classes.default_page_BgWhite,
                classes.heightTopBar,
              ])}
            >
              <Typography
                className={clsx([
                  classes.default_typography_label,
                  classes.default_typography_colorLight,
                ])}
              >
                <FormattedMessage id="name_and_code" />
              </Typography>

              <div>
                <Typography
                  className={clsx([
                    classes.default_typography_heading,
                    classes.default_typography_bold,
                    classes.default_typography_capitalize,
                  ])}
                >
                  {institute?.name}
                  <Box
                    marginX={1}
                    className={clsx([
                      classes.default_typography_subHeading,
                      classes.default_typography_colorLight,
                    ])}
                    component={"span"}
                  >
                    #{institute?.reference_code}
                  </Box>
                </Typography>
              </div>

              <Box marginY={2}>
                <Divider />
              </Box>

              <Box display={"flex"} flexWrap="wrap">
                <Box marginX={2}>
                  <Typography
                    className={clsx([
                      classes.default_typography_label,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    <FormattedMessage id="no_of_kids" />
                  </Typography>
                  <Typography
                    className={clsx([
                      classes.default_typography_heading,
                      classes.default_typography_bold,
                    ])}
                  >
                    {stats.kids}
                  </Typography>
                </Box>
                <Box marginX={2}>
                  <Typography
                    className={clsx([
                      classes.default_typography_label,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    <FormattedMessage id="no_of_groups" />
                  </Typography>
                  <Typography
                    className={clsx([
                      classes.default_typography_heading,
                      classes.default_typography_bold,
                    ])}
                  >
                    {stats.groups}
                  </Typography>
                </Box>
                <Box marginX={2}>
                  <Typography
                    className={clsx([
                      classes.default_typography_label,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    <FormattedMessage id="no_of_staff" />
                  </Typography>
                  <Typography
                    className={clsx([
                      classes.default_typography_heading,
                      classes.default_typography_bold,
                    ])}
                  >
                    {stats.staff}
                  </Typography>
                </Box>
              </Box>
            </section>
          </section>
          <div
            className={clsx([
              classes.default_page_root,
              classes.bg2,
              classes.heightInvitation,
            ])}
          >
            {invitationBar}
            <DataTable
              {...{
                data: [],
                renderItem: renderInvitations,
                headers,
                loadMore: null,
              }}
            />
          </div>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ScrollArea
            style={{ flex: 1, height: "100%" }}
            smoothScrolling
            speed={0.8}
          >
            <section className={clsx([classes.default_page_root, classes.bg1])}>
              {toolBar}

              <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={12} sm={12} md={4}>
                  <div
                    className={classes.toolContainer}
                    onClick={() => {
                      setModalStates((prev) => ({
                        ...prev,
                        updateScore: true,
                      }));
                    }}
                  >
                    <img src={Score} alt=''/>
                    <Typography className={classes.toolTitle}>
                      <FormattedMessage id="update_score" />
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <div
                    className={classes.toolContainer}
                    onClick={() => {
                      setModalStates((prev) => ({
                        ...prev,
                        grantVoucher: true,
                      }));
                    }}
                  >
                    <img src={Voucher} />
                    <Typography className={classes.toolTitle}>
                      <FormattedMessage id="grant_voucher" />
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <div
                    className={classes.toolContainer}
                    onClick={() => {
                      setModalStates((prev) => ({ ...prev, grantScore: true }));
                    }}
                  >
                    <img src={Score} alt=''/>
                    <Typography className={classes.toolTitle}>
                      <FormattedMessage id="grant_score" />
                    </Typography>
                  </div>
                </Grid>

                <Grid item xs={12} sm={12} md={4}>
                  <div
                    className={classes.toolContainer}
                    onClick={() => {
                      setModalStates((prev) => ({
                        ...prev,
                        fileUpload: true,
                      }));
                    }}
                  >
                    <img src={ExcelUpload} />
                    <Typography className={classes.toolTitle}>
                      <FormattedMessage id="load_users_from_excel" />
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <div
                    className={classes.toolContainer}
                    onClick={() => {
                      setModalStates((prev) => ({
                        ...prev,
                        earnedPoints: true,
                      }));
                    }}
                  >
                    <img src={Points} />
                    <Typography className={classes.toolTitle}>
                      <FormattedMessage id="change_total_points_earned" />
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </section>
          </ScrollArea>
        </Grid>
      </Grid>
    </section>
  );
});

const useStyles = makeStyles((theme) => {
  return {
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    ...getTypographyStyles(theme),

    buttonReport: {
      color: "#000 !important",
      background: `${alpha(`#A600D4`, 0.1)} !important`,
      paddingLeft: "20px !important",
      paddingRight: "20px !important",
    },
    buttonSubscription: {
      color: "#000 !important",
      background: `${alpha(`#8F92A10D`, 0.05)} !important`,
      cursor: "default !important",
    },

    pageBg: {
      background: alpha(`#808191`, 0.05),
    },
    heightInvitation: {
      height: "50%",
      minHeight: "auto",
    },
    heightTopBar: {
      height: "45%",
      minHeight: "45%",
      [theme.breakpoints.down("sm")]: {
        height: "20%",
        minHeight: "20%",
      },
    },
    bg1: {
      background: alpha(`#685BE7`, 0.05),
      marginBottom: 30,
    },
    bg2: {
      background: alpha(`#57CAF7`, 0.05),
    },

    toolContainer: {
      cursor: "pointer",
      width: "100%",
      height: "100%",
      minHeight: 150,
      background: "#fff",
      borderRadius: 18,
      padding: 20,
      "& img": {
        display: "block",
        margin: "0 auto",
        height: 100,
      },
      "&:hover": {
        opacity: 0.7,
      },
      "& > .MuiTypography-root": {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 20,
        fontSize: 20,
        textTransform: "capitalize",
      },
    },
  };
});
