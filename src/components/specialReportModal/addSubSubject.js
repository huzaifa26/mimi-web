import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "../";
import { nanoid } from "nanoid";
import { getModalStyles } from "../../utils/helpers";
import { useStore, useUi } from "../../store";
import * as yup from "yup";
const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const AddSubSubjectBody = (props) => {
  const { handleClose, subSubjectAdded, selectedSubject, subjects } = props;
  const classes = useStyles();
  const [score, setScore] = useState(0);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const {actions}=useUi();
  //   if (subject.subSubject.length > 0) {
  //     const updatedTotalPoints = Number(subject.totalPoints) + Number(score);
  //     return updatedTotalPoints;
  //   } else {
  //     return score;
  //   }
  // };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   // ------------------------
  //   const id = nanoid();
  //   const pointsSum = handleTotalPoints();
  //   await db
  //     .collection("Institution")
  //     .doc(user?._code)
  //     .collection("groups")
  //     .doc(group.id)
  //     .update({
  //       isSpecialReport: true,
  //     });

  //   const payload = {
  //     id: id,
  //     name: subjectName,
  //     totalPoints: parseInt(score),
  //     obtainedPoints: 0,
  //   };

  //   await db
  //     .collection("Institution")
  //     .doc(user?._code)
  //     .collection("groups")
  //     .doc(group.id)
  //     .collection("report_templates")
  //     .doc(subject.id)
  //     .update({
  //       subSubject: firebase.firestore.FieldValue.arrayUnion(payload),
  //       hasSubSubject: true,
  //       totalPoints: Number(pointsSum),
  //     });

  //   // ------------------------

  //   setLoading(false);
  //   handleClose();
  // };
  const Schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required().min(2).max(20),
      totalPoints: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .positive()
        .min(1)
        .max(9999)
        .required(),
    });
  }, []);
  const _handleSubmit = () => {

    try{
      const id = nanoid();
      let points = 0;
  
      const payload = {
        id: id,
        name: subjectName,
        totalPoints: parseInt(score),
        obtainedPoints: 0,
        subjectId: selectedSubject.id,
      };
      Schema.validateSync(payload)
      const subjectsCopy = [...subjects];
  
      subjectsCopy.map((el) => {
        if (el.id == selectedSubject.id) {
          let isAvail=false;
          el.subSubject.filter((subSub)=>{
            if(subSub.name === payload.name){
              isAvail=true;
            }
          })
          if(!isAvail){
            el.subSubject.push(payload);
            el.subSubject.map((e) => {
              points = e.totalPoints + points;
            });
            el.totalPoints = points;
          }else if(isAvail){
            return actions.alert("Sub subject with this name already exists", "error");
          }
        }
      });
  
      const finalPayload = {
        id: id,
        name: subjectName,
        totalPoints: parseInt(score),
        obtainedPoints: 0,
        subjectId: selectedSubject.id,
        subjectPoints: points,
        isSync:selectedSubject.isSync
      };
    
      subSubjectAdded(subjectsCopy, finalPayload);
      handleClose();
    }
    catch(error){
      actions.alert(error.message, "error");
    }

  };
  
  return (
    <Fragment>
      <Field label={<FormattedMessage id="subject_name" />}>
        <Input
          className={classes.input}
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
      </Field>
      <Field label={<FormattedMessage id="max_score" />}>
        <Input
          inputProps={{ min: 0 }}
          className={classes.input}
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </Field>

      <div className={classes.default_modal_footer}>
        <Grid container>
          <Grid item xs={6} justifyContent="center" spacing={2}>
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={_handleSubmit}
            >
              <FormattedMessage id="add" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
