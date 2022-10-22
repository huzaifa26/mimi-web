import {
  Typography,
  makeStyles,
  Grid,
  Divider,
  Input,
  Box,
  alpha,
} from "@material-ui/core";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { db } from "../../utils/firebase";
import { useStore, useUi } from "../../store";
import {
  Button,
  Delete,
  SimpleModal,
  Links,
  Loader,
  Badge,
  ToolButton,
  Ticket,
} from "../../components";
import { useHistory, useLocation, useParams } from "react-router-dom";
import clsx from "clsx";
import { FormattedMessage } from "react-intl";
import ScrollArea from "react-scrollbar";
import History from "../../assets/icons/history.png";
import File from "../../assets/icons/file-text.png";
import Theme from "../../assets/icons/theme.png";
import GuideOne from "../../assets/icons/guideOne.png";
import GuideTwo from "../../assets/icons/guideTwo.png";
import GroupIcon from "../../assets/icons/Group.png";
import Group from "../../assets/icons/groupicon.png";
import Update from "../../assets/icons/Edit_circle.png";
import Star from "../../assets/icons/star.png";
import { UpdateScoreBody } from "./modals/updateScore";
import { GrantScoreBody } from "./modals/grantScore";
import { GroupReportBody } from "../../components/specialReportModal/specialReportModal";
import { UplaoadImageBody } from "./modals/uploadImage";
import { GrantCouponBody } from "./modals/grantCoupon";
import { DisplayKidsBody } from "./modals/kids";
import firebase from "firebase/app";
import StarFull from "../../assets/icons/starIcon.png";
import { nanoid } from "nanoid";
import {
  FirebaseHelpers,
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import { PERMISSIONS, ROLES } from "../../utils/constants";
import { DisplayGuidesBody } from "./modals/guides";
import { sub } from "date-fns";

export const GroupDetail = () => {
  const history = useHistory();
  const params = useParams();
  const location = useLocation();
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { actions: uiActions } = useUi();
  const { user, defaultAvatars, institute } = storeState;
  const [group, setGroup] = useState();
  const [groupKids, setGroupKids] = useState([]);
  const [guides, setGuides] = useState([]);
  const [image, setImage] = useState();
  const [subjects, setSubjects] = useState([]);
  const [modalStates, setModalStates] = useState({
    updateScore: false,
    grantScore: false,
    grantCoupon: false,
    groupReport: false,
    imageUpload: false,
    kids: false,
    guides: false,
  });

  useEffect(() => {
    (async () => {
      db.collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(params.id)
        .onSnapshot((querySnapshot) => {
          setGroup(querySnapshot.data());
        });

      db.collection("Institution")
        .doc(user._code)
        .collection("kid")
        .where("groupId", "==", params.id)
        .onSnapshot((querySnapshot) => {
          const _kids = querySnapshot.docs.map((el) => el.data());

          setGroupKids(_kids);
        });
      db.collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(params.id)
        .collection("report_templates")
        .onSnapshot((querySnapshot) => {
          const reports = querySnapshot.docs.map((el) => el.data());
          setSubjects(reports);
        });

      db.collection("Institution")
        .doc(user._code)
        .collection("staff")
        .where("group_ids", "array-contains", params.id)
        .where("type", "==", ROLES.guide)
        .onSnapshot((querySnapshot) => {
          const _guides = querySnapshot.docs.map((el) => el.data());
          setGuides(_guides);
        });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (modalStates.groupReport) {
        const report_templates = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(params.id)
            .collection("report_templates")
            .get()
        ).docs.map((el) => el.data());
        setSubjects(report_templates);
      }
    })();
  }, [modalStates.groupReport]);

  const stats = useMemo(() => {
    const _groupLength = groupKids.length || 1;

    const averageGroupScore = groupKids.reduce(
      (acc, el) => (acc += el.score),
      0
    );
    const averageGroupXp =
      groupKids.reduce((acc, el) => (acc += el.xp), 0) / _groupLength;
    const totalGroupXp = averageGroupXp * _groupLength;
    const currentGroupLevel = Math.trunc(
      averageGroupXp / institute?.points_for_next_level
    );
    const xpNext =
      (currentGroupLevel + 1) * institute?.points_for_next_level * _groupLength;
    // const xpPrev = currentGroupLevel == 0 ? 0 : (currentGroupLevel - 1) * institute?.points_for_next_level * _groupLength;
    const xpPrev =
      currentGroupLevel == 0
        ? 0
        : currentGroupLevel == 1
          ? institute?.points_for_next_level * _groupLength
          : currentGroupLevel * institute?.points_for_next_level * _groupLength;

    const progress =
      (Number(totalGroupXp - xpPrev) / Number(xpNext - xpPrev)) * 100;

    return {
      averageGroupScore,
      averageGroupXp,
      totalGroupXp,
      currentGroupLevel,
      xpNext,
      xpPrev,
      progress: progress.toFixed(1),
    };
  }, [groupKids, institute]);

  useEffect(() => {
    if (!image) return;
    setModalStates((prev) => ({ ...prev, imageUpload: true }));
  }, [image]);

  const handleSpecialReportSave = async (
    subjectDeleted,
    subSubjectDeleted,
    subjectAdded,
    subSubjectAdded,
    subjectEdit,
    subSubjectEdit,
    subjectLock
  ) => {

    // delete subject
    let _save3 = await Promise.all(
      subjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

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
      })
    );

    // delete sub subject
    let _save4 = await Promise.all(
      subSubjectDeleted.map(async (sub) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

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
        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .get();

        let _report_templates = reportTemplates.data();
        
        // delete subsubject if sync
        if (_report_templates.isSync) {
          location?.state?.group.kids_ids.map(async (kid_id) => {
            const kidSubject = await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid_id)
              .collection("subjects")
              .doc(sub.subjectId)
              .get();
              
            const _kid_subject = kidSubject.data();
            if (_kid_subject !== undefined) {
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.subjectId)
                .update({
                  isSpecialReport: true,
                });

              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
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
                    .doc(kid_id)
                    .collection("subjects")
                    .doc(sub.subjectId)
                    .update({
                      hasSubSubject: false,
                    });
                }
            }
          })
        }
      })
    );

    // Add subject
    let _save1 = await Promise.all(
      subjectAdded.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          subSubject: [],
          obtainedPoints: 0,
          hasSubSubject: false,
          isSync:false
        };
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.id)
          .set(payload);

        location?.state?.group.kids_ids.map(async (kid_id) => {
          console.log(payload)
          await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid_id)
          .update({
            isSpecialReport: true,
          });

          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid_id)
            .collection("subjects")
            .doc(sub.id)
            .set(payload);
        })

        const kids = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .where("groupId", "==", group.id)
            .get()
        ).docs.map((el) => el.data());
        
        kids.map((el) => {
          [...subjects, payload].map(async (e) => {
            const subjectId = e.id;
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(el.id)
              .collection("achievements")
              .doc(subjectId)
              .set({
                redPoints: 0,
                streak: 0,
                subjectName: e.name,
                isDeleted: false,
                subject_id: subjectId,
              });
          });
        });
      })
    );

    // Add sub subject
    let _save2 = await Promise.all(
      subSubjectAdded.map(async (sub) => {
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: sub.obtainedPoints,
        };

        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .get();

        let _report_templates = reportTemplates.data();
        _report_templates.subSubject.push(payload);
        console.log(_report_templates)

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

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
          isSync:_report_templates.isSync
        };

        let totalSum = 0;
        _payload.subSubject.forEach((subSubject) => {
          totalSum = totalSum + subSubject.totalPoints;
        });

        _payload.totalPoints = totalSum;

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .set(_payload);

          console.log(location)
          if (_report_templates.isSync) {
            location?.state?.group.kids_ids.map(async (kid_id) => {
              console.log(location?.state?.group.kids_ids)
              const kidSubject = await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.subjectId)
                .get();
  
              const _kid_subject = kidSubject.data();
              if (_kid_subject !== undefined) {
                await db
                  .collection("Institution")
                  .doc(user._code)
                  .collection("kid")
                  .doc(kid_id)
                  .collection("subjects")
                  .doc(sub.subjectId)
                  .update({
                    isSpecialReport: true,
                  });
  
                await db
                  .collection("Institution")
                  .doc(user._code)
                  .collection("kid")
                  .doc(kid_id)
                  .collection("subjects")
                  .doc(sub.subjectId)
                  .delete();
  
                await db
                  .collection("Institution")
                  .doc(user._code)
                  .collection("kid")
                  .doc(kid_id)
                  .collection("subjects")
                  .doc(sub.subjectId)
                  .set(_payload);
              }
            })
          }
      })
    );

    // Edit subject
    let _save5 = await Promise.all(
      subjectEdit.map(async (sub) => {
        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.id)
          .get();

        let _report_templates = reportTemplates.data();

        // change subject inside group
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

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
          subSubject: sub.subSubject,
          obtainedPoints: sub.obtainedPoints,
          hasSubSubject: sub.hasSubSubject,
          isSync: _report_templates.isSync
        };

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.id)
          .set(payload);

        // if subject are sync
        if (_report_templates.isSync) {
          location?.state?.group.kids_ids.map(async (kid_id) => {
            const kidSubject = await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid_id)
              .collection("subjects")
              .doc(sub.id)
              .get();

            const _kid_subject = kidSubject.data();
            if (_kid_subject !== undefined) {
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.id)
                .update({
                  isSpecialReport: true,
                });

              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.id)
                .delete();

              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.id)
                .set(payload);
            }
          })
        }
      })
    );

    // Edit sub subject
    let _save6 = await Promise.all(
      // Edit sub subject inside group
      subSubjectEdit.map(async (sub) => {
        console.log(subSubjectEdit)
        const payload = {
          id: sub.id,
          name: sub.name,
          totalPoints: sub.totalPoints,
          obtainedPoints: sub.obtainedPoints,
        };

        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .get();

        let _report_templates = reportTemplates.data();
        console.log(_report_templates)


        _report_templates.subSubject.map((e, idx) => {
          if (e.id == sub.id) {
            _report_templates.subSubject[idx] = payload;
          }
        });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .update({
            isSpecialReport: true,
          });

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .delete();
          console.log(_report_templates)
        const _payload = {
          id: _report_templates.id,
          name: _report_templates.name,
          totalPoints: _report_templates.totalPoints,
          subSubject: _report_templates.subSubject,
          obtainedPoints: _report_templates.obtainedPoints,
          hasSubSubject: _report_templates.hasSubSubject,
          isSync:_report_templates.isSync
        };

        let totalSum = 0;
        _payload.subSubject.forEach((subSubject) => {
          totalSum = totalSum + subSubject.totalPoints;
        });

        _payload.totalPoints = totalSum;

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.subjectId)
          .set(_payload);

        // Code it subject is sync
        if (_report_templates.isSync) {
          location?.state?.group.kids_ids.map(async (kid_id) => {
            const kidSubject = await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid_id)
              .collection("subjects")
              .doc(sub.subjectId)
              .get();

            const _kid_subject = kidSubject.data();
            if (_kid_subject !== undefined) {
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.subjectId)
                .update({
                  isSpecialReport: true,
                });

              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.subjectId)
                .delete();

              await db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid_id)
                .collection("subjects")
                .doc(sub.subjectId)
                .set(_payload);
            }
          })
        }
      })
    );

    // Sync subject
    let _save7 = await Promise.all(
      subjectLock.map(async (sub) => {

        const reportTemplates = await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.id)
          .get();

        let _report_templates = reportTemplates.data();

        let _isSync = true;
        if (_report_templates.isSync === true) {
          _isSync = false
        }

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(sub.id)
          .update({
            isSync: _isSync,
          });
      })
    );

    closeGroupReport();
  };

  const handleReportDefault = async (subjects) => {
    await db
      .collection("Institution")
      .doc(user._code)
      .collection("groups")
      .doc(group.id)
      .update({
        isSpecialReport: false,
      });

    subjects.map(async (e) => {
      return await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(group.id)
        .collection("report_templates")
        .doc(e.id)
        .delete();
    });
    const defaultSubjects = (
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("basicReport")
        .get()
    ).docs.map((el) => el.data());

    await Promise.all(
      defaultSubjects.map(async (e) => {
        return await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .doc(e.id)
          .set({ ...e });
      })
    );

    const kids = (
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .where("groupId", "==", group.id)
        .get()
    ).docs.map((el) => el.data());

    kids.map((el) => {
      defaultSubjects.map(async (e) => {
        const subjectId = e.id;
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(el.id)
          .collection("achievements")
          .doc(subjectId)
          .set({
            redPoints: 0,
            streak: 0,
            subjectName: e.name,
            isDeleted: true,
            subject_id: subjectId,
          });
      });
    });
    closeGroupReport();
  };

  const closeUpdateScore = () => {
    setModalStates((prev) => ({ ...prev, updateScore: false }));
  };
  const closeGrantScore = () => {
    setModalStates((prev) => ({ ...prev, grantScore: false }));
  };
  const closeGroupReport = () => {
    setModalStates((prev) => ({ ...prev, groupReport: false }));
  };
  const closeGrantCoupon = () => {
    setModalStates((prev) => ({ ...prev, grantCoupon: false }));
  };
  const closeImageUpload = () => {
    setModalStates((prev) => ({ ...prev, imageUpload: false }));
    setImage(null);
  };
  const closeKidsModal = () => {
    setModalStates((prev) => ({ ...prev, kids: false }));
  };
  const closeGuidesModal = () => {
    setModalStates((prev) => ({ ...prev, guides: false }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
  };

  const handleDeleteGroup = () => {
    if (!user.permissions[PERMISSIONS.deleteGroup])
      return uiActions.alert("You don't have access to perform this action");

    if (group.kids_ids.length > 0)
      return uiActions.alert("Group is not empty", "error");

    uiActions.showDialog({
      action: FirebaseHelpers.deleteGroup.execute.bind(null, {
        user,
        group,
        history,
      }),
      title: `Delete ${group.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  const links = [
    {
      ref: "/groups",
      title: <FormattedMessage id="groups" />,
    },
    {
      ref: `/groups/${params.id}`,
      title: <FormattedMessage id="profile" />,
    },
  ];
  const linksToolbar = [
    {
      ref: "#",
      title: <FormattedMessage id="tools" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
    </div>
  );
  const toolBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={linksToolbar} />
      </div>
    </div>
  );

  if (!group)
    return (
      <section
        className={clsx([classes.default_page_root, classes.default_page_Bg1])}
      >
        <Loader />
      </section>
    );
  return (
    <Fragment>
      {/* ------------------------------------- */}

      <SimpleModal
        title={<FormattedMessage id="update_score" />}
        open={modalStates.updateScore}
        handleClose={closeUpdateScore}
      >
        <UpdateScoreBody group={group} handleClose={closeUpdateScore} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="grant_group_score" />}
        open={modalStates.grantScore}
        handleClose={closeGrantScore}
      >
        <GrantScoreBody group={group} handleClose={closeGrantScore} />
      </SimpleModal>

      {/* manage special report modal */}
      <SimpleModal
        disableBackdropClick
        title={<FormattedMessage id="manage_special_reporting" />}
        open={modalStates.groupReport}
        handleClose={closeGroupReport}
      >
        <GroupReportBody
          handleSave={handleSpecialReportSave}
          restoreDefault={handleReportDefault}
          open={modalStates.groupReport}
          _subjects={subjects}
          type="group"
          guides={guides.length}
          kids={groupKids.length}
          group={group}
          handleClose={closeGroupReport}
        />
      </SimpleModal>


      <SimpleModal
        title={<FormattedMessage id="upload_image" />}
        open={modalStates.imageUpload}
        handleClose={closeImageUpload}
      >
        <UplaoadImageBody
          group={group}
          image={image}
          handleClose={closeImageUpload}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="grant_group_coupon" />}
        open={modalStates.grantCoupon}
        handleClose={closeGrantCoupon}
      >
        <GrantCouponBody group={group} handleClose={closeGrantCoupon} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="kids" />}
        open={modalStates.kids}
        handleClose={closeKidsModal}
      >
        <DisplayKidsBody kids={groupKids} handleClose={closeGrantCoupon} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="guides" />}
        open={modalStates.guides}
        handleClose={closeGuidesModal}
      >
        <DisplayGuidesBody guides={guides} />
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
          <div>
            <div className={classes.imageContainer}>
              <img
                src={group?.image || defaultAvatars?.group}
                className={classes.groupImage}
              />
              <div className={classes.badgeContainer}>
                <Badge
                  value={
                    stats.currentGroupLevel === 0
                      ? 1
                      : stats.currentGroupLevel + 1
                  }
                />
              </div>
            </div>

            <Box marginY={1}>
              <label htmlFor="contained-button-file">
                <Input
                  onChange={handleFile}
                  style={{
                    display: "none",
                  }}
                  accept="image/*"
                  id="contained-button-file"
                  type="file"
                />
                <Button
                  fullWidth
                  component="span"
                  className={classes.fileButton}
                >
                  <FormattedMessage id="change_image" />
                </Button>
              </label>
            </Box>
          </div>
          <Box textAlign={"center"}>
            <Typography
              className={clsx([
                classes.default_typography_capitalize,
                classes.default_typography_bold,
                classes.default_typography_heading,
              ])}
            >
              {group?.name}
            </Typography>
            <Typography
              className={clsx([
                classes.default_typography_capsule,
                classes.default_typography_subHeading,
              ])}
            >
              {stats.averageGroupScore}
            </Typography>
          </Box>

          <div className={classes.progressBar}>
            <CircularProgressbarWithChildren
              value={stats.progress}
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
                {stats.progress}%
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
                <strong>{stats.xpNext}</strong>
              </Typography>
            </Box>

            <Box display={"flex"} alignItems="center" marginY={2}>
              <Box marginX={1}>
                <div className={classes.greenDot}></div>
              </Box>
              <Typography>
                <FormattedMessage id="current_point" />:{" "}
                <strong>{stats.totalGroupXp}</strong>
              </Typography>
            </Box>
          </div>

          <Box padding={2} border="1px solid #D5E3F8" borderRadius={12}>
            <Box
              margin={1}
              display={"flex"}
              alignItems={"center"}
              className={classes.pointer}
              onClick={() => {
                setModalStates((prev) => ({ ...prev, guides: true }));
              }}
            >
              <Box marginX={0.5}>
                <img src={GuideOne} />
              </Box>
              <Box marginX={0.5}>
                <Typography
                  className={clsx([
                    classes.default_typography_bold,
                    classes.default_typography_colorLight,
                  ])}
                >
                  <FormattedMessage id="guides" />
                </Typography>
              </Box>
              <Box marginX={0.5}>:</Box>
              <Box marginX={0.5}>
                <strong>{guides.length}</strong>
              </Box>
            </Box>
            <Box
              margin={1}
              display={"flex"}
              alignItems={"center"}
              className={classes.pointer}
              onClick={() => {
                setModalStates((prev) => ({ ...prev, kids: true }));
              }}
            >
              <Box marginX={0.5}>
                <img src={GuideTwo} />
              </Box>
              <Box marginX={0.5}>
                <Typography
                  className={clsx([
                    classes.default_typography_bold,
                    classes.default_typography_colorLight,
                  ])}
                >
                  <FormattedMessage id="kids" />
                </Typography>
              </Box>
              <Box marginX={0.5}>:</Box>
              <Box marginX={0.5}>
                <strong className={classes.countSpan}>
                  {groupKids.length}
                </strong>
              </Box>
            </Box>
          </Box>

          <Button
            startIcon={<Delete className={classes.deleteIcon} />}
            className={classes.deleteButton}
            onClick={handleDeleteGroup}
          >
            <FormattedMessage id="delete_group" />
          </Button>
        </div>

        <Box marginY={2}>
          <Divider />
        </Box>

        <Grid className={classes.default_page_scrollContainer} container>
          <Grid
            item
            lg={6}
            xs={12}
            className={classes.default_page_scrollContainer}
          >
            <section
              className={clsx([
                classes.default_page_root,
                classes.default_page_BgTransparent,
              ])}
            >
              <ScrollArea smoothScrolling>
                {toolBar}
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent="center"
                    >
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        marginX={3}
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
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent="center"
                    >
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        marginX={3}
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
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={<img src={File} />}
                      background={alpha("#FF991F", 0.1)}
                      label={"insights"}
                      onClick={() => {
                        history.push(`/groups/${params.id}/insights`);
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={<img src={History} />}
                      background={alpha("#57CAF7", 0.1)}
                      label={"history"}
                      onClick={() => {
                        history.push(`/groups/${params.id}/history`);
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={<img src={GroupIcon} />}
                      background={alpha("#F975DA", 0.1)}
                      label={"grant_group_score"}
                      onClick={() => {
                        if (!group.kids_ids.length)
                          return uiActions.alert("empty group", "error");
                        setModalStates((prev) => ({
                          ...prev,
                          grantScore: true,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={<img src={Update} />}
                      background={alpha("#A600D4", 0.1)}
                      label={"update_score"}
                      onClick={() => {
                        if (!group.kids_ids.length)
                          return uiActions.alert("empty group", "error");
                        setModalStates((prev) => ({
                          ...prev,
                          updateScore: true,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={
                        group.isSpecialReport ? (
                          <img
                            src={StarFull}
                            style={{ height: 45, width: 45 }}
                          />
                        ) : (
                          <img src={Star} />
                        )
                      }
                      background={alpha("#685BE7", 0.1)}
                      label={"special_report"}
                      onClick={() => {
                        setModalStates((prev) => ({
                          ...prev,
                          groupReport: true,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={
                        <Ticket style={{ color: "#5C82E3" }} fontSize="large" />
                      }
                      background={alpha("#5C82E3", 0.12)}
                      label={"grant_group_coupon"}
                      onClick={() => {
                        if (!user.permissions[PERMISSIONS.grantGroupCoupon])
                          return uiActions.alert(
                            "You don't have access to perform this action",
                            "info"
                          );
                        if (!group.kids_ids.length)
                          return uiActions.alert("empty group", "error");
                        setModalStates((prev) => ({
                          ...prev,
                          grantCoupon: true,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <ToolButton
                      image={<img src={Theme} />}
                      background={alpha("#FF991F", 0.1)}
                      label={"change_theme"}
                      onClick={() => { }}
                    />
                  </Grid>
                </Grid>
              </ScrollArea>
            </section>
          </Grid>
          <Grid item lg={6} xs={12}></Grid>
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
    [theme.breakpoints.only("xs")]: {
      flexDirection: "column",
      alignItems: "center",

      "& > *:not(:last-child)": {
        marginRight: 0,
        marginLeft: 0,
        marginBottom: 20,
      },
    },
  },
  groupImage: {
    height: 120,
    width: 120,
    objectFit: "cover",
    borderRadius: 15,
  },

  imageContainer: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    left: "90%",
    bottom: "90%",
    transform: "translate(-50%, 50%)",
  },

  fileButton: {
    fontWeight: "bold",
    backgroundColor: `${alpha("#2EFC4F", 0.2)} !important`,
    color: "#171717 !important",
    "&:hover": {
      color: "#171717 !important",
      backgroundColor: `${alpha("#2EFC4F", 0.2)} !important`,
    },
  },
  deleteButton: {
    fontSize: "16px !important",
    color: "#000 !important",
    background: `${alpha(`#FF1111`, 0.1)} !important`,
    padding: "20px 30px !important",
    "&:hover": {
      color: "#000 !important",
      background: `${alpha(`#FF1111`, 0.1)} !important`,
    },
  },
  deleteIcon: {
    color: "#FF1111",
    fontSize: "36px !important",
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
  },
  dotContainer: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: 10,
    },
    marginBottom: 20,
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
  pointer: {
    cursor: "pointer",
  },
}));
