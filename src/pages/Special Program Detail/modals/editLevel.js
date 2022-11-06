import {
  Grid,
  makeStyles,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, AddIconSim, Delete, SimpleModal } from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import firebase from "firebase/app";

import { AddSubjectBody } from "./addSubject";
import { AddSubSubjectBody } from "./addSubSubject";

import AddIcon from "../../../assets/icons/addIcon.png"; //Action Icon
import TickIcon from "../../../assets/icons/tickIcon.png";
import ExpandMoreIcon from "@material-ui/icons/ArrowRight";
import ExpandLessIcon from "@material-ui/icons/ArrowDropDown";
import Reset from "../../../assets/icons/reset.png";
import { getModalStyles, getTypographyStyles } from "../../../utils/helpers";
import clsx from "clsx";
import { nanoid } from "nanoid";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
    ...getTypographyStyles(theme),
    container: {
      display: "flex",
    },
    image: {
      width: 100,
      height: 100,
      objectFit: "cover",
      marginRight: 20,
    },

    metaContainer: {
      flex: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    title: {
      fontWeight: 600,
    },

    labelContainer: {
      width: "100%",
      display: "flex",
    },
    label: {
      color: "#808191",
    },
    orangeLabel: {
      fontWeight: 600,
      color: "#FF991F",
    },
    purpleLabel: {
      fontWeight: 600,
      color: "#685BE7",
    },
    actions: {
      marginTop: 20,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      "& > *:not(:last-child)": {
        marginRight: 10,
      },
    },

    subjectsContainer: {
      padding: 20,
    },
    accordionSummary: {
      "MuiIconButton-label > div": {
        display: "flex",
        alignItems: "flex-start",
      },
    },
    accordianText: {
      fontWeight: 600,
    },
    accordianActionsContainer: {
      display: "flex",
      justifyContent: "space-between",
    },
  };
});

export const EditLevelBody = (props) => {
  const { kid, currentLevel } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, defaultAvatars } = storeState;

  const [selectedSubject, setSelectedSubject] = useState();
  const [subjects, setSubjects] = useState([]);
  const [expanded, setExpanded] = React.useState(false);

  const [modalStates, setModalStates] = useState({
    subject: false,
    subSubject: false,
  });

  const totalSubjectPoints = useMemo(
    () => subjects.reduce((acc, el) => (acc += el.totalPoints), 0),
    [subjects]
  );

  const closeSubSubject = () =>
    setModalStates((prev) => ({ ...prev, subSubject: false }));
  const closeSubject = () =>
    setModalStates((prev) => ({ ...prev, subject: false }));
  const handleChange = (panel) => {
    setExpanded((prev) => (prev === panel ? false : panel));
  };

  useEffect(() => {
    db.collection("Institution")
      .doc(user._code)
      .collection("kid")
      .doc(kid.id)
      .collection("levels")
      .doc(currentLevel.id)
      .collection("subjects")
      .onSnapshot((snapshot) => {
        setSubjects(snapshot.docs.map((doc) => doc.data()));
      });
  }, []);

  const handleSubjectDelete = async (subject) => {
    if (subjects.length === 1)
      return actions.alert("Can't delete all subjects", "error");
    const action = async () => {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("achievements")
        .doc(subject.id)
        .update({
          isDeleted: true,
          redPoints: 0,
          streak: 0,
        });

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("levels")
        .doc(currentLevel.id)
        .collection("subjects")
        .doc(subject.id)
        .delete();
    };

    actions.showDialog({
      action,
      title: `Delete ${subject.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  const handleSubSubjectDelete = async (subSubject, subject) => {
    const action = async () => {
      const pointsSum =
        Number(subject.totalPoints) - Number(subSubject.totalPoints);

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("levels")
        .doc(currentLevel.id)
        .collection("subjects")
        .doc(subject.id)
        .update({
          subSubject: firebase.firestore.FieldValue.arrayRemove(subSubject),
          totalPoints: Number(pointsSum),
        });

      if (subject.subSubject.length == 2) {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("levels")
          .doc(currentLevel.id)
          .collection("subjects")
          .doc(subject.id)
          .update({
            hasSubSubject: false,
          });
      }
    };

    actions.showDialog({
      action,
      title: `Delete ${subSubject.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  const restoreDefault = async () => {
    // if (!props.user.permissions.kidSpecialReport) {
    //     return actions.showAlert("You don't have access to perform this action", 'info');
    // }

    const [lvl] = (
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("levels")
        .where("currentLevel", "==", true)
        .get()
    ).docs.map((el) => el.data());

    let subjects = await db
      .collection("Institution")
      .doc(user._code)
      .collection("kid")
      .doc(kid.id)
      .collection("levels")
      .doc(lvl.id)
      .collection("subjects")
      .get();
    await Promise.all(
      subjects.docs.map(async (sub) =>
        db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("levels")
          .doc(lvl.id)
          .collection("subjects")
          .doc(sub.id)
          .delete()
      )
    );

    const documents = (
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("basicReport")
        .get()
    ).docs.map((el) => el.data());

    await Promise.all(
      documents.map(async (report) => {
        const id = nanoid(6);
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("levels")
          .doc(currentLevel.id)
          .collection("subjects")
          .doc(id)
          .set({ ...report, id: id });

        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("achievements")
          .doc(id)
          .set({
            redPoints: 0,
            streak: 0,
            subjectName: report.name,
            isDeleted: true,
            subject_id: id,
          });
      })
    );
  };

  const renderSubjects = (subject, idx) => {
    const expandIconProps =
      subject.subSubject.length > 0
        ? {
            onClick: () => handleChange(`panel${idx}`),
          }
        : {
            style: {
              visibility: "hidden",
            },
          };

    return (
      <Accordion expanded={expanded === `panel${idx}`}>
        <AccordionSummary
          expandIcon={null}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          className={classes.accordionSummary}
        >
          <Grid container justify="center" alignItems="center">
            <Grid item lg={3} md={5} sm={4} xs={4}>
              <Typography className={classes.accordianText}>
                {subject.name}
              </Typography>
            </Grid>
            <Grid item lg={3} md={2} sm={4} xs={2}>
              <Typography className={classes.accordianText}>
                {subject.totalPoints}
              </Typography>
            </Grid>
            <Grid item lg={3} md={2} sm={2} xs={3}>
              <div
                onClick={() => {
                  setSelectedSubject(subject);
                  setModalStates((prev) => ({ ...prev, subSubject: true }));
                }}
              >
                <img src={AddIcon} className={classes.AddImage} alt=''/>
              </div>
            </Grid>
            <Grid item lg={3} md={2} sm={2} xs={3}>
              <div className={classes.accordianActionsContainer}>
                <div>
                  <Delete
                    style={{ color: "#8F92A1" }}
                    onClick={() => {
                      handleSubjectDelete(subject);
                    }}
                  />
                </div>
                <div {...expandIconProps}>
                  {expanded === `panel${idx}` ? (
                    <ExpandLessIcon style={{ color: "#8F92A1" }} />
                  ) : (
                    <ExpandMoreIcon style={{ color: "#8F92A1" }} />
                  )}
                </div>
              </div>
            </Grid>
          </Grid>
        </AccordionSummary>
        {subject.subSubject.map((subSubject, idx) => (
          <AccordionDetails>
            <Grid container justify="center" alignItems="center">
              <Grid item lg={3} md={5} sm={4} xs={5}>
                <div style={{ display: "flex" }}>
                  <img
                    src={TickIcon}
                    alt=''
                    style={{
                      width: 13,
                      height: 12,
                      marginTop: 6,
                      marginRight: 10,
                    }}
                  />
                  <Typography className={classes.summaryTypo}>
                    {subSubject.name}
                  </Typography>
                </div>
              </Grid>
              <Grid item lg={3} md={2} sm={4} xs={2}>
                <Typography className={classes.accordianText}>
                  {subSubject.totalPoints}
                </Typography>
              </Grid>
              <Grid item lg={3} md={2} sm={2} xs={2}></Grid>
              <Grid item lg={3} md={2} sm={2} xs={2}>
                <Delete
                  style={{ color: "#8F92A1" }}
                  onClick={() => {
                    handleSubSubjectDelete(subSubject, subject);
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        ))}
      </Accordion>
    );
  };

  return (
    <Fragment>
      <SimpleModal
        title={<FormattedMessage id="add_subject" />}
        open={modalStates.subject}
        handleClose={closeSubject}
      >
        <AddSubjectBody
          currentLevel={currentLevel}
          kid={kid}
          subjects={subjects}
          handleClose={closeSubject}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="add_sub_subjects" />}
        open={modalStates.subSubject}
        handleClose={closeSubSubject}
      >
        <AddSubSubjectBody
          kid={kid}
          currentLevel={currentLevel}
          subject={selectedSubject}
          subjects={subjects}
          handleClose={closeSubSubject}
        />
      </SimpleModal>

      <div className={classes.body}>
        <Grid container>
          <Grid item xs={12} md={12} lg={8}>
            <div className={classes.container}>
              <img
                className={classes.image}
                src={kid?.image || defaultAvatars?.kid}
              />

              <div className={classes.metaContainer}>
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
                    classes.default_typography_uppercase,
                    classes.default_typography_bold,
                    classes.default_typography_paragraph,
                  ])}
                >
                  <FormattedMessage id={"total_points"} /> :{" "}
                  {totalSubjectPoints}
                </Typography>
              </div>
            </div>
          </Grid>

          <Grid className={classes.actions} item xs={12} md={12} lg={4}>
            <Button onClick={restoreDefault} startIcon={<img src={Reset} />}>
              <FormattedMessage id="reset_to_default" />
            </Button>

            <Button
              onClick={() =>
                setModalStates((prev) => ({ ...prev, subject: true }))
              }
              startIcon={<AddIconSim />}
            >
              <FormattedMessage id="add_subject" />
            </Button>
          </Grid>
        </Grid>

        <div className={classes.subjectsContainer}>
          {subjects.map((el, idx) => renderSubjects(el, idx))}
        </div>
      </div>
    </Fragment>
  );
};
