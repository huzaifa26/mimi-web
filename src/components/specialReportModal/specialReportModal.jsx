/* eslint-disable no-unused-vars */
import {
  Grid,
  makeStyles,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, AddIconSim, Delete, SimpleModal } from "..";
import { useStore } from "../../store";
import { db } from "../../utils/firebase";
import firebase from "firebase/app";
import { AddSubjectBody } from "./addSubject";
import { AddSubSubjectBody } from "./addSubSubject";
import { EditSubjectBody } from "./editSubject";
import { EditSubSubjectBody } from "./editSubSubject";
import AddIcon from "../../assets/icons/addIcon.png"; //Action Icon
import TickIcon from "../../assets/icons/tickIcon.png";
import ExpandMoreIcon from "@material-ui/icons/ArrowRight";
import ExpandLessIcon from "@material-ui/icons/ArrowDropDown";
import Reset from "../../assets/icons/reset.png";
import { Edit } from "../Icons";
import { getModalStyles, stopEventBubble } from "../../utils/helpers";
import Draggable from "react-draggable";

export const GroupReportBody = (props) => {
  const {
    group,
    guides,
    kids,
    kid,
    type,
    _subjects,
    handleSave,
    handleClose,
    restoreDefault,
  } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { user, defaultAvatars } = storeState;
  const [selectedSubject, setSelectedSubject] = useState();
  const [selectedSubSubject, setSelectedSubSubject] = useState();
  const [subjects, setSubjects] = useState(_subjects);
  const [_subjectAdded, setSubjectAdded] = useState([]);
  const [_subSubjectAdded, setSubSubjectAdded] = useState([]);
  const [_subjectDeleted, setSubjectDeleted] = useState([]);
  const [_subSubjectDeleted, setSubSubjectDeleted] = useState([]);
  const [_subjectEdit, setSubjectEdit] = useState([]);
  const [_subSubjectEdit, setSubSubjectEdit] = useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [restoreLoading, setRestoreLoading] = React.useState(false);

  const [modalStates, setModalStates] = useState({
    subject: false,
    subSubject: false,
    editSubject: false,
    editSubSubject: false,
  });
  const closeSubSubject = () =>
    setModalStates((prev) => ({ ...prev, subSubject: false }));
  const closeEditSubject = () =>
    setModalStates((prev) => ({ ...prev, editSubject: false }));
  const closeEditSubSubject = () =>
    setModalStates((prev) => ({ ...prev, editSubSubject: false }));
  const closeSubject = () =>
    setModalStates((prev) => ({ ...prev, subject: false }));
  const handleChange = (panel) => {
    setExpanded((prev) => (prev === panel ? false : panel));
  };
  const subjectAdded = (payload, subject) => {
    setSubjects(payload);
    setSubjectAdded((prev) => [...prev, subject]);
  };
  const subSubjectAdded = (payload, subSubject) => {
    setSubjects(payload);
    setSubSubjectAdded((prev) => [...prev, subSubject]);
  };
  const subjectEdited = (payload, subSubject) => {
    setSubjects(payload);
    setSubjectEdit((prev) => [...prev, subSubject]);
  };
  const subSubjectEdited = (payload, subSubject) => {
    setSubjects(payload);
    setSubSubjectEdit((prev) => [...prev, subSubject]);
  };

  const totalPoints = subjects.reduce((acc, el) => (acc += el.totalPoints), 0);

  const _handleSubSubjectDelete = (selectedSubSubjects, selectedSubject) => {
    const subjectsCopy = [...subjects];
    const index = subjectsCopy.findIndex((e) => e.id == selectedSubject.id);
    const updatedSubSubjects = subjectsCopy
      .at(index)
      .subSubject.filter((el) => el.id != selectedSubSubjects.id);
    subjectsCopy[index].subSubject = updatedSubSubjects;
    let points = 0;
    subjectsCopy[index].subSubject.map((e) => {
      points = e.totalPoints + points;
    });
    subjectsCopy[index].totalPoints = points;
    setSubjects(subjectsCopy);
    const subjectIds = {
      subjectId: selectedSubject.id,
      subSubjectId: selectedSubSubjects.id,
      subSubject: selectedSubSubjects,
      subjectPoints: points,
      subSubjectLength: subjectsCopy[index].subSubject.length,
    };
    setSubSubjectDeleted((prev) => [...prev, subjectIds]);
  };

  const _handleSubjectDelete = (id, subject) => {
    if (subjects.length == 1) {
      window.alert("Can't delete all subjects");
      return;
    }
    const filteredSubjects = subjects.filter((e) => e.id != id);
    setSubjects(filteredSubjects);
    setSubjectDeleted((prev) => [...prev, subject]);
  };
  const handleC = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
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
      <Accordion
        expanded={expanded === `panel${idx}`}
        onChange={handleC(`panel${idx}`)}
      >
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
                onClick={stopEventBubble(() => {
                  setSelectedSubject(subject);
                  setModalStates((prev) => ({ ...prev, subSubject: true }));
                })}
              >
                <img src={AddIcon} className={classes.AddImage} alt='' />
              </div>
            </Grid>
            <Grid item lg={2} md={2} sm={2} xs={2}>
              <Edit
                className={classes.editHover}
                style={{
                  color: "#8F92A1",
                  marginRight: "10",
                }}
                onClick={stopEventBubble(() => {
                  setSelectedSubject(subject);
                  setModalStates((prev) => ({ ...prev, editSubject: true }));
                })}
              />
              <Delete
                className={classes.delHover}
                style={{
                  color: "#8F92A1",
                }}
                onClick={stopEventBubble(() => {
                  _handleSubjectDelete(subject.id, subject);
                })}
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
                <Edit
                  className={classes.editHover}
                  style={{
                    color: "#8F92A1",
                    marginRight: "10",
                  }}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setSelectedSubSubject(subSubject);
                    setModalStates((prev) => ({
                      ...prev,
                      editSubSubject: true,
                    }));
                  }}
                />
                <Delete
                  className={classes.delHover}
                  style={{
                    color: "#8F92A1",
                  }}
                  onClick={() => {
                    _handleSubSubjectDelete(subSubject, subject);
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
          subjectAdded={subjectAdded}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="add_sub_subjects" />}
        open={modalStates.subSubject}
        handleClose={closeSubSubject}
      >
        <AddSubSubjectBody
          group={group}
          selectedSubject={selectedSubject}
          subjects={subjects}
          handleClose={closeSubSubject}
          subSubjectAdded={subSubjectAdded}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="edit_subject" />}
        open={modalStates.editSubject}
        handleClose={closeEditSubject}
      >
        <EditSubjectBody
          group={group}
          selectedSubject={selectedSubject}
          subjects={subjects}
          handleClose={closeEditSubject}
          subjectEdited={subjectEdited}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="edit_subject" />}
        // title={<FormattedMessage id="edit_sub_subject" />}
        open={modalStates.editSubSubject}
        handleClose={closeEditSubSubject}
      >
        <EditSubSubjectBody
          group={group}
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          subjects={subjects}
          handleClose={closeEditSubSubject}
          subSubjectEdited={subSubjectEdited}
        />
      </SimpleModal>

      <Grid container>
        <Grid item xs={12} md={12} lg={6}>
          <div className={classes.container}>
            {type == "group" && (
              <Box mx={2}>
                <img
                  className={classes.image}
                  src={group?.image || defaultAvatars?.group}
                  alt=''
                />
              </Box>
            )}
            {type == "kid" && (
              <Box mx={2}>
                <img
                  className={classes.image}
                  src={kid?.image || defaultAvatars?.kid}
                  alt=''
                />
              </Box>
            )}

            <div className={classes.metaContainer}>
              {type == "group" && (
                <Typography className={classes.title} variant="h5">
                  {group?.name}
                </Typography>
              )}
              {type == "kid" && (
                <Typography className={classes.title} variant="h5">
                  {kid?.name}
                </Typography>
              )}
              {type == "kid" && (
                <>
                  <div>
                    <Typography className={classes.title}>
                      <FormattedMessage id={"total_points"} />
                    </Typography>
                    <Typography className={classes.title}>
                      {totalPoints}
                    </Typography>
                  </div>
                </>
              )}
              {type == "group" && (
                <>
                  <div className={classes.labelContainer}>
                    <div>
                      <Typography className={classes.label} variant="body2">
                        <FormattedMessage id="total_guides" />:
                      </Typography>
                      <Typography
                        variant="body2"
                        className={classes.orangeLabel}
                      >
                        {guides}
                      </Typography>
                    </div>
                    <div>
                      <Typography className={classes.label} variant="body2">
                        <FormattedMessage id="total_kids" />:
                      </Typography>
                      <Typography
                        variant="body2"
                        className={classes.purpleLabel}
                      >
                        {kids}
                      </Typography>
                    </div>
                  </div>
                  <div>
                    <Typography className={classes.title}>
                      <FormattedMessage id={"total_points"} />
                    </Typography>
                    <Typography className={classes.title}>
                      {totalPoints}
                    </Typography>
                  </div>
                </>
              )}
            </div>
          </div>
        </Grid>

        <Grid className={classes.actions} item xs={12} md={12} lg={6}>
          {type == "group" && (
            <Button
              loading={restoreLoading}
              startIcon={!restoreLoading && <img src={Reset} alt=''/>}
              onClick={() => {
                setRestoreLoading(true);
                restoreDefault(subjects);
              }}
              disabled={group?.isSpecialReport == false}
            >
              <FormattedMessage id="restore_to_default" />
            </Button>
          )}
          {type == "kid" && (
            <Button
              loading={restoreLoading}
              startIcon={!restoreLoading && <img src={Reset} alt=''/>}
              onClick={() => {
                setRestoreLoading(true);
                restoreDefault(subjects);
              }}
              disabled={kid?.has_special_program == false}
            >
              <FormattedMessage id="restore_to_default" />
            </Button>
          )}

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
      <div className={classes.footer}>
        <Button className={classes.cancelButton} onClick={handleClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button
          className={classes.saveButton}
          loading={loading}
          onClick={() => {
            setLoading(true);
            handleSave(
              _subjectDeleted,
              _subSubjectDeleted,
              _subjectAdded,
              _subSubjectAdded,
              _subjectEdit,
              _subSubjectEdit
            );
          }}
        >
          <FormattedMessage id="save" />
        </Button>
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
    cancelButton: {
      "&:hover": {
        backgroundColor: "red!important",
      },
      width: "10%",
      padding: 5,
      margin: 5,
    },
    delHover: {
      "&:hover": {
        color: "red!important",
      },
    },
    editHover: {
      "&:hover": {
        color: "#685BE7!important",
      },
    },
    saveButton: {
      // :"#00e600",
      "&:hover": {
        backgroundColor: "green!important",
      },
      width: "10%",
      padding: 5,
      margin: 5,
    },
    footer: {
      margin: 10,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
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
