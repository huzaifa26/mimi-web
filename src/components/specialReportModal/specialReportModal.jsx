/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  makeStyles,
  Typography
} from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ArrowDropDown";
import ExpandMoreIcon from "@material-ui/icons/ArrowRight";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FormattedMessage } from "react-intl";
import { useLocation, useParams } from "react-router-dom";
import { AddIconSim, Button, Delete, SimpleModal } from "..";
import AddIcon from "../../assets/icons/addIcon.png"; //Action Icon
import Reset from "../../assets/icons/reset.png";
import TickIcon from "../../assets/icons/tickIcon.png";
import { useStore } from "../../store";
import { getModalStyles, stopEventBubble } from "../../utils/helpers";
import { Edit } from "../Icons";
import { AddSubjectBody } from "./addSubject";
import { AddSubSubjectBody } from "./addSubSubject";
import { EditSubjectBody } from "./editSubject";
import { EditSubSubjectBody } from "./editSubSubject";
// import Draggable from "react-draggable";
import { db } from "../../utils/firebase";
import { SyncSubject } from "./syncSubject";
import { Sync } from "@material-ui/icons";
import { useRef } from "react";

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
  const location = useLocation()
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { user, defaultAvatars } = storeState;
  const [selectedSubject, setSelectedSubject] = useState();
  const [selectedSubSubject, setSelectedSubSubject] = useState();
  const [subjects, setSubjects] = useState(_subjects);
  const [_subjectAdded, setSubjectAdded] = useState([]);
  const [_subSubjectAdded, setSubSubjectAdded] = useState([]);
  const [_subjectDeleted, setSubjectDeleted] = useState({sub:[]});
  const [_subSubjectDeleted, setSubSubjectDeleted] = useState([]);
  const [_subjectEdit, setSubjectEdit] = useState([]);
  const [_subSubjectEdit, setSubSubjectEdit] = useState([]);
  const [_subjectLock, setSubjectLock] = useState([]);
  const [_subjectOrder, setSubjectOrder] = useState([]);

  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [restoreLoading, setRestoreLoading] = React.useState(false);
  const [oldSubjects, setOldSubjects] = useState([]);
  const [syncSubId, setSyncSubId] = useState();
  const [syncSubject, setSyncSubject] = useState();
  const droppableRef = useRef(null);
  const boxRef = useRef(null);

  const [modalStates, setModalStates] = useState({
    subject: false,
    subSubject: false,
    editSubject: false,
    editSubSubject: false,
    sync: false
  });
  const closeSubSubject = () => setModalStates((prev) => ({ ...prev, subSubject: false }));

  const closeEditSubject = () => setModalStates((prev) => ({ ...prev, editSubject: false }));

  const closeEditSubSubject = () => setModalStates((prev) => ({ ...prev, editSubSubject: false }));

  const closeSubject = () => setModalStates((prev) => ({ ...prev, subject: false }));

  const closeSync = () => setModalStates((prev) => ({ ...prev, sync: false }));

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
      isSync: selectedSubject.isSync,
      selectedSubject
    };
    setSubSubjectDeleted((prev) => [...prev, subjectIds]);
  };

  const _handleSubjectDelete = (id, subject) => {
    if (subjects.length == 1) {
      window.alert("Can't delete all subjects");
      return;
    }
    let count=0;
    let isSpecialReport=false;
    const filteredSubjects = subjects.filter((e) => {
      if(e.type === "group" && location.pathname.includes("/groups") && e.id != id){
        count++;
      }
      if(e.type === "kid" && location.pathname.includes("/kids") && e.id != id){
        count++;
      }
      return e.id != id
    });
    if(count>0){
      isSpecialReport=true;
    }
    setSubjects(filteredSubjects);
    // setSubjectDeleted((prev) => [...prev, subject]);
    setSubjectDeleted((prev) => {
      return {sub:[...prev.sub,subject],isSpecialReport}
    });
  };

  const handleC = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const params = useParams();
  useEffect(() => {
    (async () => {
      const report_templates = (
        await db
          .collection("Institution")
          .doc(user?._code)
          .collection("groups")
          .doc(params.id)
          .collection("report_templates")
          .get()
      ).docs.map((el) => el.data());
      setOldSubjects(report_templates);
    })();
  }, []);

  function insertAndShift(arr, from, to) {
    let cutOut = arr.splice(from, 1)[0];  // cut the element at index 'from'
    arr.splice(to, 0, cutOut);            // insert it at index 'to'
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const subjectCopy = [...subjects];
    insertAndShift(subjectCopy, result.source.index, result.destination.index);
    setSubjects(subjectCopy);
    setSubjectOrder(subjectCopy);
  };

  const _handleSyncSubject = (id, subject) => {
    let subjectCopy = [...subjects]
    subjectCopy.map((sub) => {
      if (sub.id === subject.id) {
        sub.isSync = !subject.isSync
      }
    })
    setSubjectLock((prev) => [...prev, subject]);
  }

  const [dropableHeight, setDropableheight] = useState(null);
  const [boxOffSetHeight, setBoxOffSetHeight] = useState(null);

  //Get height of scroll area to set different getItemList.
  useEffect(() => {
    setDropableheight(droppableRef?.current?.scrollHeight)
  }, [subjects])

  //Get height of Box covering scroll area to set different getItemList.
  useEffect(() => {
    setBoxOffSetHeight(boxRef?.current?.offsetHeight)
  }, [subjects])

  const renderSubjects = (subject, idx) => {
    const expandIconProps =
      subject?.subSubject.length > 0
        ? {
          onClick: () => handleChange(`panel${idx}`),
        }
        : {
          style: {
            visibility: "hidden",
          },
        };

    return (
      <div>
        <Draggable key={idx} draggableId={"subject-" + idx} index={idx}>
          {(provider, snapshot) => {
            let getItemStyle = (isDragging, draggableStyle) => ({
              userSelect: "none",
              paddingLeft: '2%',
              margin: '0%',
              ...draggableStyle,
              position: dropableHeight < 400 ? "relative" : "none",
              left: snapshot.isDragging ? 0 : 0,
              top: snapshot.isDragging && '40px',
            });
            if (dropableHeight > boxOffSetHeight) {
              getItemStyle = (isDragging, draggableStyle) => ({
                userSelect: "none",
                paddingLeft: '2%',
                margin: '0%',
                ...draggableStyle,
                marginTop: snapshot.isDragging ? -20 : 0,
                left: snapshot.isDragging ? 23 : 0,
              });
            }

            return (
              <Accordion
                ref={provider.innerRef}
                {...provider.draggableProps}
                expanded={expanded === `panel${idx}`}
                onChange={handleC(`panel${idx}`)}
                // style={style}
                style={getItemStyle(
                  snapshot.isDragging,
                  provider.draggableProps.style
                )}
              >
                <AccordionSummary
                  expandIcon={null}
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                  className={classes.accordionSummary}
                >
                  <Grid container justify="center" alignItems="center">

                    <Grid
                      item
                      lg={4}
                      md={5}
                      sm={4}
                      xs={5}

                    >
                      <Box display={"flex"}>

                        {/* Dragable icon */}
                        <Typography {...provider.dragHandleProps}>
                          <DragIndicatorIcon />
                        </Typography>

                        <Box {...expandIconProps} marginRight={1}>
                          {expanded === `panel${idx}` ? (
                            <ExpandLessIcon style={{ color: "#8F92A1" }} />
                          ) : (
                            <ExpandMoreIcon style={{ color: "#8F92A1" }} />
                          )}
                        </Box>

                        <Typography className={classes.accordianText}>
                          {subject?.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item lg={4} md={2} sm={4} xs={3}>
                      <Typography className={classes.accordianText}>
                        {subject?.totalPoints}
                      </Typography>
                    </Grid>
                    <Grid item lg={2} md={2} sm={2} xs={2}>
                      {subject.type === "group" && location.pathname.includes("/groups") &&
                        <div
                          onClick={stopEventBubble(() => {
                            setSelectedSubject(subject);
                            setModalStates((prev) => ({
                              ...prev,
                              subSubject: true,
                            }));
                          })}
                        >
                          <img
                            src={AddIcon}
                            className={classes.AddImage}
                            alt=""
                          />
                        </div>
                      }
                      {(subject.type === "kid" && location.pathname.includes("/kids") || (subject.type === "group" && !subject.isSync && location.pathname.includes("/kids")) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/kids")) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/groups")) ) &&
                        <div
                          onClick={stopEventBubble(() => {
                            setSelectedSubject(subject);
                            setModalStates((prev) => ({
                              ...prev,
                              subSubject: true,
                            }));
                          })}
                        >
                          <img
                            src={AddIcon}
                            className={classes.AddImage}
                            alt=""
                          />
                        </div>
                      }
                      {location.pathname.includes("/data") &&
                        <div
                          onClick={stopEventBubble(() => {
                            setSelectedSubject(subject);
                            setModalStates((prev) => ({
                              ...prev,
                              subSubject: true,
                            }));
                          })}
                        >
                          <img
                            src={AddIcon}
                            className={classes.AddImage}
                            alt=""
                          />
                        </div>
                      }
                    </Grid>
                    <Grid item lg={2} md={2} sm={2} xs={2}>
                      {(!subject.isSync && location.pathname.includes("/kids")) || (subject.type === "basic" && location.pathname.includes("/groups")) ? null :
                        <Sync className={classes.editHover}
                          style={(subject.isSync && !location.pathname.includes("/kids") && (subject.type === "group" && location.pathname.includes("/groups"))) || (subject.isSync && subject.type === "basic" && location.pathname.includes("/data")) ? {
                            color: "#685be7", //Blue
                            marginRight: "10",
                          } : subject.isSync && location.pathname.includes("/kids") || (subject.isSync && subject.type === "basic") ? {
                            color: "#4cb763", //Green
                            marginRight: "10",
                          } : (!subject.isSync && subject.type === "basic" && location.pathname.includes("/groups")) ? {
                            color: "#4cb763", //Green
                            marginRight: "10",
                            pointerEvents: "none"
                          } : {
                            color: "#8F92A1",
                            marginRight: "10",
                          }}
                          onClick={stopEventBubble(() => {
                            setSyncSubId(subject.id)
                            setSyncSubject(subject)
                            setModalStates((prev) => ({
                              ...prev,
                              sync: true,
                            }));
                          })}
                        />
                      }
                      {(subject.isSync && subject.type === "basic" && location.pathname.includes("/groups")) ?
                        <Sync className={classes.editHover}
                          style={{
                            color: "#4cb763", //Green
                            pointerEvents: "none",
                            marginRight: "10",
                          }}
                          onClick={stopEventBubble(() => {
                            setSyncSubId(subject.id)
                            setSyncSubject(subject)
                            setModalStates((prev) => ({
                              ...prev,
                              sync: true,
                            }));
                          })}
                        /> : null
                      }
                      {((subject.type === "group" && location.pathname.includes("/groups")) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/groups"))) ?
                        <>
                          <Edit
                            className={classes.editHover}
                            style={{
                              color: "#8F92A1",
                              marginRight: "10",
                            }}
                            onClick={stopEventBubble(() => {
                              setSelectedSubject(subject);
                              setModalStates((prev) => ({
                                ...prev,
                                editSubject: true,
                              }));
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
                        </>
                        : null
                      }
                      {(((subject.type === "kid" && location.pathname.includes("/kids")) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/kids"))  || (subject.type === "group" && !subject.isSync && location.pathname.includes("/kids")))) ?
                        <>
                          <Edit
                            className={classes.editHover}
                            style={{
                              color: "#8F92A1",
                              marginRight: "10",
                            }}
                            onClick={stopEventBubble(() => {
                              setSelectedSubject(subject);
                              setModalStates((prev) => ({
                                ...prev,
                                editSubject: true,
                              }));
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
                        </>
                        : null
                      }
                      {(subject.type === "basic" && location.pathname.includes("/data")) ?
                        <>
                          <Edit
                            className={classes.editHover}
                            style={{
                              color: "#8F92A1",
                              marginRight: "10",
                            }}
                            onClick={stopEventBubble(() => {
                              setSelectedSubject(subject);
                              setModalStates((prev) => ({
                                ...prev,
                                editSubject: true,
                              }));
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
                        </>
                        : null
                      }
                    </Grid>
                  </Grid>
                </AccordionSummary>

                {subject?.subSubject.map((subSubject, idx) => (
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
                            alt=""
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
                        {((subject.type === "kid" && location.pathname.includes("/kids")) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/kids"))) &&
                          <>
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
                          </>}
                        {((subject.type === "group" && location.pathname.includes("/groups") || (!subject.isSync && subject.type === "group" && location.pathname.includes("/kids"))) || (subject.type === "basic" && !subject.isSync && location.pathname.includes("/groups"))) &&
                          <>
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
                          </>}
                        {location.pathname.includes("/data") &&
                          <>
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
                          </>}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                ))}
              </Accordion>
            )
          }}
        </Draggable>
      </div>
    );
  };

  return (
    <Fragment>
      <SimpleModal
        title={<FormattedMessage id="change_sync" />}
        open={modalStates.sync}
        handleClose={closeSync}
      >
        <SyncSubject
          subId={syncSubId}
          subject={syncSubject}
          handleClose={closeSync}
          handleSyncSubject={_handleSyncSubject}
        />
      </SimpleModal>

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
                  alt=""
                />
              </Box>
            )}
            {type == "kid" && (
              <Box mx={2}>
                <img
                  className={classes.image}
                  src={kid?.image || defaultAvatars?.kid}
                  alt=""
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
              startIcon={!restoreLoading && <img src={Reset} alt="" />}
              onClick={() => {
                setRestoreLoading(true);
                restoreDefault(_subjectAdded);
              }}
              disabled={group?.isSpecialReport == false}
            >
              <FormattedMessage id="restore_to_default" />
            </Button>
          )}
          {type == "kid" && (
            <Button
              loading={restoreLoading}
              startIcon={!restoreLoading && <img src={Reset} alt="" />}
              onClick={() => {
                setRestoreLoading(true);
                restoreDefault(_subjectAdded);
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

      <Box ref={boxRef} className={classes.box + " " + "scrollBox"}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div ref={droppableRef}>
            <Droppable droppableId="subject-1">
              {(provider) => (
                <div {...provider.droppableProps} ref={provider.innerRef}>
                  <div className={classes.subjectsContainer}>
                    {subjects.map((el, idx) => renderSubjects(el, idx, handleDragEnd))}
                  </div>
                  {provider.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </Box>

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
              _subSubjectEdit,
              _subjectLock,
              _subjectOrder
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
    // To make report modal scroll
    box: {
      overflowY: "auto",
      overflowX: "hidden",
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
