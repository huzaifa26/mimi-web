import {
  Grid,
  makeStyles,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, AddIconSim, Delete, SimpleModal } from "../../../components";
import { useStore} from "../../../store";
import { db } from "../../../utils/firebase";
import firebase from "firebase/app";
import { AddSubjectBody } from "./addSubject";
import { AddSubSubjectBody } from "./addSubSubject";
import AddIcon from "../../../assets/icons/addIcon.png"; //Action Icon
import TickIcon from "../../../assets/icons/tickIcon.png";
import ExpandMoreIcon from "@material-ui/icons/ArrowRight";
import ExpandLessIcon from "@material-ui/icons/ArrowDropDown";
import Reset from "../../../assets/icons/reset.png";
import { getModalStyles } from "../../../utils/helpers";

export const c = (props) => {
  const { group, guides, kids } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { user, defaultAvatars } = storeState;
  const [selectedSubject, setSelectedSubject] = useState();
  const [subjects, setSubjects] = useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [modalStates, setModalStates] = useState({
    subject: false,
    subSubject: false,
  });

  const closeSubSubject = () =>
    setModalStates((prev) => ({ ...prev, subSubject: false }));
  const closeSubject = () =>
    setModalStates((prev) => ({ ...prev, subject: false }));
  const handleChange = (panel) => {
    setExpanded((prev) => (prev === panel ? false : panel));
  };

  useEffect(() => {
    db.collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .collection("report_templates")
      .onSnapshot((snapshot) => {
        setSubjects(snapshot.docs.map((doc) => doc.data()));
      });
  }, []);

  const totalPoints = subjects.reduce((acc, el) => (acc += el.totalPoints), 0);

  const restoreDefault = async () => {
    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .update({
        isSpecialReport: false,
      });

    subjects.map(async (e) => {
      return await db
        .collection("Institution")
        .doc(user?._code)
        .collection("groups")
        .doc(group.id)
        .collection("report_templates")
        .doc(e.id)
        .delete();
    });
    const defaultSubjects = (
      await db
        .collection("Institution")
        .doc(user?._code)
        .collection("basicReport")
        .get()
    ).docs.map((el) => el.data());

    await Promise.all(
      defaultSubjects.map(async (e) => {
        return await db
          .collection("Institution")
          .doc(user?._code)
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
        .doc(user?._code)
        .collection("kid")
        .where("groupId", "==", group.id)
        .get()
    ).docs.map((el) => el.data());

    kids.map((el) => {
      defaultSubjects.map(async (e) => {
        const subjectId = e.id;
        await db
          .collection("Institution")
          .doc(user?._code)
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
  };

  const handleSubjectDelete = async (id) => {
    const confirm = window.confirm(
      <FormattedMessage id="delete_message"/>
    );
    if (!confirm) {
      return;
    }

    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .update({
        isSpecialReport: true,
      });

    if (subjects.length == 1) {
      window.alert("Can't delete all subjects");
      return;
    }

    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .collection("report_templates")
      .doc(id)
      .delete();

    let kids = (
      await db
        .collection("Institution")
        .doc(user?._code)
        .collection("kid")
        .where("groupId", "==", group.id)
        .get()
    ).docs.map((el) => el.data());

    kids.map(async (el) => {
      await db
        .collection("Institution")
        .doc(user?._code)
        .collection("kid")
        .doc(el.id)
        .collection("achievements")
        .doc(id)
        .update({
          isDeleted: true,
          redPoints: 0,
          streak: 0,
        });
    });
  };
  const handleSubSubjectDelete = async (subSubject, subject) => {
    const confirm = window.confirm(
      <FormattedMessage id="delete_message"/>
    );
    if (!confirm) {
      return;
    }

    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .update({
        isSpecialReport: true,
      });

    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .collection("report_templates")
      .doc(subject.id)
      .update({
        subSubject: firebase.firestore.FieldValue.arrayRemove(subSubject),
      });
    const pointsSum =
      Number(subject.totalPoints) - Number(subSubject.totalPoints);

    await db
      .collection("Institution")
      .doc(user?._code)
      .collection("groups")
      .doc(group.id)
      .collection("report_templates")
      .doc(subject.id)
      .update({
        totalPoints: Number(pointsSum),
      });

    if (!subject.subSubject.length) {
      await db
        .collection("Institution")
        .doc(user?._code)
        .collection("groups")
        .doc(group.id)
        .collection("report_templates")
        .doc(subject.id)
        .update({
          hasSubSubject: false,
        });
    }
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
            <Grid item lg={4} md={5} sm={4} xs={5}>
              <Box display={"flex"}>
                <Box {...expandIconProps} marginRight={1}>
                  {expanded === `panel${idx}` ? (
                    <ExpandLessIcon style={{ color: "#8F92A1" }} />
                  ) : (
                    <ExpandMoreIcon style={{ color: "#8F92A1" }} />
                  )}
                </Box>

                <Typography className={classes.accordianText}>
                  {subject.name}
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={4} md={2} sm={4} xs={3}>
              <Typography className={classes.accordianText}>
                {subject.totalPoints}
              </Typography>
            </Grid>
            <Grid item lg={2} md={2} sm={2} xs={2}>
              <div
                onClick={() => {
                  setSelectedSubject(subject);
                  setModalStates((prev) => ({ ...prev, subSubject: true }));
                }}
              >
                <img src={AddIcon} className={classes.AddImage} alt=''/>
              </div>
            </Grid>
            <Grid item lg={2} md={2} sm={2} xs={2}>
              <Delete
                style={{ color: "#8F92A1" }}
                onClick={() => {
                  handleSubjectDelete(subject.id);
                }}
              />
            </Grid>
          </Grid>
        </AccordionSummary>
        {subject.subSubject.map((subSubject, idx) => (
          <AccordionDetails>
            <Grid container justify="center" alignItems="center">
              <Grid item lg={4} md={5} sm={4} xs={5}>
                <div style={{ display: "flex" }}>
                  <img
                    src={TickIcon}
                    style={{
                      width: 13,
                      height: 12,
                      marginTop: 6,
                      marginRight: 10,
                    }}
                    alt=''
                  />
                  <Typography className={classes.summaryTypo}>
                    {subSubject.name}
                  </Typography>
                </div>
              </Grid>
              <Grid item lg={4} md={2} sm={4} xs={3}>
                <Typography className={classes.accordianText}>
                  {subSubject.totalPoints}
                </Typography>
              </Grid>
              <Grid item lg={2} md={2} sm={2} xs={2}></Grid>
              <Grid item lg={2} md={2} sm={2} xs={2}>
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
          group={group}
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
          group={group}
          subject={selectedSubject}
          subjects={subjects}
          handleClose={closeSubSubject}
        />
      </SimpleModal>

      <Grid container>
        <Grid item xs={12} md={12} lg={6}>
          <div className={classes.container}>
            <Box mx={2}>
              <img
                className={classes.image}
                src={group.image || defaultAvatars.group}
                alt=''
              />
            </Box>
            <div className={classes.metaContainer}>
              <Typography className={classes.title} variant="h5">
                {group.name}
              </Typography>
              <div className={classes.labelContainer}>
                <div>
                  <Typography className={classes.label} variant="body2">
                    <FormattedMessage id="total_guides" />:
                  </Typography>
                  <Typography variant="body2" className={classes.orangeLabel}>
                    {guides}
                  </Typography>
                </div>
                <div>
                  <Typography className={classes.label} variant="body2">
                    <FormattedMessage id="total_kids" />:
                  </Typography>
                  <Typography variant="body2" className={classes.purpleLabel}>
                    {kids}
                  </Typography>
                </div>
              </div>
              <div>
                <Typography>
                  <FormattedMessage id={"total_points"} />
                </Typography>
                <Typography>{totalPoints}</Typography>
              </div>
            </div>
          </div>
        </Grid>

        <Grid className={classes.actions} item xs={12} md={12} lg={6}>
          <Button
            startIcon={<img src={Reset} alt=''/>}
            onClick={restoreDefault}
            disabled={group?.isSpecialReport == false}
          >
            <FormattedMessage id="restore_to_default" />
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
    </Fragment>
  );
};
const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
    container: {
      display: "flex",
    },
    image: {
      width: 100,
      height: 100,
      objectFit: "cover",
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
      marginTop: 10,
      marginBottom: 10,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      "& > *:not(:last-child)": {
        marginRight: 10,
      },
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
